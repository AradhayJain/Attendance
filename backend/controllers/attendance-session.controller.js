const prisma = require('../utils/db/prisma')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../utils/errors')

// Start an attendance session
const startAttendanceSession = async (req, res) => {
  const { courseId } = req.body
    const  courseInstructorId  = req.user.id;
  if (!courseId || !courseInstructorId) {
    throw new BadRequestError('Please provide courseId')
  }

  // Verify course exists
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  })
  if (!course) throw new NotFoundError('Course not found')

  // Verify course instructor exists and belongs to the course
  const instructor = await prisma.courseInstructor.findUnique({
    where: { id: courseInstructorId },
  })
  if (!instructor) throw new NotFoundError('Course instructor not found')
  if (instructor.courseId !== courseId) {
    throw new BadRequestError('Instructor does not teach this course')
  }

  // Create attendance session
  const session = await prisma.attendanceSession.create({
    data: {
      courseId,
      courseInstructorId,
      startTime: new Date(),
      isActive: true,
    }
  })

  res.status(StatusCodes.CREATED).json({ session })
}

// End an attendance session and mark all unmarked students as absent
const endAttendanceSession = async (req, res) => {
  const { id } = req.params;

  if (!id) throw new BadRequestError('Session ID is required');

  // 1. Fetch session to get courseId
  const session = await prisma.attendanceSession.findUnique({
    where: { id },
    select: { id: true, courseId: true, isActive: true }
  });

  if (!session) throw new NotFoundError('Attendance session not found');
  if (!session.isActive) throw new BadRequestError('Session is already closed');

  // 2. Perform closure and bulk-mark absent in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // A. Close the session
    const updatedSession = await tx.attendanceSession.update({
      where: { id },
      data: {
        endTime: new Date(),
        isActive: false,
      },
    });

    // B. Find all students enrolled in this course
    const enrolledStudents = await tx.enrollment.findMany({
      where: { courseId: session.courseId },
      select: { studentId: true }
    });

    // C. Find students who already have an attendance record (marked via Bluetooth)
    const presentAttendance = await tx.attendance.findMany({
      where: { sessionId: id },
      select: { studentId: true }
    });

    const presentStudentIds = new Set(presentAttendance.map(a => a.studentId));

    // D. Identify students who are enrolled but not marked present
    const absentStudentRecords = enrolledStudents
      .filter(enrollment => !presentStudentIds.has(enrollment.studentId))
      .map(enrollment => ({
        studentId: enrollment.studentId,
        sessionId: id,
        status: 'ABSENT',
        date: new Date()
      }));

    // E. Bulk insert the absence records
    if (absentStudentRecords.length > 0) {
      await tx.attendance.createMany({
        data: absentStudentRecords,
        skipDuplicates: true // Safety check
      });
    }

    return updatedSession;
  });

  res.status(StatusCodes.OK).json({ 
    message: "Session closed and absences recorded", 
    session: result 
  });
};

// Get all attendance sessions
const getAllAttendanceSessions = async (req, res) => {
  const { courseId, isActive } = req.query

  const where = {}
  if (courseId) where.courseId = courseId
  if (isActive !== undefined) where.isActive = isActive === 'true'

  const sessions = await prisma.attendanceSession.findMany({
    where,
    include: {
      course: true,
      instructor: {
        include: {
          teacher: true,
        },
      },
      attendances: true,
    },
    orderBy: { startTime: 'desc' },
  })

  res.status(StatusCodes.OK).json({ sessions, count: sessions.length })
}

// Get attendance session by ID
const getAttendanceSessionById = async (req, res) => {
  const { id } = req.params

  if (!id) throw new BadRequestError('Session ID is required')

  const session = await prisma.attendanceSession.findUnique({
    where: { id },
    include: {
      course: true,
      instructor: {
        include: {
          teacher: true,
        },
      },
      attendances: {
        include: {
          student: true,
        },
      },
    },
  })

  if (!session) throw new NotFoundError('Attendance session not found')

  res.status(StatusCodes.OK).json({ session })
}

module.exports = {
  startAttendanceSession,
  endAttendanceSession,
  getAllAttendanceSessions,
  getAttendanceSessionById,
}

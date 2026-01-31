const prisma = require('../utils/db/prisma')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../utils/errors')
const ExcelJS = require('exceljs');

// Helper: simple attendance select (avoid loading relations by default)
const attendanceSelect = {
  id: true,
  studentId: true,
  sessionId: true,
  date: true,
  status: true,
}

/**
 * Mark Attendance (Student-initiated via Bluetooth discovery)
 * POST /api/attendance
 * Expects: { sessionId: "uuid" } 
 * studentId should ideally come from req.user (Auth Middleware)
 */
const markAttendance = async (req, res) => {
  const { sessionId } = req.body;
  // Use the ID from the authenticated user token for security
  const studentId = req.user.id; 

  if (!sessionId) {
    throw new BadRequestError('Session ID is required');
  }

  // 1. Validate Session Existence and Active Status
  const session = await prisma.attendanceSession.findUnique({
    where: { id: sessionId },
    include: { course: true }
  });

  if (!session) {
    throw new NotFoundError('Attendance session not found');
  }

  if (!session.isActive) {
    throw new BadRequestError('This attendance session has already ended');
  }

  // 2. Proximity Time Window Check (Optional but recommended)
  // e.g., Prevent marking if the session started more than 2 hours ago but was never closed
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  if (session.startTime < twoHoursAgo) {
     throw new BadRequestError('Session has expired. Please ask the instructor to restart.');
  }

  // 3. Verify Student Enrollment
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      studentId: studentId,
      courseId: session.courseId
    }
  });

  if (!enrollment) {
    throw new BadRequestError('You are not enrolled in this course');
  }

  // 4. Create or Update Attendance Record (Upsert prevents duplicates)
  const attendance = await prisma.attendance.upsert({
    where: {
      studentId_sessionId: {
        studentId: studentId,
        sessionId: sessionId,
      },
    },
    update: {
      status: 'PRESENT', // If they were marked absent manually, this "checks them in"
      date: new Date(),
    },
    create: {
      studentId: studentId,
      sessionId: sessionId,
      status: 'PRESENT',
      date: new Date(),
    },
    select: attendanceSelect,
  });

  res.status(StatusCodes.CREATED).json({ 
    message: "Attendance marked successfully", 
    attendance 
  });
}

// Mark a specific student as absent
const markAbsent = async (req, res) => {
  const { id } = req.params

  if (!id) throw new BadRequestError('Attendance ID is required')

  const attendance = await prisma.attendance.findUnique({ where: { id }, select: attendanceSelect })
  if (!attendance) throw new NotFoundError('Attendance record not found')

  const updatedAttendance = await prisma.attendance.update({ where: { id }, data: { status: 'ABSENT' }, select: attendanceSelect })

  res.status(StatusCodes.OK).json({ attendance: updatedAttendance })
}

// Mark a specific student as present
const markPresent = async (req, res) => {
  const { id } = req.params

  if (!id) throw new BadRequestError('Attendance ID is required')

  const attendance = await prisma.attendance.findUnique({ where: { id }, select: attendanceSelect })
  if (!attendance) throw new NotFoundError('Attendance record not found')

  const updatedAttendance = await prisma.attendance.update({ where: { id }, data: { status: 'PRESENT' }, select: attendanceSelect })

  res.status(StatusCodes.OK).json({ attendance: updatedAttendance })
}


// Helper to get Session IDs owned by the current teacher for a specific course
const getTeacherSessionIds = async (teacherId, courseId) => {
  const sessions = await prisma.attendanceSession.findMany({
    where: {
      courseId: courseId,
      instructor: {
        teacherId: teacherId
      }
    },
    select: { id: true }
  });
  return sessions.map(s => s.id);
};

// 1. Get all attendance records (Filtered by Teacher & Course)
const getAllAttendance = async (req, res) => {
  const { courseId, studentId } = req.query;
  const teacherId = req.user.userId;

  if (!courseId) throw new BadRequestError('courseId is required to filter teacher records');

  const sessionIds = await getTeacherSessionIds(teacherId, courseId);

  const where = {
    sessionId: { in: sessionIds }
  };
  if (studentId) where.studentId = studentId;

  const attendances = await prisma.attendance.findMany({ where, select: attendanceSelect });

  res.status(StatusCodes.OK).json({ attendances, count: attendances.length });
}

// 2. Get attendance by date (Filtered by Teacher & Course)
const getAllAttendanceByDate = async (req, res) => {
  const { date } = req.params;
  const { courseId } = req.query;
  const teacherId = req.user.userId;

  if (!courseId) throw new BadRequestError('courseId is required');
  if (!date) throw new BadRequestError('Date is required (YYYY-MM-DD)');

  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const sessionIds = await getTeacherSessionIds(teacherId, courseId);

  const attendances = await prisma.attendance.findMany({
    where: {
      sessionId: { in: sessionIds },
      date: { gte: start, lt: end },
    },
    select: attendanceSelect,
  });

  res.status(StatusCodes.OK).json({ attendances, count: attendances.length });
}

// 3. Get attendance by studentId (Filtered by Teacher & Course)
const getAllAttendanceByStudentId = async (req, res) => {
  const { studentId } = req.params;
  const { courseId } = req.query;
  const teacherId = req.user.userId;

  if (!studentId || !courseId) throw new BadRequestError('studentId and courseId are required');

  const sessionIds = await getTeacherSessionIds(teacherId, courseId);

  const attendances = await prisma.attendance.findMany({
    where: {
      studentId,
      sessionId: { in: sessionIds }
    },
    select: attendanceSelect
  });

  res.status(StatusCodes.OK).json({ attendances, count: attendances.length });
}

// 4. Get consolidated attendance (Coordinator View - Course Wide)
// Returns all raw attendance records for a specific course
const getConsolidatedAttendance = async (req, res) => {
  const { courseId, studentId } = req.query;

  if (!courseId) throw new BadRequestError('courseId is required');

  // 1. Fetch all session IDs for the course
  const sessions = await prisma.attendanceSession.findMany({
    where: { courseId },
    select: { id: true }
  });

  const sessionIds = sessions.map((s) => s.id);
  if (sessionIds.length === 0) {
    return res.status(StatusCodes.OK).json({ attendances: [] });
  }

  // 2. Fetch all raw attendance records
  const attendances = await prisma.attendance.findMany({
    where: {
      sessionId: { in: sessionIds },
      ...(studentId && { studentId }) // Filter by specific student if provided
    },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          rollNo: true
        }
      },
      session: {
        select: {
          id: true,
          startTime: true,
          courseInstructorId: true
        }
      }
    },
    orderBy: {
      date: 'desc'
    }
  });

  res.status(StatusCodes.OK).json({ 
    attendances, 
    count: attendances.length 
  });
}



// 1. Generate Excel for a specific session (Teacher Context)
const GenerateAttendanceXlsx = async (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) throw new BadRequestError('sessionId is required');

  // Fetch records with student details joined
  const attendances = await prisma.attendance.findMany({
    where: { sessionId },
    include: {
      student: true,
      session: { include: { course: true } }
    }
  });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Attendance Session');

  worksheet.columns = [
    { header: 'Student ID', key: 'studentId', width: 15 },
    { header: 'Roll No', key: 'rollNo', width: 15 },
    { header: 'Name', key: 'name', width: 25 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Date', key: 'date', width: 20 },
    { header: 'Status', key: 'status', width: 10 }
  ];

  attendances.forEach((a) => {
    worksheet.addRow({
      studentId: a.studentId,
      rollNo: a.student.rollNo,
      name: a.student.name,
      email: a.student.emailId,
      date: a.date.toLocaleString(),
      status: a.status
    });
  });

  // Styling header
  worksheet.getRow(1).font = { bold: true };

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="attendance_session_${sessionId}.xlsx"`);

  await workbook.xlsx.write(res);
  res.end();
};

// 2. Generate Consolidated Excel for a course (Coordinator Context)
const GenerateAttendanceConsolidated = async (req, res) => {
  const { courseId } = req.body;
  if (!courseId) throw new BadRequestError('courseId is required');

  // 1. Get all sessions for the course
  const sessions = await prisma.attendanceSession.findMany({
    where: { courseId },
    select: { id: true }
  });
  const sessionIds = sessions.map(s => s.id);

  if (sessionIds.length === 0) return res.status(StatusCodes.OK).send('No sessions for course');

  // 2. Get all attendance records
  const attendances = await prisma.attendance.findMany({
    where: { sessionId: { in: sessionIds } },
    include: { student: true }
  });

  // 3. Process data into summary
  const summary = {};
  attendances.forEach((rec) => {
    const sid = rec.studentId;
    if (!summary[sid]) {
      summary[sid] = { 
        stu: rec.student, 
        total: 0, 
        present: 0, 
        absent: 0 
      };
    }
    summary[sid].total += 1;
    rec.status === 'PRESENT' ? summary[sid].present += 1 : summary[sid].absent += 1;
  });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Consolidated Attendance');

  worksheet.columns = [
    { header: 'Student ID', key: 'id', width: 15 },
    { header: 'Roll No', key: 'rollNo', width: 15 },
    { header: 'Name', key: 'name', width: 25 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Total Sessions', key: 'total', width: 15 },
    { header: 'Present', key: 'present', width: 10 },
    { header: 'Absent', key: 'absent', width: 10 },
    { header: 'Percentage (%)', key: 'percentage', width: 15 }
  ];

  Object.values(summary).forEach((data) => {
    const percentage = data.total ? ((data.present / data.total) * 100).toFixed(2) : '0.00';
    worksheet.addRow({
      id: data.stu.id,
      rollNo: data.stu.rollNo,
      name: data.stu.name,
      email: data.stu.emailId,
      total: data.total,
      present: data.present,
      absent: data.absent,
      percentage: percentage
    });
  });

  worksheet.getRow(1).font = { bold: true };

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="consolidated_course_${courseId}.xlsx"`);

  await workbook.xlsx.write(res);
  res.end();
};

module.exports = {
  markAttendance,
  markAbsent,
  markPresent,
  getAllAttendance,
  getAttendanceById,
  getConsolidatedAttendance,
  getAllAttendanceByDate,
  getAllAttendanceByStudentId,
  GenerateAttendanceXlsx,
  GenerateAttendanceConsolidated,
}

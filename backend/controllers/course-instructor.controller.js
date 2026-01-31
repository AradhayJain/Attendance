const prisma = require('../utils/db/prisma')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../utils/errors')

// Register current teacher as course instructor for a course
const registerAsCourseInstructor = async (req, res) => {
  const { courseId } = req.params
  const { role } = req.body
  const teacherId = req.user.id;
  if (!courseId || !role) {
    throw new BadRequestError('Please provide courseId and role')
  }

  // Verify course exists
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  })
  if (!course) throw new NotFoundError('Course not found')


  // Check if teacher is already an instructor for this course
  const existing = await prisma.courseInstructor.findFirst({
    where: {
      teacherId,
      courseId,
    },
  })
  if (existing) throw new BadRequestError('Teacher is already an instructor for this course')

  // Validate role
  const validRoles = ['LECTURER', 'LAB']
  if (!validRoles.includes(role)) {
    throw new BadRequestError(`Role must be one of: ${validRoles.join(', ')}`)
  }

  const courseInstructor = await prisma.courseInstructor.create({
    data: {
      teacherId,
      courseId,
      role,
    },
  })

  res.status(StatusCodes.CREATED).json({ courseInstructor })
}

// Get all course instructors
const getAllCourseInstructors = async (req, res) => {
  const { courseId, teacherId, role } = req.query

  const where = {}
  if (courseId) where.courseId = courseId
  if (teacherId) where.teacherId = teacherId
  if (role) where.role = role

  const instructors = await prisma.courseInstructor.findMany({
    where,
    include: {
      teacher: true,
      course: true,
    },
  })

  res.status(StatusCodes.OK).json({ instructors, count: instructors.length })
}

// Get course instructor by ID
const getCourseInstructorById = async (req, res) => {
  const { id } = req.params

  if (!id) throw new BadRequestError('Course instructor ID is required')

  const instructor = await prisma.courseInstructor.findUnique({
    where: { id },
    include: {
      teacher: true,
      course: true,
    },
  })

  if (!instructor) throw new NotFoundError('Course instructor not found')

  res.status(StatusCodes.OK).json({ instructor })
}

// Delete course instructor by ID
const deleteCourseInstructor = async (req, res) => {
  const { id } = req.params

  if (!id) throw new BadRequestError('Course instructor ID is required')

  const instructor = await prisma.courseInstructor.findUnique({
    where: { id },
  })
  if (!instructor) throw new NotFoundError('Course instructor not found')

  // Delete all attendance  created by this instructor
  await prisma.attendance.deleteMany({
    where: {
      session: {
        courseInstructorId: id,
      },
    },
  })

  // Delete all attendance sessions created by this instructor
  await prisma.attendanceSession.deleteMany({
    where: { courseInstructorId: id },
  })

  // Delete the course instructor
  const deletedInstructor = await prisma.courseInstructor.delete({
    where: { id },
  })

  res.status(StatusCodes.OK).json({
    message: 'Course instructor and all related attendance records deleted successfully',
    instructor: deletedInstructor,
  })
}

module.exports = {
  registerAsCourseInstructor,
  getAllCourseInstructors,
  getCourseInstructorById,
  deleteCourseInstructor,
}

const prisma = require('../utils/db/prisma')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../utils/errors')

// Add a new course
const addCourse = async (req, res) => {
  const { courseCode, courseName, semester, session } = req.body

  if (!courseCode || !courseName || semester === undefined || !session) {
    throw new BadRequestError(
      'Please provide courseCode, courseName, semester, session'
    )
  }

  // Check if course code already exists
  const existingCourse = await prisma.course.findUnique({
    where: { courseCode },
  })
  if (existingCourse) throw new BadRequestError('Course with this code already exists')

  // Verify course coordinator (teacher) exists
  const courseCoordinator = req.user.id;

  const course = await prisma.course.create({
    data: {
      courseCode,
      courseName,
      semester,
      session,
      courseCoordinator,
    }
  })

  res.status(StatusCodes.CREATED).json({ course })
}

// Update a course
const updateCourse = async (req, res) => {
  const { id } = req.params
  const { courseCode, courseName, semester, session, courseCoordinator } = req.body

  if (!id) throw new BadRequestError('Course ID is required')

  // Check if course exists
  const course = await prisma.course.findUnique({
    where: { id },
  })
  if (!course) throw new NotFoundError('Course not found')

  // If courseCode is being updated, check if it's unique
  if (courseCode && courseCode !== course.courseCode) {
    const existingCourse = await prisma.course.findUnique({
      where: { courseCode },
    })
    if (existingCourse) throw new BadRequestError('Course code already exists')
  }

  // If coordinator is being updated, verify the new coordinator exists
  if (courseCoordinator) {
    const coordinator = await prisma.teacher.findUnique({
      where: { id: courseCoordinator },
    })
    if (!coordinator) throw new NotFoundError('Course coordinator (teacher) not found')
  }

  const updateData = {}
  if (courseCode) updateData.courseCode = courseCode
  if (courseName) updateData.courseName = courseName
  if (semester !== undefined) updateData.semester = semester
  if (session) updateData.session = session
  if (courseCoordinator) updateData.courseCoordinator = courseCoordinator

  const updatedCourse = await prisma.course.update({
    where: { id },
    data: updateData
  })

  res.status(StatusCodes.OK).json({ course: updatedCourse })
}

// Delete a course (cascade delete instructors, enrollments, sessions, and attendance records)
const deleteCourse = async (req, res) => {
  const { id } = req.params

  if (!id) throw new BadRequestError('Course ID is required')

  const course = await prisma.course.findUnique({
    where: { id },
  })
  if (!course) throw new NotFoundError('Course not found')

  // Delete all attendance records for this course
  await prisma.attendance.deleteMany({
    where: {
      session: {
        courseId: id,
      },
    },
  })

  // Delete all attendance sessions for this course
  await prisma.attendanceSession.deleteMany({
    where: { courseId: id },
  })

  // Delete all enrollments for this course
  await prisma.enrollment.deleteMany({
    where: { courseId: id },
  })

  // Delete all course instructors for this course
  await prisma.courseInstructor.deleteMany({
    where: { courseId: id },
  })

  // Delete the course
  const deletedCourse = await prisma.course.delete({
    where: { id },
  })

  res.status(StatusCodes.OK).json({
    message: 'Course and all associated records deleted successfully',
    course: deletedCourse,
  })
}

// Get all courses
const getAllCourses = async (req, res) => {
    const id= req.user.id;
  const {semester, session} = req.query
    if(!id){
        throw new BadRequestError('User ID not found in request');
    }
  const where = {id: id};
  if (semester !== undefined) where.semester = parseInt(semester)
  if (session) where.session = session

  const courses = await prisma.course.findMany({
    where,
  })

  res.status(StatusCodes.OK).json({ courses, count: courses.length })
}

// Get course by ID
const getCourseById = async (req, res) => {
  const { id } = req.params

  if (!id) throw new BadRequestError('Course ID is required')

  const course = await prisma.course.findUnique({
    where: { id }
  })

  if (!course) throw new NotFoundError('Course not found')

  res.status(StatusCodes.OK).json({ course })
}

module.exports = {
  addCourse,
  updateCourse,
  deleteCourse,
  getAllCourses,
  getCourseById,
}

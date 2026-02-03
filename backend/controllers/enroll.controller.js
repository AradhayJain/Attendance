const prisma = require('../utils/db/prisma')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../utils/errors')
const fs = require('fs')
const path = require('path')

// Helper: parse CSV file and extract roll numbers
const parseCSV = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf-8')

  const lines = content
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)

  if (lines.length < 2) {
    throw new BadRequestError('CSV file is empty or missing data')
  }

  // Normalize headers
  const headers = lines[0]
    .split(',')
    .map(h => h.trim().toLowerCase())

  // Find column that starts with "roll"
  const rollIndex = headers.findIndex(h =>
    h.startsWith('roll') ||
    h.replace(/[\s_-]/g, '').startsWith('roll')
  )

  if (rollIndex === -1) {
    throw new BadRequestError(
      'CSV must contain a roll number column (e.g. roll, roll_no, roll number)'
    )
  }

  const rollNos = []

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i]
      .split(',')
      .map(field => field.trim())

    const roll = row[rollIndex]

    if (roll) {
      rollNos.push(roll)
    }
  }

  if (rollNos.length === 0) {
    throw new BadRequestError('No roll numbers found in CSV')
  }

  return rollNos
}


// Extract students from CSV and send invitations
const extractStudents = async (req, res) => {
  const { courseId } = req.body

  if (!courseId) throw new BadRequestError('Please provide courseId')
  if (!req.file) throw new BadRequestError('Please upload a CSV file')

  let studentRolls = []
  try {
    studentRolls = parseCSV(req.file.path)
  } catch (err) {
    // Clean up uploaded file
    fs.unlinkSync(req.file.path)
    throw err
  }

  // Verify course exists
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  })
  if (!course) throw new NotFoundError('Course not found')

  // Find students by email and create enrollments with NOT_ENROLLED status
  const createdEnrollments = []
  const failedRoll = []

  for (const email of studentRolls) {
    try {
      const student = await prisma.student.findUnique({
        where: { emailId: email },
      })

      if (!student) {
        failedRoll.push({ email, reason: 'Student not found' })
        continue
      }

      // Check if already enrolled or invited
      const existing = await prisma.enrollment.findFirst({
        where: {
          studentId: student.id,
          courseId,
        },
      })

      if (existing) {
        failedRoll.push({ email, reason: 'Already enrolled or invited' })
        continue
      }

      // Create enrollment with NOT_ENROLLED status (invitation)
      const enrollment = await prisma.enrollment.create({
        data: {
          studentId: student.id,
          courseId,
          enrolled: 'NOT_ENROLLED',
        },
        include: {
          student: true,
          course: true,
        },
      })

      createdEnrollments.push(enrollment)
    } catch (error) {
      failedRoll.push({ email, reason: error.message })
    }
  }

  res.status(StatusCodes.CREATED).json({
    message: 'Students extraction completed',
    created: createdEnrollments,
    failed: failedRoll,
    summary: {
      total: studentRolls.length,
      succeeded: createdEnrollments.length,
      failed: failedRoll.length,
    },
  })

  // Clean up uploaded file after processing
  fs.unlinkSync(req.file.path)
}

// Register student for a course (accept invitation)
const registerCourse = async (req, res) => {
  const { id } = req.params
  const { labGroup } = req.body

  if (!id) throw new BadRequestError('Enrollment ID is required')

  const enrollment = await prisma.enrollment.findUnique({
    where: { id },
  })
  if (!enrollment) throw new NotFoundError('Enrollment invitation not found')

  if (enrollment.enrolled === 'ENROLLED') {
    throw new BadRequestError('Student is already enrolled in this course')
  }

  const updatedEnrollment = await prisma.enrollment.update({
    where: { id },
    data: {
      enrolled: 'ENROLLED',
      labGroup: labGroup || null,
    },
  })

  res.status(StatusCodes.OK).json({
    message: 'Successfully enrolled in course',
    enrollment: updatedEnrollment,
  })
}

// Unenroll student from a course
const unenrollCourse = async (req, res) => {
  const { id } = req.params

  if (!id) throw new BadRequestError('Enrollment ID is required')

  const enrollment = await prisma.enrollment.findUnique({
    where: { id },
    include: {
      student: true,
      course: true,
    },
  })
  if (!enrollment) throw new NotFoundError('Enrollment not found')

  // Delete all attendance records for this student in this course
  await prisma.attendance.deleteMany({
    where: {
      studentId: enrollment.studentId,
      session: {
        courseId: enrollment.courseId,
      },
    },
  })

  // Delete the enrollment
  const deletedEnrollment = await prisma.enrollment.delete({
    where: { id },
  })

  res.status(StatusCodes.OK).json({
    message: 'Successfully unenrolled from course',
    enrollment: deletedEnrollment,
  })
}

// Get all enrolled courses for a student
const getAllEnrolledCourses = async (req, res) => {
  const  studentId  = req.user.id;
  // Verify student exists
  const student = await prisma.student.findUnique({
    where: { id: studentId },
  })
  if (!student) throw new NotFoundError('Student not found')

  const enrollments = await prisma.enrollment.findMany({
    where: {
      studentId,
      enrolled: 'ENROLLED',
    },
    include: {
      course: true,
      student: true,
    },
  })

  res.status(StatusCodes.OK).json({
    courses: enrollments.map((e) => e.course),
    count: enrollments.length,
  })
}

// Get all unenrolled courses (invitations) for a student
const getAllUnenrolledCourses = async (req, res) => {
  const  studentId  = req.user.id;
  // Verify student exists
  const student = await prisma.student.findUnique({
    where: { id: studentId },
  })
  if (!student) throw new NotFoundError('Student not found')

  const enrollments = await prisma.enrollment.findMany({
    where: {
      studentId,
      enrolled: 'NOT_ENROLLED',
    },
    include: {
      course: true,
      student: true,
    },
  })

  res.status(StatusCodes.OK).json({
    invitations: enrollments,
    count: enrollments.length,
  })
}

module.exports = {
  extractStudents,
  registerCourse,
  unenrollCourse,
  getAllEnrolledCourses,
  getAllUnenrolledCourses,
}

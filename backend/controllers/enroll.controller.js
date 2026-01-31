const prisma = require('../utils/db/prisma')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../utils/errors')
const fs = require('fs')
const path = require('path')

// Helper: parse CSV file (basic parser for email column)
const parseCSV = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n').filter((line) => line.trim())
  
  if (lines.length < 2) throw new BadRequestError('CSV file is empty or missing data')
  
  const header = lines[0].toLowerCase().split(',').map((h) => h.trim())
  const emailIndex = header.findIndex((h) => h.includes('email'))
  
  if (emailIndex === -1) throw new BadRequestError('CSV must contain an "email" column')
  
  const emails = []
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',').map((field) => field.trim())
    if (row[emailIndex]) emails.push(row[emailIndex])
  }
  
  return emails
}

// Extract students from CSV and send invitations
const extractStudents = async (req, res) => {
  const { courseId } = req.body

  if (!courseId) throw new BadRequestError('Please provide courseId')
  if (!req.file) throw new BadRequestError('Please upload a CSV file')

  let studentEmails = []
  try {
    studentEmails = parseCSV(req.file.path)
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
  const failedEmails = []

  for (const email of studentEmails) {
    try {
      const student = await prisma.student.findUnique({
        where: { emailId: email },
      })

      if (!student) {
        failedEmails.push({ email, reason: 'Student not found' })
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
        failedEmails.push({ email, reason: 'Already enrolled or invited' })
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
      failedEmails.push({ email, reason: error.message })
    }
  }

  res.status(StatusCodes.CREATED).json({
    message: 'Students extraction completed',
    created: createdEnrollments,
    failed: failedEmails,
    summary: {
      total: studentEmails.length,
      succeeded: createdEnrollments.length,
      failed: failedEmails.length,
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

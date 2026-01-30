const prisma = require('../../utils/db/prisma')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthenticatedError } = require('../../utils/errors')


const teacherRegister = async (req, res) => {
  const { emailId, password, department } = req.body
  if (!emailId || !password) throw new BadRequestError('Please provide email and password')

  const existing = await prisma.teacher.findUnique({ where: { emailId } })
  if (existing) throw new BadRequestError('Email already in use')

  const salt = await bcrypt.genSalt(10)
  const passwordHash = await bcrypt.hash(password, salt)

  const teacher = await prisma.teacher.create({
    data: {
      emailId,
      passwordHash,
      department,
    },
  })

  const token = jwt.sign(
    { id: teacher.id, name: null, email: teacher.emailId, role: 'Teacher' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_LIFETIME }
  )

  res.status(StatusCodes.CREATED).json({ teacher: { id: teacher.id, email: teacher.emailId, department: teacher.department }, token })
}
const teacherLogin = async (req, res) => {
  const { emailId, password } = req.body
  if (!emailId || !password) throw new BadRequestError('Please provide email and password')

  const teacher = await prisma.teacher.findUnique({ where: { emailId } })
  if (!teacher) throw new UnauthenticatedError('Invalid Credentials')

  const isMatch = await bcrypt.compare(password, teacher.passwordHash)
  if (!isMatch) throw new UnauthenticatedError('Invalid Credentials')

  const token = jwt.sign(
    { id: teacher.id, name: null, email: teacher.emailId, role: 'Teacher' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_LIFETIME }
  )

  res.status(StatusCodes.OK).json({ teacher: { id: teacher.id, email: teacher.emailId, department: teacher.department }, token })
}

module.exports = {
  teacherRegister,
  teacherLogin,
}
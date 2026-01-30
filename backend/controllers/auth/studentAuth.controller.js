const prisma = require('../../utils/db/prisma')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthenticatedError } = require('../../utils/errors')


const studentRegister = async (req, res) => {
  const { rollNo, name, emailId, password, program, department } = req.body
  if (!emailId || !password || !name || !rollNo || !program || !department) throw new BadRequestError('Please provide name, rollNo, email, password, program and department')

  const existingByEmail = await prisma.student.findUnique({ where: { emailId } })
  if (existingByEmail) throw new BadRequestError('Email already in use')
  const existingByRoll = await prisma.student.findUnique({ where: { rollNo } })
  if (existingByRoll) throw new BadRequestError('Roll number already in use')

  const salt = await bcrypt.genSalt(10)
  const passwordHash = await bcrypt.hash(password, salt)

  const student = await prisma.student.create({
    data: {
      rollNo,
      name,
      emailId,
      passwordHash,
      program,
      department,
    },
  })

  const token = jwt.sign(
    { id: student.id, name: student.name, email: student.emailId, role: 'student' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_LIFETIME }
  )

  res.status(StatusCodes.CREATED).json({
    student: { id: student.id, name: student.name, email: student.emailId, rollNo: student.rollNo },
    token,
  })
}
const studentLogin = async (req, res) => {
  const { emailId, password } = req.body
  if (!emailId || !password) throw new BadRequestError('Please provide email and password')

  const student = await prisma.student.findUnique({ where: { emailId } })
  if (!student) throw new UnauthenticatedError('Invalid Credentials')

  const isMatch = await bcrypt.compare(password, student.passwordHash)
  if (!isMatch) throw new UnauthenticatedError('Invalid Credentials')

  const token = jwt.sign(
    { id: student.id, name: student.name, email: student.emailId, role: 'student' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_LIFETIME }
  )

  res.status(StatusCodes.OK).json({ student: { id: student.id, name: student.name, email: student.emailId, rollNo: student.rollNo }, token })
}

module.exports = {
  studentRegister,
  studentLogin,
}
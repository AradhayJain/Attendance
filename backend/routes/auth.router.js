const express = require('express')
const router = express.Router()
const {studentLogin, studentRegister } = require('../controllers/auth/studentAuth.controller')
const {teacherRegister, teacherLogin} = require('../controllers/auth/teacherAuth.controller')

router.post('/register/teacher', teacherRegister)
router.post('/login/teacher', teacherLogin)
router.post('/register/student', studentRegister)
router.post('/login/student', studentLogin)

module.exports = router
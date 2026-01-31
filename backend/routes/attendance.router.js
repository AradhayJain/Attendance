const express = require('express')
const router = express.Router()
const coordinatorAllowedMiddleware=require('../middleware/allowed/coordinator');
const teacherAllowedMiddleware=require('../middleware/allowed/teacher');
const {markAttendance,markAbsent, markPresent,getAllAttendanceByDate,getAllAttendanceByStudentId, getAllAttendance, getAttendanceById, getConsolidatedAttendance, GenerateAttendanceXlsx, GenerateAttendanceConsolidated} = require('../controllers/attendance.controller')

router.post('/',markAttendance) // Students  marks their attendance (all present absent logic in frontend)
router.patch('/:id', teacherAllowedMiddleware,markAbsent) 
router.patch('/:id', teacherAllowedMiddleware,markPresent) 
router.get('/', getAllAttendance)
router.get('/by-date/:date', getAllAttendanceByDate)
router.get('/by-student/:studentId', getAllAttendanceByStudentId)
router.get('/:id', getAttendanceById) //by session id and student id
router.get('/consolidated',getConsolidatedAttendance) // can be accessed by course coordinator only 
router.post('/xlsx', teacherAllowedMiddleware,GenerateAttendanceXlsx)
router.post('/xlsx/consolidated',teacherAllowedMiddleware,coordinatorAllowedMiddleware, GenerateAttendanceConsolidated)
module.exports = router
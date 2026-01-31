const express = require('express')
const router = express.Router()
// const coordinatorAllowedMiddleware=require('../middleware/allowed/coordinator');
const {startAttendanceSession,endAttendanceSession, markPresent, getAllAttendanceSessions, getAttendanceSessionById} = require('../controllers/attendance-session.controller')

router.post('/',startAttendanceSession) // Teacher starts the attendance session.
router.patch('/:id', endAttendanceSession) // set isactive False //// End an attendance session and mark all unmarked students as absent
router.get('/', getAllAttendanceSessions)
router.get('/:id', getAttendanceSessionById)
module.exports = router
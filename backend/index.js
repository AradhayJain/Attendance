require('dotenv').config();
require('express-async-errors');


// extra security packages
const helmet=require('helmet');
const cors=require('cors');
const xss=require('xss-clean');
const rateLimiter=require('express-rate-limit');

const connectDB= require('./utils/db/connect');
const express = require('express');
const app = express();


// routers
const authRouter=require('./routes/auth.router');
const courseRouter=require('./routes/course.router');
const enrollRouter=require('./routes/enroll.router');
const attendanceRouter=require('./routes/attendance.router');
const attendanceSessionRouter=require('./routes/attendanceSession.router');
const courseInstructorRouter=require('./routes/courseInstructor.router');

// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');
const authenticationMiddleware=require('./middleware/allowed/authentication');

// Middleware
const teacherAllowedMiddleware=require('./middleware/allowed/teacher');

app.set('trust proxy',1);
app.use(
  rateLimiter({
    windowMs:15*60*1000,
    max:100,
  })
);
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(helmet());
app.use(cors());
app.use(xss());

app.use('/api/v1/auth',authRouter);
app.use('/api/v1/course',authenticationMiddleware,teacherAllowedMiddleware,courseRouter);
app.use('/api/v1/ci',authenticationMiddleware,teacherAllowedMiddleware,courseInstructorRouter);
app.use('/api/v1/enroll',authenticationMiddleware,enrollRouter);
app.use('/api/v1/attendance',authenticationMiddleware,attendanceRouter);
app.use('/api/v1/attendance-session',authenticationMiddleware,attendanceSessionRouter);


app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log("DB connected");
    
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();

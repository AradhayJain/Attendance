require('dotenv').config();
require('express-async-errors');


// extra security packages
const helmet=require('helmet');
const cors=require('cors');
const xss=require('xss-clean');
const rateLimiter=require('express-rate-limit');

const express = require('express');
const app = express();
const prisma = require('./utils/db/prisma');

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

// cron jobs
const { initScheduledJobs } = require('./utils/cron-jobs/sessionCleanup');

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

// --- ROUTES ---

// Public routes
app.use('/api/v1/auth', authRouter);

// Student & Teacher accessible routes
// (authenticationMiddleware sets req.user)
app.use('/api/v1/enroll', authenticationMiddleware, enrollRouter);
app.use('/api/v1/attendance', authenticationMiddleware, attendanceRouter);

// Teacher-Only routes
app.use('/api/v1/course', authenticationMiddleware, teacherAllowedMiddleware, courseRouter);
app.use('/api/v1/ci', authenticationMiddleware, teacherAllowedMiddleware, courseInstructorRouter);
app.use('/api/v1/attendance-session', authenticationMiddleware, teacherAllowedMiddleware, attendanceSessionRouter);

// Error Middlewares
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

// Initialize Cron Jobs
initScheduledJobs();

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    // This pings the Postgres DB to ensure credentials are correct
    await prisma.$connect();
    console.log("PostgreSQL connected via Prisma");

    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

start();

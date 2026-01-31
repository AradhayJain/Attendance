const cron = require('node-cron');
const prisma = require('../db/prisma');

const initScheduledJobs = () => {
  // Run every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    console.log('--- Checking for forgotten attendance sessions ---');
    
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    try {
      const staleSessions = await prisma.attendanceSession.findMany({
        where: {
          isActive: true,
          startTime: { lt: twoHoursAgo }
        }
      });

      if (staleSessions.length === 0) return;

      for (const session of staleSessions) {
        await prisma.$transaction(async (tx) => {
          // 1. Close session
          await tx.attendanceSession.update({
            where: { id: session.id },
            data: { isActive: false, endTime: new Date() }
          });

          // 2. Identify and mark absent students
          const enrolled = await tx.enrollment.findMany({
            where: { courseId: session.courseId },
            select: { studentId: true }
          });

          const present = await tx.attendance.findMany({
            where: { sessionId: session.id },
            select: { studentId: true }
          });

          const presentIds = new Set(present.map(p => p.studentId));
          const absentRecords = enrolled
            .filter(e => !presentIds.has(e.studentId))
            .map(e => ({
              studentId: e.studentId,
              sessionId: session.id,
              status: 'ABSENT',
              date: new Date()
            }));

          if (absentRecords.length > 0) {
            await tx.attendance.createMany({ data: absentRecords, skipDuplicates: true });
          }
        });
        console.log(`Successfully auto-closed session: ${session.id}`);
      }
    } catch (error) {
      console.error('Error in cron job:', error);
    }
  });
};

module.exports = { initScheduledJobs };
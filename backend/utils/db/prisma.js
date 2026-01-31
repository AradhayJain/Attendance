// backend/utils/db/prisma.js
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log: ["query", "error", "warn"], // optional but useful
});

module.exports = prisma;

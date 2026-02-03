const fs = require('fs')
const path = require('path')
const XLSX = require('xlsx')
const { BadRequestError } = require('../utils/errors')

const normalizeHeader = (h) =>
  h.trim().toLowerCase().replace(/[\s_-]/g, '')

const findRollIndex = (headers) =>
  headers.findIndex(h => normalizeHeader(h).startsWith('roll'))

/* ---------------- CSV PARSER ---------------- */
const parseCSV = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf-8')

  const lines = content
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)

  if (lines.length < 2) {
    throw new BadRequestError('CSV file is empty or missing data')
  }

  const headers = lines[0].split(',')
  const rollIndex = findRollIndex(headers)

  if (rollIndex === -1) {
    throw new BadRequestError(
      'CSV must contain a roll number column (e.g. roll, roll_no, roll number)'
    )
  }

  const rollNos = []

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',').map(f => f.trim())
    const roll = row[rollIndex]
    if (roll) rollNos.push(roll)
  }

  if (!rollNos.length) {
    throw new BadRequestError('No roll numbers found in CSV')
  }

  return rollNos
}

/* ---------------- EXCEL PARSER ---------------- */
const parseExcel = (filePath) => {
  const workbook = XLSX.readFile(filePath)
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]

  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 })

  if (rows.length < 2) {
    throw new BadRequestError('Excel file is empty or missing data')
  }

  const headers = rows[0]
  const rollIndex = findRollIndex(headers)

  if (rollIndex === -1) {
    throw new BadRequestError(
      'Excel must contain a roll number column (e.g. roll, roll_no, roll number)'
    )
  }

  const rollNos = []

  for (let i = 1; i < rows.length; i++) {
    const roll = rows[i][rollIndex]
    if (roll) rollNos.push(String(roll).trim())
  }

  if (!rollNos.length) {
    throw new BadRequestError('No roll numbers found in Excel file')
  }

  return rollNos
}

/* ---------------- MAIN EXPORT ---------------- */
const parseFile = (filePath) => {
  const ext = path.extname(filePath).toLowerCase()

  if (ext === '.csv') return parseCSV(filePath)
  if (ext === '.xlsx' || ext === '.xls') return parseExcel(filePath)

  throw new BadRequestError('Unsupported file type. Upload CSV or Excel file')
}

module.exports = parseFile

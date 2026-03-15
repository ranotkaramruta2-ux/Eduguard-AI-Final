import csv from 'csv-parser';
import fs from 'fs';
import { Readable } from 'stream';

/**
 * Parse CSV file and return array of objects
 * @param {String} filePath - Path to CSV file
 * @returns {Promise<Array>} Array of parsed objects
 */
export const parseCSVFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};

/**
 * Parse CSV buffer and return array of objects
 * @param {Buffer} buffer - CSV file buffer
 * @returns {Promise<Array>} Array of parsed objects
 */
export const parseCSVBuffer = (buffer) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = Readable.from(buffer.toString());

    stream
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};

/**
 * Validate CSV data structure for student records
 * @param {Array} data - Parsed CSV data
 * @returns {Object} Validation result
 */
export const validateStudentCSV = (data) => {
  // Only name and roll number are strictly required.
  // All numeric fields are optional and will default to 0 if missing/empty.
  const requiredFields = ['name', 'rollNumber'];

  const errors = [];
  const validData = [];

  data.forEach((row, index) => {
    const missingFields = requiredFields.filter((field) => !row[field]);

    if (missingFields.length > 0) {
      errors.push({
        row: index + 1,
        message: `Missing required fields: ${missingFields.join(', ')}`,
      });
    } else {
      // Convert numeric fields
      try {
        const numOrZero = (val) => {
          if (val === undefined || val === null || val === '') return 0;
          const parsed = Number(val);
          if (Number.isNaN(parsed)) {
            throw new Error(`Invalid number value "${val}"`);
          }
          return parsed;
        };

        validData.push({
          name: row.name.trim(),
          rollNumber: row.rollNumber.trim().toUpperCase(),
          email: row.email?.trim() || undefined,
          phoneNumber: row.phoneNumber?.trim() || undefined,
          attendancePercentage: numOrZero(row.attendancePercentage),
          internalMarks: numOrZero(row.internalMarks),
          assignmentCompletion: numOrZero(row.assignmentCompletion),
          familyIncome: numOrZero(row.familyIncome),
          travelDistance: numOrZero(row.travelDistance),
          previousFailures: numOrZero(row.previousFailures),
          engagementScore: numOrZero(row.engagementScore),
        });
      } catch (err) {
        errors.push({
          row: index + 1,
          message: `Invalid data format: ${err.message}`,
        });
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    validData,
  };
};

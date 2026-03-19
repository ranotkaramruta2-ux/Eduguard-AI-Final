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
 */
export const validateStudentCSV = (data) => {
  const requiredFields = ['name', 'rollNumber'];
  const errors = [];
  const validData = [];

  data.forEach((row, index) => {
    const missingFields = requiredFields.filter((field) => !row[field]);

    if (missingFields.length > 0) {
      errors.push({ row: index + 1, message: `Missing required fields: ${missingFields.join(', ')}` });
    } else {
      try {
        const numOrZero = (val) => {
          if (val === undefined || val === null || val === '') return 0;
          const parsed = Number(val);
          if (Number.isNaN(parsed)) throw new Error(`Invalid number value "${val}"`);
          return parsed;
        };

        const toBool = (val) => {
          if (val === undefined || val === null || val === '') return false;
          return val === 'true' || val === '1' || val === 'yes';
        };

        const scholarshipVal = (row.scholarshipStatus || '').toLowerCase().trim();
        const validScholarship = ['none', 'partial', 'full'].includes(scholarshipVal) ? scholarshipVal : 'none';

        validData.push({
          name: row.name.trim(),
          rollNumber: row.rollNumber.trim().toUpperCase(),
          email: row.email?.trim() || undefined,
          phoneNumber: row.phoneNumber?.trim() || undefined,
          // academic
          attendancePercentage: numOrZero(row.attendancePercentage),
          internalMarks: numOrZero(row.internalMarks),
          assignmentCompletion: numOrZero(row.assignmentCompletion),
          previousFailures: numOrZero(row.previousFailures),
          engagementScore: numOrZero(row.engagementScore),
          // financial
          familyIncome: numOrZero(row.familyIncome),
          travelDistance: numOrZero(row.travelDistance),
          scholarshipStatus: validScholarship,
          partTimeJob: toBool(row.partTimeJob),
          numberOfDependents: numOrZero(row.numberOfDependents),
          // behavioural
          disciplinaryActions: numOrZero(row.disciplinaryActions),
          socialMediaHours: numOrZero(row.socialMediaHours),
          extracurricularParticipation: toBool(row.extracurricularParticipation),
          // medical
          hasChronicIllness: toBool(row.hasChronicIllness),
          mentalHealthConcern: toBool(row.mentalHealthConcern),
          missedDueMedical: numOrZero(row.missedDueMedical),
        });
      } catch (err) {
        errors.push({ row: index + 1, message: `Invalid data format: ${err.message}` });
      }
    }
  });

  return { isValid: errors.length === 0, errors, validData };
};

/**
 * Calculate risk score based on student data
 * @param {Object} studentData - Student academic and behavioral data
 * @returns {Number} Risk score (0-100)
 */
export const calculateRiskScore = (studentData) => {
  let score = 0;

  const {
    attendancePercentage = 100,
    internalMarks = 100,
    assignmentCompletion = 100,
    previousFailures = 0,
    engagementScore = 100,
  } = studentData;

  // Attendance weight: 25 points max
  if (attendancePercentage < 50) score += 25;
  else if (attendancePercentage < 70) score += 15;
  else if (attendancePercentage < 85) score += 5;

  // Internal marks weight: 20 points max
  if (internalMarks < 40) score += 20;
  else if (internalMarks < 60) score += 10;
  else if (internalMarks < 75) score += 5;

  // Assignment completion weight: 15 points max
  if (assignmentCompletion < 40) score += 15;
  else if (assignmentCompletion < 60) score += 8;

  // Previous failures weight: 20 points max
  if (previousFailures >= 3) score += 20;
  else if (previousFailures >= 1) score += 10;

  // Engagement score weight: 20 points max
  if (engagementScore < 30) score += 20;
  else if (engagementScore < 50) score += 10;
  else if (engagementScore < 70) score += 5;

  return Math.min(score, 100);
};

/**
 * Determine risk level based on risk score
 * @param {Number} score - Risk score
 * @returns {String} Risk level (low, medium, high)
 */
export const getRiskLevel = (score) => {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
};

/**
 * Get recommendation based on risk level
 * @param {String} level - Risk level
 * @returns {String} Recommendation
 */
export const getRiskRecommendation = (level) => {
  switch (level) {
    case 'high':
      return 'Immediate counseling intervention recommended. Assign a counselor and schedule regular check-ins. Monitor academic progress closely.';
    case 'medium':
      return 'Monitor closely. Consider peer mentoring and academic support programs. Regular follow-ups recommended.';
    case 'low':
      return 'Student is on track. Continue regular engagement and periodic check-ins.';
    default:
      return 'Assessment needed.';
  }
};

/**
 * Format date to readable string
 * @param {Date} date - Date object
 * @returns {String} Formatted date
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

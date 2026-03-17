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
 * Generate human-readable risk factors based on student data
 * @param {Object} studentData - Student academic and behavioral data
 * @returns {Array<string>} List of risk factor descriptions
 */
export const getRiskFactors = (studentData) => {
  const factors = [];
  const {
    attendancePercentage = 100,
    internalMarks = 100,
    assignmentCompletion = 100,
    previousFailures = 0,
    engagementScore = 100,
    familyIncome,
    travelDistance,
  } = studentData;

  if (attendancePercentage < 50) factors.push('Critically low attendance (below 50%)');
  else if (attendancePercentage < 70) factors.push('Poor attendance (below 70%)');
  else if (attendancePercentage < 85) factors.push('Below average attendance (below 85%)');

  if (internalMarks < 40) factors.push('Very low internal marks (below 40%)');
  else if (internalMarks < 60) factors.push('Below average internal marks (below 60%)');
  else if (internalMarks < 75) factors.push('Slightly low internal marks (below 75%)');

  if (assignmentCompletion < 40) factors.push('Very low assignment completion rate (below 40%)');
  else if (assignmentCompletion < 60) factors.push('Low assignment completion rate (below 60%)');

  if (previousFailures >= 3) factors.push(`Multiple previous failures (${previousFailures} failures)`);
  else if (previousFailures >= 1) factors.push(`History of academic failures (${previousFailures} failure${previousFailures > 1 ? 's' : ''})`);

  if (engagementScore < 30) factors.push('Very low classroom engagement');
  else if (engagementScore < 50) factors.push('Low classroom engagement');
  else if (engagementScore < 70) factors.push('Below average engagement');

  if (familyIncome !== undefined && familyIncome < 100000) factors.push('Low family income (financial risk)');
  if (travelDistance !== undefined && travelDistance > 30) factors.push(`Long travel distance (${travelDistance} km)`);

  return factors.length > 0 ? factors : ['No significant risk factors detected'];
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

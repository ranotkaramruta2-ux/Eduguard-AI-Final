/**
 * Calculate risk score based on student data (academic + financial + behavioural + medical)
 * @param {Object} studentData
 * @returns {Number} Risk score 0-100
 */
export const calculateRiskScore = (studentData) => {
  let score = 0;

  const {
    attendancePercentage = 100,
    internalMarks = 100,
    assignmentCompletion = 100,
    previousFailures = 0,
    engagementScore = 100,
    familyIncome,
    travelDistance = 0,
    // financial
    scholarshipStatus = 'none',
    partTimeJob = false,
    numberOfDependents = 0,
    // behavioural
    disciplinaryActions = 0,
    socialMediaHours = 0,
    extracurricularParticipation = false,
    // medical
    hasChronicIllness = false,
    mentalHealthConcern = false,
    missedDueMedical = 0,
  } = studentData;

  // ── Academic (55 pts max) ──────────────────────────────────────────────────
  if (attendancePercentage < 50) score += 20;
  else if (attendancePercentage < 70) score += 12;
  else if (attendancePercentage < 85) score += 5;

  if (internalMarks < 40) score += 15;
  else if (internalMarks < 60) score += 8;
  else if (internalMarks < 75) score += 3;

  if (assignmentCompletion < 40) score += 10;
  else if (assignmentCompletion < 60) score += 5;

  if (previousFailures >= 3) score += 10;
  else if (previousFailures >= 1) score += 5;

  if (engagementScore < 30) score += 10;
  else if (engagementScore < 50) score += 6;
  else if (engagementScore < 70) score += 2;

  // ── Financial (20 pts max) ─────────────────────────────────────────────────
  if (familyIncome !== undefined && familyIncome < 100000) score += 8;
  else if (familyIncome !== undefined && familyIncome < 200000) score += 4;

  if (scholarshipStatus === 'none' && familyIncome !== undefined && familyIncome < 150000) score += 4;
  if (partTimeJob) score += 4;
  if (numberOfDependents >= 3) score += 4;
  else if (numberOfDependents >= 1) score += 2;

  if (travelDistance > 30) score += 3;
  else if (travelDistance > 15) score += 1;

  // ── Behavioural (15 pts max) ───────────────────────────────────────────────
  if (disciplinaryActions >= 3) score += 8;
  else if (disciplinaryActions >= 1) score += 4;

  if (socialMediaHours >= 6) score += 5;
  else if (socialMediaHours >= 4) score += 2;

  if (!extracurricularParticipation) score += 2;

  // ── Medical (10 pts max) ───────────────────────────────────────────────────
  if (mentalHealthConcern) score += 5;
  if (hasChronicIllness) score += 3;
  if (missedDueMedical >= 10) score += 5;
  else if (missedDueMedical >= 5) score += 3;
  else if (missedDueMedical >= 2) score += 1;

  return Math.min(score, 100);
};

/**
 * Determine risk level based on risk score
 */
export const getRiskLevel = (score) => {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
};

/**
 * Generate categorised risk factors and determine dominant counselor type.
 * Returns { factors, counselorType }
 * counselorType: 'academic' | 'financial' | 'behavioral' | 'medical' | 'general'
 */
export const getRiskFactors = (studentData) => {
  const {
    attendancePercentage = 100,
    internalMarks = 100,
    assignmentCompletion = 100,
    previousFailures = 0,
    engagementScore = 100,
    familyIncome,
    travelDistance = 0,
    scholarshipStatus = 'none',
    partTimeJob = false,
    numberOfDependents = 0,
    disciplinaryActions = 0,
    socialMediaHours = 0,
    extracurricularParticipation = false,
    hasChronicIllness = false,
    mentalHealthConcern = false,
    missedDueMedical = 0,
  } = studentData;

  const academic = [];
  const financial = [];
  const behavioral = [];
  const medical = [];

  // Academic
  if (attendancePercentage < 50) academic.push('Critically low attendance (below 50%)');
  else if (attendancePercentage < 70) academic.push('Poor attendance (below 70%)');
  else if (attendancePercentage < 85) academic.push('Below average attendance (below 85%)');

  if (internalMarks < 40) academic.push('Very low internal marks (below 40%)');
  else if (internalMarks < 60) academic.push('Below average internal marks (below 60%)');
  else if (internalMarks < 75) academic.push('Slightly low internal marks (below 75%)');

  if (assignmentCompletion < 40) academic.push('Very low assignment completion (below 40%)');
  else if (assignmentCompletion < 60) academic.push('Low assignment completion (below 60%)');

  if (previousFailures >= 3) academic.push(`Multiple previous failures (${previousFailures})`);
  else if (previousFailures >= 1) academic.push(`History of academic failures (${previousFailures})`);

  if (engagementScore < 30) academic.push('Very low classroom engagement');
  else if (engagementScore < 50) academic.push('Low classroom engagement');
  else if (engagementScore < 70) academic.push('Below average engagement');

  // Financial
  if (familyIncome !== undefined && familyIncome < 100000) financial.push('Very low family income (below ₹1L)');
  else if (familyIncome !== undefined && familyIncome < 200000) financial.push('Low family income (below ₹2L)');

  if (scholarshipStatus === 'none' && familyIncome !== undefined && familyIncome < 150000)
    financial.push('No scholarship despite financial need');

  if (partTimeJob) financial.push('Working part-time job (time conflict risk)');
  if (numberOfDependents >= 3) financial.push(`High family dependency burden (${numberOfDependents} dependents)`);
  else if (numberOfDependents >= 1) financial.push(`Supporting ${numberOfDependents} dependent(s)`);

  if (travelDistance > 30) financial.push(`Long commute distance (${travelDistance} km)`);
  else if (travelDistance > 15) financial.push(`Moderate commute distance (${travelDistance} km)`);

  // Behavioural
  if (disciplinaryActions >= 3) behavioral.push(`Frequent disciplinary issues (${disciplinaryActions} actions)`);
  else if (disciplinaryActions >= 1) behavioral.push(`Disciplinary record (${disciplinaryActions} action${disciplinaryActions > 1 ? 's' : ''})`);

  if (socialMediaHours >= 6) behavioral.push(`Excessive social media usage (${socialMediaHours} hrs/day)`);
  else if (socialMediaHours >= 4) behavioral.push(`High social media usage (${socialMediaHours} hrs/day)`);

  if (!extracurricularParticipation) behavioral.push('No extracurricular participation');

  // Medical
  if (mentalHealthConcern) medical.push('Reported mental health concern');
  if (hasChronicIllness) medical.push('Chronic illness affecting attendance');
  if (missedDueMedical >= 10) medical.push(`High medical absences (${missedDueMedical} days)`);
  else if (missedDueMedical >= 5) medical.push(`Significant medical absences (${missedDueMedical} days)`);
  else if (missedDueMedical >= 2) medical.push(`Some medical absences (${missedDueMedical} days)`);

  // Determine dominant counselor type by weighted score per category
  const scores = {
    academic: academic.length * 3,
    financial: financial.length * 3,
    behavioral: behavioral.length * 3,
    medical: medical.length * 4, // medical weighted higher
  };

  const dominant = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  const counselorType = dominant[1] > 0 ? dominant[0] : 'general';

  const allFactors = [
    ...academic.map(f => `[Academic] ${f}`),
    ...financial.map(f => `[Financial] ${f}`),
    ...behavioral.map(f => `[Behavioral] ${f}`),
    ...medical.map(f => `[Medical] ${f}`),
  ];

  return {
    factors: allFactors.length > 0 ? allFactors : ['No significant risk factors detected'],
    counselorType,
    breakdown: { academic, financial, behavioral, medical },
  };
};

/**
 * Get recommendation based on risk level
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
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

import { Student } from './constants';

export function getRiskLevel(score: number): 'low' | 'medium' | 'high' {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

export function getRiskRecommendation(level: 'low' | 'medium' | 'high'): string {
  switch (level) {
    case 'high': return 'Immediate counseling intervention recommended. Assign a counselor and schedule regular check-ins.';
    case 'medium': return 'Monitor closely. Consider peer mentoring and academic support programs.';
    case 'low': return 'Student is on track. Continue regular engagement and periodic check-ins.';
  }
}

export function calculateRiskScore(student: Partial<Student>): number {
  let score = 0;
  const att = student.attendancePercentage ?? 100;
  const marks = student.internalMarks ?? 100;
  const assign = student.assignmentCompletion ?? 100;
  const failures = student.previousFailures ?? 0;
  const engagement = student.engagementScore ?? 100;

  if (att < 50) score += 25; else if (att < 70) score += 15; else if (att < 85) score += 5;
  if (marks < 40) score += 20; else if (marks < 60) score += 10; else if (marks < 75) score += 5;
  if (assign < 40) score += 15; else if (assign < 60) score += 8;
  if (failures >= 3) score += 20; else if (failures >= 1) score += 10;
  if (engagement < 30) score += 20; else if (engagement < 50) score += 10; else if (engagement < 70) score += 5;

  return Math.min(score, 100);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

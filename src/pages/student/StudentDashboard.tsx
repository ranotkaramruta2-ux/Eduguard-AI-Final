import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import StatCard from '@/components/StatCard';
import RiskBadge from '@/components/RiskBadge';
import { ShieldAlert, UserCheck, MessageSquare, GraduationCap, RefreshCw, Loader2, BarChart2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { counselingAPI, scoreHistoryAPI, behaviouralFeedbackAPI, ScoreSnapshot, BehaviouralFeedbackData } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

const SEVERITY_STYLES: Record<string, string> = {
  positive: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  minor_concern: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  major_concern: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};
const SEVERITY_LABELS: Record<string, string> = {
  positive: 'Positive', minor_concern: 'Minor Concern', major_concern: 'Major Concern',
};

function Trend({ current, previous }: { current: number; previous?: number }) {
  if (previous === undefined) return null;
  if (current > previous) return <TrendingUp className="h-3.5 w-3.5 text-green-500" />;
  if (current < previous) return <TrendingDown className="h-3.5 w-3.5 text-red-500" />;
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const { students, fetchStudents, loadingStudents } = useData();
  const navigate = useNavigate();
  const [counselingHistory, setCounselingHistory] = useState<any[]>([]);
  const [loadingCounseling, setLoadingCounseling] = useState(false);
  const [scoreHistory, setScoreHistory] = useState<ScoreSnapshot[]>([]);
  const [feedbacks, setFeedbacks] = useState<BehaviouralFeedbackData[]>([]);

  // Find this student's record
  const myStudent = students.find(s => s.userId === user?.id);

  useEffect(() => {
    if (myStudent?.id) {
      loadCounselingHistory(myStudent.id);
      loadScoreHistory(myStudent.id);
      loadFeedbacks(myStudent.id);
    }
  }, [myStudent?.id]);

  const loadCounselingHistory = async (studentId: string) => {
    setLoadingCounseling(true);
    try {
      const res = await counselingAPI.getForStudent(studentId);
      setCounselingHistory(res.data);
    } catch (err) {
      console.error('Failed to load counseling history:', err);
    } finally {
      setLoadingCounseling(false);
    }
  };

  const loadScoreHistory = async (studentId: string) => {
    try {
      const res = await scoreHistoryAPI.getForStudent(studentId);
      setScoreHistory(res.data);
    } catch (err) {
      console.error('Failed to load score history:', err);
    }
  };

  const loadFeedbacks = async (studentId: string) => {
    try {
      const res = await behaviouralFeedbackAPI.getForStudent(studentId);
      setFeedbacks(res.data);
    } catch (err) {
      console.error('Failed to load feedbacks:', err);
    }
  };

  const totalNotes = counselingHistory.reduce((a, r) => a + (r.notes?.length || 0), 0);
  const latestSnapshot = scoreHistory[0];
  const prevSnapshot = scoreHistory[1];
  const positiveCount = feedbacks.filter(f => f.severity === 'positive').length;
  const concernCount = feedbacks.filter(f => f.severity !== 'positive').length;

  if (loadingStudents) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
        <span className="text-muted-foreground">Loading your profile...</span>
      </div>
    );
  }

  if (!myStudent) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-muted-foreground">No student record found for your account.</p>
        <p className="text-xs text-muted-foreground">Your teacher needs to add you to the system using your email address.</p>
        <Button variant="outline" size="sm" onClick={fetchStudents}>
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">My Dashboard</h1>
          <p className="text-muted-foreground text-sm">Welcome back, {user?.name} ({myStudent.rollNumber})</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchStudents} disabled={loadingStudents}>
          <RefreshCw className={`h-4 w-4 ${loadingStudents ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Risk Score"
          value={myStudent.riskScore !== undefined ? `${myStudent.riskScore}%` : 'N/A'}
          icon={ShieldAlert}
          variant={myStudent.riskLevel === 'high' ? 'danger' : myStudent.riskLevel === 'medium' ? 'default' : 'accent'}
        />
        <StatCard title="Attendance" value={`${myStudent.attendancePercentage}%`} icon={GraduationCap} variant="primary" />
        <StatCard title="Counselor" value={myStudent.counselorName || 'Not assigned'} icon={UserCheck} />
        <StatCard title="Counseling Sessions" value={totalNotes} icon={MessageSquare} variant="accent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Status */}
        <div className="stat-card space-y-4">
          <h3 className="font-semibold text-foreground font-display">Risk Assessment</h3>
          {myStudent.riskLevel ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <RiskBadge level={myStudent.riskLevel} showScore score={myStudent.riskScore} />
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    myStudent.riskLevel === 'high' ? 'bg-destructive' :
                    myStudent.riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${myStudent.riskScore}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">{myStudent.recommendation}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Risk assessment has not been performed yet by your teacher.
            </p>
          )}
        </div>

        {/* Academic Summary */}
        <div className="stat-card space-y-4">
          <h3 className="font-semibold text-foreground font-display">Academic Summary</h3>
          <div className="space-y-3">
            {[
              { label: 'Internal Marks', value: myStudent.internalMarks },
              { label: 'Assignment Completion', value: myStudent.assignmentCompletion },
              { label: 'Engagement Score', value: myStudent.engagementScore },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium text-foreground">{item.value}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="pt-2 border-t border-border space-y-1 text-xs text-muted-foreground">
            <p>Family Income: ₹{myStudent.familyIncome?.toLocaleString()}/yr</p>
            <p>Travel Distance: {myStudent.travelDistance} km</p>
            <p>Previous Failures: {myStudent.previousFailures}</p>
          </div>
        </div>
      </div>

      {/* Score History Summary */}
      {scoreHistory.length > 0 && (
        <div className="stat-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground font-display flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-primary" /> Score History
              <span className="text-xs font-normal text-muted-foreground ml-1">({scoreHistory.length} snapshot{scoreHistory.length !== 1 ? 's' : ''})</span>
            </h3>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate('/student/score-history')}>
              View all →
            </Button>
          </div>

          {/* Latest snapshot */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {([
              { label: 'Marks', key: 'internalMarks' as keyof ScoreSnapshot, suffix: '/100' },
              { label: 'Attendance', key: 'attendancePercentage' as keyof ScoreSnapshot, suffix: '%' },
              { label: 'Assignment', key: 'assignmentCompletion' as keyof ScoreSnapshot, suffix: '%' },
              { label: 'Engagement', key: 'engagementScore' as keyof ScoreSnapshot, suffix: '/100' },
            ]).map(({ label, key, suffix }) => {
              const curr = latestSnapshot[key] as number;
              const prev = prevSnapshot ? prevSnapshot[key] as number : undefined;
              return (
                <div key={label} className="bg-muted/40 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-xl font-bold text-foreground mt-0.5">{curr}{suffix}</p>
                  <div className="flex items-center justify-center gap-1 mt-0.5">
                    <Trend current={curr} previous={prev} />
                    {prev !== undefined && (
                      <span className={`text-xs ${curr > prev ? 'text-green-500' : curr < prev ? 'text-red-500' : 'text-muted-foreground'}`}>
                        {curr > prev ? `+${curr - prev}` : curr < prev ? `${curr - prev}` : '—'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            Latest: <span className="font-medium text-foreground">{latestSnapshot.term}</span> · {new Date(latestSnapshot.recordedAt).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Behavioural Feedback Summary */}
      {feedbacks.length > 0 && (
        <div className="stat-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground font-display flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" /> Behavioural Feedback
              <span className="text-xs font-normal text-muted-foreground ml-1">({feedbacks.length} entr{feedbacks.length !== 1 ? 'ies' : 'y'})</span>
            </h3>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate('/student/behavioural-feedback')}>
              View all →
            </Button>
          </div>

          {/* Summary chips */}
          <div className="flex gap-3">
            <span className="text-xs px-3 py-1.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 font-medium">
              ✓ {positiveCount} Positive
            </span>
            <span className="text-xs px-3 py-1.5 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 font-medium">
              ⚠ {concernCount} Concern{concernCount !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Latest 2 feedback entries */}
          <div className="space-y-3">
            {feedbacks.slice(0, 2).map(fb => (
              <div key={fb._id} className={`p-3 rounded-lg bg-muted/50 space-y-1.5 ${fb.isResolved ? 'opacity-60' : ''}`}>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SEVERITY_STYLES[fb.severity] || ''}`}>
                    {SEVERITY_LABELS[fb.severity]}
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">{fb.category}</span>
                  {fb.term && <span className="text-xs text-muted-foreground">· {fb.term}</span>}
                </div>
                <p className="text-sm text-foreground">{fb.description}</p>
                {fb.improvements.length > 0 && (
                  <ul className="list-disc list-inside">
                    {fb.improvements.slice(0, 2).map((imp, i) => (
                      <li key={i} className="text-xs text-muted-foreground">{imp}</li>
                    ))}
                    {fb.improvements.length > 2 && (
                      <li className="text-xs text-muted-foreground">+{fb.improvements.length - 2} more…</li>
                    )}
                  </ul>
                )}
              </div>
            ))}
            {feedbacks.length > 2 && (
              <p className="text-xs text-muted-foreground text-center">
                +{feedbacks.length - 2} more entries —{' '}
                <button className="text-primary underline" onClick={() => navigate('/student/behavioural-feedback')}>
                  view all
                </button>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Counseling History */}
      {loadingCounseling ? (
        <div className="stat-card py-8 flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : counselingHistory.length > 0 && (
        <div className="stat-card space-y-4">
          <h3 className="font-semibold text-foreground font-display">
            Counseling History ({totalNotes} note{totalNotes !== 1 ? 's' : ''})
          </h3>
          {myStudent.counselorName && (
            <p className="text-sm text-muted-foreground">
              Assigned counselor: <span className="font-medium text-foreground">{myStudent.counselorName}</span>
              {myStudent.counselingStatus && (
                <span className="ml-2 text-xs opacity-70">({myStudent.counselingStatus.replace('_', ' ')})</span>
              )}
            </p>
          )}
          <div className="space-y-3">
            {counselingHistory.map(record =>
              record.notes.map((n: any) => (
                <div key={n._id} className="p-3 rounded-lg bg-muted/50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-primary">{n.addedBy?.name || 'Counselor'}</span>
                    <span className="text-xs text-muted-foreground">{new Date(n.addedAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-foreground">{n.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

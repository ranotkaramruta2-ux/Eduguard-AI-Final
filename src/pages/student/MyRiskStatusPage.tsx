import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import RiskBadge from '@/components/RiskBadge';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MyRiskStatusPage() {
  const { user } = useAuth();
  const { students, fetchStudents, loadingStudents } = useData();
  const myStudent = students.find(s => s.userId === user?.id);

  if (loadingStudents) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
        <span className="text-muted-foreground">Loading risk status...</span>
      </div>
    );
  }

  if (!myStudent) {
    return (
      <div className="max-w-xl space-y-6">
        <h1 className="text-2xl font-bold font-display text-foreground">My Risk Status</h1>
        <div className="stat-card py-12 text-center space-y-3">
          <p className="text-muted-foreground">No student record found for your account.</p>
          <Button variant="outline" size="sm" onClick={fetchStudents}>
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
        </div>
      </div>
    );
  }

  if (!myStudent.riskLevel) {
    return (
      <div className="max-w-xl space-y-6">
        <h1 className="text-2xl font-bold font-display text-foreground">My Risk Status</h1>
        <div className="stat-card py-12 text-center space-y-3">
          <p className="text-muted-foreground">Risk assessment has not been performed yet by your teacher.</p>
          <Button variant="outline" size="sm" onClick={fetchStudents}>
            <RefreshCw className="h-4 w-4 mr-1" /> Check Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-display text-foreground">My Risk Status</h1>
        <Button variant="outline" size="sm" onClick={fetchStudents} disabled={loadingStudents}>
          <RefreshCw className={`h-4 w-4 ${loadingStudents ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      <div className="stat-card space-y-6">
        <div className="text-center space-y-3">
          <div className={`inline-flex h-24 w-24 rounded-full items-center justify-center text-3xl font-bold ${
            myStudent.riskLevel === 'high' ? 'bg-destructive/10 text-destructive' :
            myStudent.riskLevel === 'medium' ? 'bg-yellow-500/10 text-yellow-600' :
            'bg-green-500/10 text-green-600'
          }`}>
            {myStudent.riskScore}%
          </div>
          <div><RiskBadge level={myStudent.riskLevel} /></div>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">{myStudent.recommendation}</p>
        </div>

        {/* Academic factors contributing to risk */}
        <div className="border-t border-border pt-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Key Factors</p>
          {[
            { label: 'Attendance', value: myStudent.attendancePercentage, threshold: 75, lower: true },
            { label: 'Internal Marks', value: myStudent.internalMarks, threshold: 60, lower: true },
            { label: 'Assignment Completion', value: myStudent.assignmentCompletion, threshold: 70, lower: true },
            { label: 'Engagement Score', value: myStudent.engagementScore, threshold: 60, lower: true },
          ].map(item => (
            <div key={item.label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">{item.label}</span>
                <span className={`font-medium ${item.value < item.threshold ? 'text-destructive' : 'text-green-600'}`}>
                  {item.value}%{' '}
                  {item.value < item.threshold && <span className="text-xs">⚠️ Below threshold</span>}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    item.value < item.threshold ? 'bg-destructive' : 'bg-green-500'
                  }`}
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {myStudent.counselorName && (
          <div className="border-t border-border pt-4">
            <p className="text-xs text-muted-foreground">Assigned Counselor</p>
            <p className="text-sm font-medium text-foreground">{myStudent.counselorName}</p>
            <p className="text-xs text-muted-foreground capitalize mt-1">
              Status: {myStudent.counselingStatus?.replace('_', ' ') || 'Pending'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Loader2 } from 'lucide-react';

export default function MyProfilePage() {
  const { user } = useAuth();
  const { students, loadingStudents } = useData();
  const myStudent = students.find(s => s.userId === user?.id);

  if (loadingStudents) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
        <span className="text-muted-foreground">Loading profile...</span>
      </div>
    );
  }

  const fields = myStudent ? [
    { label: 'Name', value: myStudent.name },
    { label: 'Roll Number', value: myStudent.rollNumber },
    { label: 'Email', value: myStudent.email || user?.email || '—' },
    { label: 'Phone', value: myStudent.phoneNumber || '—' },
    { label: 'Attendance', value: `${myStudent.attendancePercentage}%` },
    { label: 'Internal Marks', value: `${myStudent.internalMarks}` },
    { label: 'Assignment Completion', value: `${myStudent.assignmentCompletion}%` },
    { label: 'Family Income', value: `₹${myStudent.familyIncome?.toLocaleString()}` },
    { label: 'Travel Distance', value: `${myStudent.travelDistance} km` },
    { label: 'Previous Failures', value: `${myStudent.previousFailures}` },
    { label: 'Engagement Score', value: `${myStudent.engagementScore}%` },
  ] : [];

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground">My Profile</h1>
        <p className="text-muted-foreground text-sm">{user?.email}</p>
      </div>
      {myStudent ? (
        <div className="stat-card">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map(f => (
              <div key={f.label} className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{f.label}</p>
                <p className="text-sm font-medium text-foreground">{f.value}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="stat-card py-12 text-center">
          <p className="text-muted-foreground">No student record found for your account.</p>
          <p className="text-xs text-muted-foreground mt-1">Please contact your teacher to add you to the system.</p>
        </div>
      )}
    </div>
  );
}

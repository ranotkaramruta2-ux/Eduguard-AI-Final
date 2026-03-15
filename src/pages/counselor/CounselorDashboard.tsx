import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import StatCard from '@/components/StatCard';
import RiskBadge from '@/components/RiskBadge';
import { Users, Clock, CheckCircle, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function CounselorDashboard() {
  const { user } = useAuth();
  const { students, fetchStudents, loadingStudents, notifications } = useData();
  const navigate = useNavigate();

  const assigned = students.filter(s => s.counselorId === user?.id);
  const pending = assigned.filter(s => s.counselingStatus === 'pending');
  const inProgress = assigned.filter(s => s.counselingStatus === 'in_progress');
  const resolved = assigned.filter(s => s.counselingStatus === 'resolved');
  const unreadNotifications = notifications.filter(n => !n.read);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Counselor Dashboard</h1>
          <p className="text-muted-foreground text-sm">Welcome, {user?.name}</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchStudents} disabled={loadingStudents}>
          <RefreshCw className={`h-4 w-4 mr-1 ${loadingStudents ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Assigned Students" value={assigned.length} icon={Users} variant="primary" />
        <StatCard title="Pending" value={pending.length} icon={AlertTriangle} variant="danger" />
        <StatCard title="In Progress" value={inProgress.length} icon={Clock} />
        <StatCard title="Resolved" value={resolved.length} icon={CheckCircle} variant="accent" />
      </div>

      {/* Unread Notifications Alert */}
      {unreadNotifications.length > 0 && (
        <div
          className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-center justify-between cursor-pointer hover:bg-primary/15 transition-colors"
          onClick={() => navigate('/counselor/notifications')}
        >
          <p className="text-sm text-primary font-medium">
            🔔 You have {unreadNotifications.length} unread notification{unreadNotifications.length > 1 ? 's' : ''}
          </p>
          <Button variant="ghost" size="sm" className="text-primary text-xs">View</Button>
        </div>
      )}

      {loadingStudents ? (
        <div className="stat-card py-12 flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : (
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground font-display">Assigned Students</h3>
            <Button variant="outline" size="sm" onClick={() => navigate('/counselor/assigned')}>
              View All
            </Button>
          </div>
          {assigned.length > 0 ? (
            <div className="space-y-3">
              {assigned.map(s => (
                <div
                  key={s.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-muted/50 gap-2 cursor-pointer hover:bg-muted/70 transition-colors"
                  onClick={() => navigate('/counselor/sessions')}
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.rollNumber} • Attendance: {s.attendancePercentage}%
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {s.riskLevel && <RiskBadge level={s.riskLevel} showScore score={s.riskScore} />}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      s.counselingStatus === 'resolved' ? 'bg-green-100 text-green-700' :
                      s.counselingStatus === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {s.counselingStatus?.replace('_', ' ') || 'pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm py-8 text-center">
              No students assigned yet. Teachers will assign high-risk students to you.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

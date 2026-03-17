import { Users, ShieldAlert, UserCheck, TrendingUp, RefreshCw, Loader2 } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useNavigate } from 'react-router-dom';
import StatCard from '@/components/StatCard';
import RiskBadge from '@/components/RiskBadge';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { RISK_COLORS } from '@/utils/constants';

export default function TeacherDashboard() {
  const { students, fetchStudents, loadingStudents, notifications } = useData();
  const navigate = useNavigate();

  const total = students.length;
  const high = students.filter(s => s.riskLevel === 'high').length;
  const medium = students.filter(s => s.riskLevel === 'medium').length;
  const low = students.filter(s => s.riskLevel === 'low').length;
  const unanalyzed = students.filter(s => !s.riskLevel).length;
  const counseled = students.filter(s => s.counselorId).length;
  const unreadNotifications = notifications.filter(n => !n.read);

  const pieData = [
    { name: 'High Risk', value: high, color: RISK_COLORS.high },
    { name: 'Medium Risk', value: medium, color: RISK_COLORS.medium },
    { name: 'Low Risk', value: low, color: RISK_COLORS.low },
  ].filter(d => d.value > 0);

  const recentHighRisk = students.filter(s => s.riskLevel === 'high').slice(0, 5);
  const avgRisk = total ? Math.round(students.reduce((a, s) => a + (s.riskScore ?? 0), 0) / total) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Teacher Dashboard</h1>
          <p className="text-muted-foreground text-sm">Overview of student dropout risk analysis</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchStudents} disabled={loadingStudents}>
          <RefreshCw className={`h-4 w-4 mr-1 ${loadingStudents ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Unread Notifications */}
      {unreadNotifications.length > 0 && (
        <div
          className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center justify-between cursor-pointer"
          onClick={() => navigate('/teacher/notifications')}
        >
          <p className="text-sm text-destructive font-medium">
            🔔 {unreadNotifications.length} unread notification{unreadNotifications.length > 1 ? 's' : ''} — {unreadNotifications.filter(n => n.type === 'risk').length} high-risk alerts
          </p>
          <Button variant="ghost" size="sm" className="text-destructive text-xs">View</Button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={total} icon={Users} variant="primary" />
        <StatCard
          title="High Risk"
          value={high}
          subtitle={unanalyzed > 0 ? `${unanalyzed} not analyzed` : undefined}
          icon={ShieldAlert}
          variant="danger"
        />
        <StatCard title="Counseling Active" value={counseled} icon={UserCheck} variant="accent" />
        <StatCard title="Avg Risk Score" value={total ? `${avgRisk}%` : '—'} icon={TrendingUp} />
      </div>

      {loadingStudents ? (
        <div className="stat-card py-16 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
          <span className="text-muted-foreground">Loading students from database...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Risk distribution chart */}
          <div className="stat-card">
            <h3 className="font-semibold text-foreground mb-4 font-display">Risk Distribution</h3>
            {pieData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 -mt-2">
                  {pieData.map(d => (
                    <div key={d.name} className="flex items-center gap-1.5 text-xs">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                      {d.name}: {d.value}
                    </div>
                  ))}
                </div>
              </div>
            ) : total === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground text-sm">No students in database yet.</p>
                <Button className="mt-3" size="sm" onClick={() => navigate('/teacher/add-student')}>
                  Add First Student
                </Button>
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-muted-foreground text-sm">{unanalyzed} student(s) not analyzed yet.</p>
                <Button className="mt-3" size="sm" onClick={() => navigate('/teacher/predict')}>
                  Run Predictions
                </Button>
              </div>
            )}
          </div>

          {/* High risk students */}
          <div className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground font-display">High Risk Students</h3>
              <Button variant="outline" size="sm" onClick={() => navigate('/teacher/students')}>View All</Button>
            </div>
            {recentHighRisk.length > 0 ? (
              <div className="space-y-3">
                {recentHighRisk.map(s => (
                  <div key={s.id} className="flex flex-col p-3 rounded-lg bg-muted/50 gap-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.rollNumber}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <RiskBadge level="high" showScore score={s.riskScore} />
                        {!s.counselorId && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => navigate('/teacher/students')}
                          >
                            Assign
                          </Button>
                        )}
                      </div>
                    </div>
                    {s.riskFactors && s.riskFactors.length > 0 && s.riskFactors[0] !== 'No significant risk factors detected' && (
                      <div className="flex flex-wrap gap-1">
                        {s.riskFactors.map((factor, i) => (
                          <span key={i} className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">
                            {factor}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : total === 0 ? (
              <p className="text-muted-foreground text-sm py-12 text-center">No students in database</p>
            ) : (
              <p className="text-muted-foreground text-sm py-12 text-center">No high-risk students detected</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { counselingAPI } from '@/lib/api';
import RiskBadge from '@/components/RiskBadge';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';

export default function AssignedStudentsPage() {
  const { user } = useAuth();
  const { students, fetchStudents, loadingStudents } = useData();
  const [counselingMap, setCounselingMap] = useState<Record<string, any>>({});
  const [loadingCounseling, setLoadingCounseling] = useState(false);

  const assigned = students.filter(s => s.counselorId === user?.id);

  // Fetch counseling records for all assigned students
  useEffect(() => {
    if (assigned.length > 0) {
      fetchAllCounseling();
    }
  }, [students]);

  const fetchAllCounseling = async () => {
    setLoadingCounseling(true);
    try {
      // Use the getAssigned endpoint which returns counseling records for this counselor
      const res = await counselingAPI.getAssigned();
      const map: Record<string, any> = {};
      res.data.forEach((record: any) => {
        const studentId = record.studentId?._id || record.studentId;
        if (studentId) {
          if (!map[studentId]) map[studentId] = [];
          map[studentId].push(record);
        }
      });
      setCounselingMap(map);
    } catch (err) {
      console.error('Failed to load counseling records:', err);
    } finally {
      setLoadingCounseling(false);
    }
  };

  const handleRefresh = async () => {
    await fetchStudents();
    await fetchAllCounseling();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Assigned Students</h1>
          <p className="text-muted-foreground text-sm">{assigned.length} student(s) assigned to you</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loadingStudents}>
          <RefreshCw className={`h-4 w-4 mr-1 ${loadingStudents ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {loadingStudents ? (
        <div className="stat-card py-16 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
          <span className="text-muted-foreground">Loading assigned students...</span>
        </div>
      ) : assigned.length > 0 ? (
        <div className="stat-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase">Name</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase hidden sm:table-cell">Roll No.</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase hidden md:table-cell">Attendance</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase hidden md:table-cell">Marks</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase">Risk</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase hidden lg:table-cell">Sessions</th>
              </tr>
            </thead>
            <tbody>
              {assigned.map(s => {
                const records = counselingMap[s.id] || [];
                const totalNotes = records.reduce((a: number, r: any) => a + (r.notes?.length || 0), 0);
                return (
                  <tr key={s.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-3 px-3 font-medium text-foreground">
                      <div>
                        <p>{s.name}</p>
                        {s.email && <p className="text-xs text-muted-foreground">{s.email}</p>}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-muted-foreground hidden sm:table-cell">{s.rollNumber}</td>
                    <td className="py-3 px-3 text-muted-foreground hidden md:table-cell">{s.attendancePercentage}%</td>
                    <td className="py-3 px-3 text-muted-foreground hidden md:table-cell">{s.internalMarks}</td>
                    <td className="py-3 px-3">
                      {s.riskLevel
                        ? <RiskBadge level={s.riskLevel} showScore score={s.riskScore} />
                        : <span className="text-xs text-muted-foreground">Not analyzed</span>}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                        s.counselingStatus === 'resolved' ? 'bg-green-100 text-green-700' :
                        s.counselingStatus === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {s.counselingStatus?.replace('_', ' ') || 'pending'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-xs text-muted-foreground hidden lg:table-cell">
                      {totalNotes} notes
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="stat-card py-12 text-center">
          <p className="text-muted-foreground">No students assigned to you yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Teachers will assign high-risk students to you for counseling.</p>
        </div>
      )}
    </div>
  );
}

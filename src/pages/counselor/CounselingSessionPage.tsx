import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { counselingAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, RefreshCw } from 'lucide-react';

interface CounselingRecord {
  _id: string;
  studentId: any;
  status: string;
  notes: Array<{ _id: string; content: string; addedBy: any; addedAt: string }>;
  sessionCount: number;
  assignedDate: string;
}

export default function CounselingSessionPage() {
  const { user } = useAuth();
  const { students, fetchStudents } = useData();
  const assigned = students.filter(s => s.counselorId === user?.id);

  const [selectedStudentId, setSelectedStudentId] = useState<string>(assigned[0]?.id || '');
  const [counselingRecords, setCounselingRecords] = useState<CounselingRecord[]>([]);
  const [activeCounseling, setActiveCounseling] = useState<CounselingRecord | null>(null);
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<'pending' | 'in_progress' | 'resolved'>('in_progress');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // When assigned students change and no selection yet, pick first
  useEffect(() => {
    if (assigned.length > 0 && !selectedStudentId) {
      setSelectedStudentId(assigned[0].id);
    }
  }, [assigned]);

  // Load counseling records for selected student
  useEffect(() => {
    if (!selectedStudentId) {
      setCounselingRecords([]);
      setActiveCounseling(null);
      return;
    }
    loadCounselingRecords(selectedStudentId);
  }, [selectedStudentId]);

  const loadCounselingRecords = async (studentId: string) => {
    setLoading(true);
    try {
      const res = await counselingAPI.getForStudent(studentId);
      const records = res.data as CounselingRecord[];
      setCounselingRecords(records);
      // Get the active (pending or in_progress) counseling record
      const active = records.find(r => r.status === 'pending' || r.status === 'in_progress') || records[0];
      setActiveCounseling(active || null);
      if (active) {
        setStatus(active.status as any);
      }
    } catch (err: any) {
      console.error('Failed to load counseling records:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!note.trim() || !activeCounseling) {
      toast.error('Please enter a note and ensure student has a counseling record');
      return;
    }

    setSubmitting(true);
    try {
      await counselingAPI.addNote(activeCounseling._id, note.trim());
      // Update status if changed
      if (status !== activeCounseling.status) {
        await counselingAPI.updateStatus(activeCounseling._id, status);
      }
      toast.success('Counseling note saved to database!');
      setNote('');
      // Reload records
      await loadCounselingRecords(selectedStudentId);
      await fetchStudents(); // refresh student counseling status
    } catch (err: any) {
      toast.error(err.message || 'Failed to add note');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (newStatus: 'pending' | 'in_progress' | 'resolved') => {
    if (!activeCounseling) return;
    setStatus(newStatus);
    try {
      await counselingAPI.updateStatus(activeCounseling._id, newStatus);
      toast.success(`Status updated to: ${newStatus.replace('_', ' ')}`);
      await loadCounselingRecords(selectedStudentId);
      await fetchStudents();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-display text-foreground">Counseling Sessions</h1>
        <Button variant="outline" size="sm" onClick={() => selectedStudentId && loadCounselingRecords(selectedStudentId)}>
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </div>

      <div className="stat-card space-y-4">
        {/* Student Selector */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase">Select Assigned Student</label>
          <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a student..." />
            </SelectTrigger>
            <SelectContent>
              {assigned.map(s => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name} ({s.rollNumber}){' '}
                  {s.counselingStatus && (
                    <span className="text-xs opacity-70 ml-1">— {s.counselingStatus.replace('_', ' ')}</span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {assigned.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No students have been assigned to you yet.
          </p>
        )}

        {selectedStudent && (
          <>
            {/* Student info summary */}
            <div className="bg-muted/40 rounded-lg p-3 text-sm">
              <p className="font-medium">{selectedStudent.name} — {selectedStudent.rollNumber}</p>
              <p className="text-muted-foreground text-xs mt-1">
                Attendance: {selectedStudent.attendancePercentage}% | Marks: {selectedStudent.internalMarks} |
                Risk: {selectedStudent.riskLevel || 'Not analyzed'}
              </p>
            </div>

            {/* Current Counseling Status */}
            {activeCounseling && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase">Session Status</label>
                <Select value={status} onValueChange={(v: any) => handleStatusUpdate(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Add Note */}
            {activeCounseling ? (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase">Add Session Note</label>
                  <Textarea
                    placeholder="Enter counseling notes, observations, action items..."
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    rows={4}
                  />
                </div>
                <Button
                  onClick={handleAddNote}
                  disabled={!note.trim() || submitting}
                >
                  {submitting ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
                  ) : (
                    'Save Note'
                  )}
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No active counseling record found. Notes can only be added once a counseling session is created.
              </p>
            )}
          </>
        )}
      </div>

      {/* Session History */}
      {loading ? (
        <div className="stat-card py-8 flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : counselingRecords.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Session History ({counselingRecords.reduce((a, r) => a + r.notes.length, 0)} notes)</h3>
          {counselingRecords.map(record => (
            <div key={record._id} className="stat-card space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  record.status === 'resolved' ? 'bg-green-100 text-green-700' :
                  record.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {record.status.replace('_', ' ')}
                </span>
                <span className="text-xs text-muted-foreground">
                  Assigned: {new Date(record.assignedDate).toLocaleDateString()}
                </span>
              </div>
              {record.notes.map(n => (
                <div key={n._id} className="border-l-2 border-primary/30 pl-3 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-xs font-medium text-primary">
                      {n.addedBy?.name || 'Counselor'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(n.addedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{n.content}</p>
                </div>
              ))}
              {record.notes.length === 0 && (
                <p className="text-xs text-muted-foreground italic">No notes yet for this session.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

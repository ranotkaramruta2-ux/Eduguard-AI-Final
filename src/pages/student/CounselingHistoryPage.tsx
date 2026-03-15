import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { counselingAPI } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function CounselingHistoryPage() {
  const { user } = useAuth();
  const { students } = useData();
  const myStudent = students.find(s => s.userId === user?.id);
  const [counselingHistory, setCounselingHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (myStudent?.id) {
      setLoading(true);
      counselingAPI.getForStudent(myStudent.id)
        .then(res => setCounselingHistory(res.data))
        .catch(err => console.error('Failed to load counseling history:', err))
        .finally(() => setLoading(false));
    }
  }, [myStudent?.id]);

  const allNotes = counselingHistory.flatMap(record =>
    record.notes.map((n: any) => ({
      ...n,
      counselorName: record.counselorId?.name || 'Counselor',
      status: record.status,
    }))
  );

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold font-display text-foreground">Counseling History</h1>

      {loading ? (
        <div className="stat-card py-12 flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : allNotes.length > 0 ? (
        <div className="space-y-3">
          {allNotes.map(n => (
            <div key={n._id} className="stat-card space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-primary">{n.counselorName}</span>
                <span className="text-xs text-muted-foreground">{new Date(n.addedAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-foreground">{n.content}</p>
              <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full ${
                n.status === 'resolved' ? 'bg-green-100 text-green-700' :
                n.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                'bg-muted text-muted-foreground'
              }`}>
                {n.status?.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="stat-card py-12 text-center">
          <p className="text-muted-foreground">No counseling sessions yet.</p>
          {myStudent?.counselorName && (
            <p className="text-xs text-muted-foreground mt-1">
              Your counselor {myStudent.counselorName} will add notes after your sessions.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

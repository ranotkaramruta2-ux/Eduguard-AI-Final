import { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { scoreHistoryAPI, ScoreSnapshot } from '@/lib/api';
import { Loader2, BarChart2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { toast } from 'sonner';

function Trend({ current, previous }: { current: number; previous?: number }) {
  if (previous === undefined) return null;
  if (current > previous) return <TrendingUp className="h-3.5 w-3.5 text-green-500" />;
  if (current < previous) return <TrendingDown className="h-3.5 w-3.5 text-red-500" />;
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
}

export default function MyScoreHistoryPage() {
  const { user } = useAuth();
  const { students } = useData();
  const myStudent = students.find((s) => s.userId === user?.id);

  const [history, setHistory] = useState<ScoreSnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (myStudent?.id) fetchHistory(myStudent.id);
  }, [myStudent?.id]);

  const fetchHistory = async (id: string) => {
    setLoading(true);
    try {
      const res = await scoreHistoryAPI.getForStudent(id);
      setHistory(res.data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load score history');
    } finally {
      setLoading(false);
    }
  };

  const fields: { key: keyof ScoreSnapshot; label: string; suffix?: string }[] = [
    { key: 'internalMarks', label: 'Internal Marks', suffix: '/100' },
    { key: 'attendancePercentage', label: 'Attendance', suffix: '%' },
    { key: 'assignmentCompletion', label: 'Assignment', suffix: '%' },
    { key: 'engagementScore', label: 'Engagement', suffix: '/100' },
    { key: 'previousFailures', label: 'Failures', suffix: '' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
        <span className="text-muted-foreground">Loading score history...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
          <BarChart2 className="h-6 w-6 text-primary" /> My Score History
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Academic progress snapshots recorded by your teacher over time.
        </p>
      </div>

      {!myStudent ? (
        <div className="stat-card py-16 text-center">
          <p className="text-muted-foreground">No student record found for your account.</p>
        </div>
      ) : history.length === 0 ? (
        <div className="stat-card py-16 text-center">
          <BarChart2 className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="text-muted-foreground">No score history recorded yet.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Your teacher will record snapshots of your progress over each term.
          </p>
        </div>
      ) : (
        <>
          {/* Progress trend cards */}
          {history.length > 1 && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {fields.map((f) => {
                const latest = history[0][f.key] as number;
                const prev = history[1][f.key] as number;
                const delta = latest - prev;
                return (
                  <div key={f.key} className="stat-card text-center py-4">
                    <p className="text-xs text-muted-foreground">{f.label}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {latest}{f.suffix}
                    </p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <Trend current={latest} previous={prev} />
                      <span className={`text-xs font-medium ${delta > 0 ? 'text-green-500' : delta < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                        {delta > 0 ? `+${delta}` : delta === 0 ? 'No change' : delta}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Full history table */}
          <div className="stat-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase">Term</th>
                  {fields.map((f) => (
                    <th key={f.key} className="text-right py-3 px-3 text-xs font-semibold text-muted-foreground uppercase hidden sm:table-cell">
                      {f.label}
                    </th>
                  ))}
                  <th className="text-right py-3 px-3 text-xs font-semibold text-muted-foreground uppercase">Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry, idx) => {
                  const prev = history[idx + 1];
                  return (
                    <tr key={entry._id || idx} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-3 px-3 font-medium text-foreground">{entry.term}</td>
                      {fields.map((f) => {
                        const val = entry[f.key] as number;
                        const prevVal = prev ? (prev[f.key] as number) : undefined;
                        return (
                          <td key={f.key} className="py-3 px-3 text-right text-muted-foreground hidden sm:table-cell">
                            <span className="inline-flex items-center justify-end gap-1">
                              {val}{f.suffix}
                              <Trend current={val} previous={prevVal} />
                            </span>
                          </td>
                        );
                      })}
                      <td className="py-3 px-3 text-right text-xs text-muted-foreground">
                        {new Date(entry.recordedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

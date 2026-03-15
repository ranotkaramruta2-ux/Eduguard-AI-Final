import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { scoreHistoryAPI, ScoreSnapshot } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  Loader2,
  BarChart2,
} from 'lucide-react';

export default function StudentScoreHistoryPage() {
  const { id: studentId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { students } = useData();

  const student = students.find((s) => s.id === studentId);

  const [history, setHistory] = useState<ScoreSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    term: '',
    attendancePercentage: String(student?.attendancePercentage ?? ''),
    internalMarks: String(student?.internalMarks ?? ''),
    assignmentCompletion: String(student?.assignmentCompletion ?? ''),
    engagementScore: String(student?.engagementScore ?? ''),
    previousFailures: String(student?.previousFailures ?? ''),
  });

  useEffect(() => {
    if (studentId) fetchHistory();
  }, [studentId]);

  const fetchHistory = async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const res = await scoreHistoryAPI.getForStudent(studentId);
      setHistory(res.data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load score history');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!studentId) return;
    if (!form.term.trim()) {
      toast.error('Please enter a term label (e.g. "Semester 1")');
      return;
    }
    setSaving(true);
    try {
      await scoreHistoryAPI.add(studentId, {
        term: form.term.trim(),
        attendancePercentage: Number(form.attendancePercentage),
        internalMarks: Number(form.internalMarks),
        assignmentCompletion: Number(form.assignmentCompletion),
        engagementScore: Number(form.engagementScore),
        previousFailures: Number(form.previousFailures),
      });
      toast.success('Score snapshot recorded!');
      setShowForm(false);
      await fetchHistory();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save snapshot');
    } finally {
      setSaving(false);
    }
  };

  const trend = (current: number, previous: number | undefined) => {
    if (previous === undefined) return null;
    if (current > previous) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (current < previous) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const fields: { key: keyof ScoreSnapshot; label: string }[] = [
    { key: 'internalMarks', label: 'Internal Marks' },
    { key: 'attendancePercentage', label: 'Attendance %' },
    { key: 'assignmentCompletion', label: 'Assignment %' },
    { key: 'engagementScore', label: 'Engagement' },
    { key: 'previousFailures', label: 'Failures' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
            <BarChart2 className="h-6 w-6 text-primary" />
            Score History
          </h1>
          {student && (
            <p className="text-sm text-muted-foreground">
              {student.name} · {student.rollNumber}
            </p>
          )}
        </div>
        <Button
          className="ml-auto"
          size="sm"
          onClick={() => {
            setForm({
              term: '',
              attendancePercentage: String(student?.attendancePercentage ?? ''),
              internalMarks: String(student?.internalMarks ?? ''),
              assignmentCompletion: String(student?.assignmentCompletion ?? ''),
              engagementScore: String(student?.engagementScore ?? ''),
              previousFailures: String(student?.previousFailures ?? ''),
            });
            setShowForm(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1" /> Record Snapshot
        </Button>
      </div>

      {/* Record Snapshot Form */}
      {showForm && (
        <div className="stat-card space-y-4 border-primary/40">
          <h3 className="font-semibold text-foreground font-display">New Score Snapshot</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-medium">Term Label *</label>
              <Input
                placeholder='e.g. "Semester 1", "Mid-Term 2025"'
                value={form.term}
                onChange={(e) => setForm((f) => ({ ...f, term: e.target.value }))}
              />
            </div>
            {[
              { key: 'attendancePercentage', label: 'Attendance (%)', max: 100 },
              { key: 'internalMarks', label: 'Internal Marks (0-100)', max: 100 },
              { key: 'assignmentCompletion', label: 'Assignment Completion (%)', max: 100 },
              { key: 'engagementScore', label: 'Engagement Score (0-100)', max: 100 },
              { key: 'previousFailures', label: 'Previous Failures', max: undefined },
            ].map(({ key, label, max }) => (
              <div key={key} className="space-y-1">
                <label className="text-xs font-medium">{label}</label>
                <Input
                  type="number"
                  min={0}
                  max={max}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowForm(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Saving...</> : 'Save Snapshot'}
            </Button>
          </div>
        </div>
      )}

      {/* History table */}
      {loading ? (
        <div className="stat-card py-16 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
          <span className="text-muted-foreground">Loading history...</span>
        </div>
      ) : history.length === 0 ? (
        <div className="stat-card py-16 text-center">
          <BarChart2 className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="text-muted-foreground">No score snapshots recorded yet.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Click "Record Snapshot" to capture the student's current academic data.
          </p>
        </div>
      ) : (
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
                <th className="text-right py-3 px-3 text-xs font-semibold text-muted-foreground uppercase hidden md:table-cell">By</th>
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
                          <span className="inline-flex items-center gap-1 justify-end">
                            {val}
                            {trend(val, prevVal)}
                          </span>
                        </td>
                      );
                    })}
                    <td className="py-3 px-3 text-right text-muted-foreground text-xs">
                      {new Date(entry.recordedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 text-right text-muted-foreground text-xs hidden md:table-cell">
                      {entry.addedBy?.name || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

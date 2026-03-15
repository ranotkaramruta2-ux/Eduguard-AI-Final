import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import {
  behaviouralFeedbackAPI,
  BehaviouralFeedbackData,
  FeedbackCategory,
  FeedbackSeverity,
} from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  MessageSquare,
  X,
} from 'lucide-react';

const CATEGORIES: { value: FeedbackCategory; label: string }[] = [
  { value: 'attendance', label: 'Attendance' },
  { value: 'participation', label: 'Participation' },
  { value: 'discipline', label: 'Discipline' },
  { value: 'attitude', label: 'Attitude' },
  { value: 'academic', label: 'Academic' },
  { value: 'other', label: 'Other' },
];

const SEVERITIES: { value: FeedbackSeverity; label: string; color: string }[] = [
  { value: 'positive', label: 'Positive', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  { value: 'minor_concern', label: 'Minor Concern', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
  { value: 'major_concern', label: 'Major Concern', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
];

const emptySeverityColor = 'bg-muted text-muted-foreground';

function getSeverityStyle(severity: FeedbackSeverity) {
  return SEVERITIES.find((s) => s.value === severity)?.color ?? emptySeverityColor;
}

function formatCat(cat: string) {
  return cat.charAt(0).toUpperCase() + cat.slice(1);
}

const emptyForm = {
  term: '',
  category: 'academic' as FeedbackCategory,
  severity: 'minor_concern' as FeedbackSeverity,
  description: '',
  improvements: [''],
};

export default function BehaviouralFeedbackPage() {
  const { id: studentId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { students } = useData();

  const student = students.find((s) => s.id === studentId);

  const [feedbacks, setFeedbacks] = useState<BehaviouralFeedbackData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<BehaviouralFeedbackData | null>(null);

  const [form, setForm] = useState({ ...emptyForm });

  useEffect(() => {
    if (studentId) loadFeedbacks();
  }, [studentId]);

  const loadFeedbacks = async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const res = await behaviouralFeedbackAPI.getForStudent(studentId);
      setFeedbacks(res.data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setForm({ ...emptyForm, improvements: [''] });
    setAddOpen(true);
  };

  const openEdit = (fb: BehaviouralFeedbackData) => {
    setForm({
      term: fb.term || '',
      category: fb.category,
      severity: fb.severity,
      description: fb.description,
      improvements: fb.improvements.length > 0 ? [...fb.improvements] : [''],
    });
    setEditTarget(fb);
  };

  const setImprovement = (idx: number, val: string) => {
    setForm((f) => {
      const arr = [...f.improvements];
      arr[idx] = val;
      return { ...f, improvements: arr };
    });
  };

  const addImprovement = () =>
    setForm((f) => ({ ...f, improvements: [...f.improvements, ''] }));

  const removeImprovement = (idx: number) =>
    setForm((f) => ({ ...f, improvements: f.improvements.filter((_, i) => i !== idx) }));

  const validateForm = () => {
    if (!form.description.trim()) {
      toast.error('Description is required');
      return false;
    }
    return true;
  };

  const handleAdd = async () => {
    if (!studentId || !validateForm()) return;
    setSaving(true);
    try {
      await behaviouralFeedbackAPI.add({
        studentId,
        term: form.term.trim() || undefined,
        category: form.category,
        severity: form.severity,
        description: form.description.trim(),
        improvements: form.improvements.filter((i) => i.trim()),
      });
      toast.success('Feedback added');
      setAddOpen(false);
      await loadFeedbacks();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add feedback');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editTarget || !validateForm()) return;
    setSaving(true);
    try {
      await behaviouralFeedbackAPI.update(editTarget._id, {
        term: form.term.trim() || undefined,
        category: form.category,
        severity: form.severity,
        description: form.description.trim(),
        improvements: form.improvements.filter((i) => i.trim()),
      });
      toast.success('Feedback updated');
      setEditTarget(null);
      await loadFeedbacks();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update feedback');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this feedback entry? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await behaviouralFeedbackAPI.delete(id);
      toast.success('Feedback deleted');
      setFeedbacks((prev) => prev.filter((f) => f._id !== id));
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete feedback');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleResolved = async (fb: BehaviouralFeedbackData) => {
    try {
      await behaviouralFeedbackAPI.update(fb._id, { isResolved: !fb.isResolved });
      await loadFeedbacks();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const FeedbackForm = (
    <div className="space-y-4 mt-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium">Term (optional)</label>
          <Input
            placeholder='e.g. "Semester 1"'
            value={form.term}
            onChange={(e) => setForm((f) => ({ ...f, term: e.target.value }))}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium">Category *</label>
          <select
            className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as FeedbackCategory }))}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2 space-y-1">
          <label className="text-xs font-medium">Severity *</label>
          <div className="flex gap-2 flex-wrap">
            {SEVERITIES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setForm((f) => ({ ...f, severity: s.value }))}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                  form.severity === s.value
                    ? `${s.color} border-transparent ring-2 ring-primary ring-offset-1`
                    : 'border-border text-muted-foreground hover:border-primary'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <div className="sm:col-span-2 space-y-1">
          <label className="text-xs font-medium">Description *</label>
          <Textarea
            placeholder="Describe the behaviour or achievement..."
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={3}
          />
        </div>
        <div className="sm:col-span-2 space-y-2">
          <label className="text-xs font-medium">Improvement Notes</label>
          {form.improvements.map((imp, idx) => (
            <div key={idx} className="flex gap-2">
              <Input
                placeholder={`Improvement ${idx + 1}`}
                value={imp}
                onChange={(e) => setImprovement(idx, e.target.value)}
              />
              {form.improvements.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeImprovement(idx)}
                  className="shrink-0 text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addImprovement}>
            <Plus className="h-3 w-3 mr-1" /> Add improvement note
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            Behavioural Feedback
          </h1>
          {student && (
            <p className="text-sm text-muted-foreground">
              {student.name} · {student.rollNumber}
            </p>
          )}
        </div>
        <Button className="ml-auto" size="sm" onClick={openAdd}>
          <Plus className="h-4 w-4 mr-1" /> Add Feedback
        </Button>
      </div>

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Behavioural Feedback</DialogTitle>
          </DialogHeader>
          {FeedbackForm}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setAddOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleAdd} disabled={saving}>
              {saving ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Saving...</> : 'Add Feedback'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => { if (!open) setEditTarget(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Feedback</DialogTitle>
          </DialogHeader>
          {FeedbackForm}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setEditTarget(null)} disabled={saving}>Cancel</Button>
            <Button onClick={handleEdit} disabled={saving}>
              {saving ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Saving...</> : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* List */}
      {loading ? (
        <div className="stat-card py-16 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
          <span className="text-muted-foreground">Loading feedback...</span>
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="stat-card py-16 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="text-muted-foreground">No feedback entries yet.</p>
          <Button className="mt-4" size="sm" onClick={openAdd}>
            <Plus className="h-4 w-4 mr-1" /> Add First Feedback
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((fb) => (
            <div
              key={fb._id}
              className={`stat-card space-y-3 transition-opacity ${fb.isResolved ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getSeverityStyle(fb.severity)}`}>
                    {SEVERITIES.find((s) => s.value === fb.severity)?.label}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {formatCat(fb.category)}
                  </span>
                  {fb.term && (
                    <span className="text-xs text-muted-foreground">· {fb.term}</span>
                  )}
                  {fb.isResolved && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Resolved
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    title={fb.isResolved ? 'Mark unresolved' : 'Mark resolved'}
                    onClick={() => handleToggleResolved(fb)}
                  >
                    <CheckCircle2 className={`h-4 w-4 ${fb.isResolved ? 'text-green-500' : 'text-muted-foreground'}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => openEdit(fb)}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-destructive hover:text-destructive"
                    disabled={deletingId === fb._id}
                    onClick={() => handleDelete(fb._id)}
                  >
                    {deletingId === fb._id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                  </Button>
                </div>
              </div>

              <p className="text-sm text-foreground">{fb.description}</p>

              {fb.improvements.length > 0 && (
                <ul className="list-disc list-inside space-y-0.5">
                  {fb.improvements.map((imp, i) => (
                    <li key={i} className="text-xs text-muted-foreground">{imp}</li>
                  ))}
                </ul>
              )}

              <p className="text-xs text-muted-foreground">
                {new Date(fb.createdAt).toLocaleDateString()} · {fb.teacherId?.name}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

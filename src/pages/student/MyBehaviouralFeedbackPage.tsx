import { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { behaviouralFeedbackAPI, BehaviouralFeedbackData } from '@/lib/api';
import { Loader2, MessageSquare, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const SEVERITY_STYLES: Record<string, string> = {
  positive: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  minor_concern: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  major_concern: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

const SEVERITY_LABELS: Record<string, string> = {
  positive: 'Positive',
  minor_concern: 'Minor Concern',
  major_concern: 'Major Concern',
};

function formatCat(cat: string) {
  return cat.charAt(0).toUpperCase() + cat.slice(1);
}

export default function MyBehaviouralFeedbackPage() {
  const { user } = useAuth();
  const { students } = useData();
  const myStudent = students.find((s) => s.userId === user?.id);

  const [feedbacks, setFeedbacks] = useState<BehaviouralFeedbackData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (myStudent?.id) fetchFeedback(myStudent.id);
  }, [myStudent?.id]);

  const fetchFeedback = async (id: string) => {
    setLoading(true);
    try {
      const res = await behaviouralFeedbackAPI.getForStudent(id);
      setFeedbacks(res.data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  // Group by term
  const grouped = feedbacks.reduce<Record<string, BehaviouralFeedbackData[]>>((acc, fb) => {
    const key = fb.term || 'General';
    if (!acc[key]) acc[key] = [];
    acc[key].push(fb);
    return acc;
  }, {});

  const positiveCount = feedbacks.filter((f) => f.severity === 'positive').length;
  const concernCount = feedbacks.filter((f) => f.severity !== 'positive').length;
  const resolvedCount = feedbacks.filter((f) => f.isResolved).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
        <span className="text-muted-foreground">Loading feedback...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" /> My Behavioural Feedback
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Feedback recorded by your teacher regarding your behaviour and progress.
        </p>
      </div>

      {!myStudent ? (
        <div className="stat-card py-16 text-center">
          <p className="text-muted-foreground">No student record found for your account.</p>
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="stat-card py-16 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="text-muted-foreground">No feedback recorded yet.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Your teacher will add feedback on your participation, behaviour, and improvements.
          </p>
        </div>
      ) : (
        <>
          {/* Summary chips */}
          <div className="flex gap-3 flex-wrap">
            <div className="stat-card flex-1 min-w-[120px] text-center py-4">
              <p className="text-3xl font-bold text-green-500">{positiveCount}</p>
              <p className="text-xs text-muted-foreground mt-1">Positive</p>
            </div>
            <div className="stat-card flex-1 min-w-[120px] text-center py-4">
              <p className="text-3xl font-bold text-yellow-500">{concernCount}</p>
              <p className="text-xs text-muted-foreground mt-1">Concerns</p>
            </div>
            <div className="stat-card flex-1 min-w-[120px] text-center py-4">
              <p className="text-3xl font-bold text-primary">{resolvedCount}</p>
              <p className="text-xs text-muted-foreground mt-1">Resolved</p>
            </div>
          </div>

          {/* Grouped by term */}
          {Object.entries(grouped).map(([term, entries]) => (
            <div key={term} className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {term}
              </h3>
              {entries.map((fb) => (
                <div
                  key={fb._id}
                  className={`stat-card space-y-3 transition-opacity ${fb.isResolved ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SEVERITY_STYLES[fb.severity] || ''}`}>
                      {SEVERITY_LABELS[fb.severity] || fb.severity}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {formatCat(fb.category)}
                    </span>
                    {fb.isResolved && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Resolved
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-foreground">{fb.description}</p>

                  {fb.improvements.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Suggested Improvements:</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        {fb.improvements.map((imp, i) => (
                          <li key={i} className="text-xs text-muted-foreground">{imp}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    {new Date(fb.createdAt).toLocaleDateString()}
                    {fb.teacherId?.name ? ` · ${fb.teacherId.name}` : ''}
                  </p>
                </div>
              ))}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

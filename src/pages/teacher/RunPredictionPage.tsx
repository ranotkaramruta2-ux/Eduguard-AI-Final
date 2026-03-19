import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Brain, CheckCircle, Loader2, RefreshCw, UserCheck } from 'lucide-react';
import RiskBadge from '@/components/RiskBadge';
import { toast } from 'sonner';

const COUNSELOR_TYPE_COLORS: Record<string, string> = {
  academic: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  financial: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  behavioral: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  medical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  general: 'bg-muted text-muted-foreground',
};

const COUNSELOR_TYPE_LABELS: Record<string, string> = {
  academic: '📚 Academic Counselor',
  financial: '💰 Financial Counselor',
  behavioral: '🧠 Behavioral Counselor',
  medical: '🏥 Medical Counselor',
  general: '👤 General Counselor',
};

export default function RunPredictionPage() {
  const { students, runAllPredictions, runPrediction, fetchStudents, loadingStudents } = useData();
  const [runningAll, setRunningAll] = useState(false);
  const [runningId, setRunningId] = useState<string | null>(null);

  const handleRunAll = async () => {
    setRunningAll(true);
    try {
      await runAllPredictions();
      toast.success('Predictions completed for all students!');
    } catch (err: any) {
      toast.error(err.message || 'Error running predictions');
    } finally {
      setRunningAll(false);
    }
  };

  const handleRunSingle = async (studentId: string, name: string) => {
    setRunningId(studentId);
    try {
      const result = await runPrediction(studentId);
      const typeLabel = result.counselorType ? COUNSELOR_TYPE_LABELS[result.counselorType] : '';
      toast.success(`${name}: ${result.riskLevel} risk (${result.riskScore}%)${typeLabel ? ` — needs ${typeLabel}` : ''}`);
    } catch (err: any) {
      toast.error(err.message || `Failed prediction for ${name}`);
    } finally {
      setRunningId(null);
    }
  };

  // Group factors by category tag
  const groupFactors = (factors: string[]) => {
    const groups: Record<string, string[]> = {};
    for (const f of factors) {
      const match = f.match(/^\[(\w+)\] (.+)$/);
      if (match) {
        const cat = match[1].toLowerCase();
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(match[2]);
      } else {
        if (!groups['other']) groups['other'] = [];
        groups['other'].push(f);
      }
    }
    return groups;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Run Prediction</h1>
          <p className="text-muted-foreground text-sm">AI-powered dropout risk analysis — academic, financial, behavioural & medical</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchStudents} disabled={loadingStudents}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loadingStudents ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleRunAll} className="gap-2" disabled={runningAll || students.length === 0}>
            {runningAll ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</>
            ) : (
              <><Brain className="h-4 w-4" /> Analyze All Students</>
            )}
          </Button>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="stat-card py-16 text-center">
          <p className="text-muted-foreground">No students in database. Add students first.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {students.map(s => {
            const factorGroups = s.riskFactors && s.riskFactors[0] !== 'No significant risk factors detected'
              ? groupFactors(s.riskFactors)
              : {};
            const hasFactors = Object.keys(factorGroups).length > 0;

            return (
              <div key={s.id} className="stat-card space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <p className="font-medium text-foreground">{s.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.rollNumber} • Attendance: {s.attendancePercentage}% • Marks: {s.internalMarks} •
                      Engagement: {s.engagementScore}%
                    </p>
                    {s.recommendation && (
                      <p className="text-xs text-muted-foreground italic">{s.recommendation}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {s.riskLevel && (
                      <>
                        <RiskBadge level={s.riskLevel} showScore score={s.riskScore} />
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={runningId === s.id || runningAll}
                      onClick={() => handleRunSingle(s.id, s.name)}
                    >
                      {runningId === s.id ? (
                        <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Analyzing...</>
                      ) : (
                        <><Brain className="h-3 w-3 mr-1" /> {s.riskLevel ? 'Re-analyze' : 'Analyze'}</>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Counselor type recommendation */}
                {s.counselorType && s.riskLevel && (
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground">Recommended counselor:</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${COUNSELOR_TYPE_COLORS[s.counselorType]}`}>
                      {COUNSELOR_TYPE_LABELS[s.counselorType]}
                    </span>
                  </div>
                )}

                {/* Risk factor breakdown by category */}
                {hasFactors && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.entries(factorGroups).map(([cat, items]) => (
                      <div key={cat} className="bg-muted/40 rounded-lg p-2 space-y-1">
                        <p className="text-xs font-semibold capitalize text-muted-foreground">{cat}</p>
                        {items.map((item, i) => (
                          <p key={i} className="text-xs text-foreground flex items-start gap-1">
                            <span className="mt-0.5 shrink-0">•</span>{item}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

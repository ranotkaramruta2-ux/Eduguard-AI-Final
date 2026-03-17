import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Brain, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import RiskBadge from '@/components/RiskBadge';
import { toast } from 'sonner';

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
      toast.success(`${name}: ${result.riskLevel} risk (${result.riskScore}%)`);
    } catch (err: any) {
      toast.error(err.message || `Failed prediction for ${name}`);
    } finally {
      setRunningId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Run Prediction</h1>
          <p className="text-muted-foreground text-sm">AI-powered dropout risk analysis using backend ML model</p>
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
          {students.map(s => (
            <div key={s.id} className="stat-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <p className="font-medium text-foreground">{s.name}</p>
                <p className="text-xs text-muted-foreground">
                  {s.rollNumber} • Attendance: {s.attendancePercentage}% • Marks: {s.internalMarks} •
                  Engagement: {s.engagementScore}%
                </p>
                {s.recommendation && (
                  <p className="text-xs text-muted-foreground mt-1 italic">{s.recommendation}</p>
                )}
                {s.riskFactors && s.riskFactors.length > 0 && s.riskFactors[0] !== 'No significant risk factors detected' && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {s.riskFactors.map((f, i) => (
                      <span key={i} className="text-xs bg-destructive/10 text-destructive px-1.5 py-0.5 rounded">
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {s.riskLevel ? (
                  <>
                    <RiskBadge level={s.riskLevel} showScore score={s.riskScore} />
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </>
                ) : null}
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
          ))}
        </div>
      )}
    </div>
  );
}

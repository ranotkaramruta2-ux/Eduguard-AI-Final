import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import RiskBadge from '@/components/RiskBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Search, UserPlus, Trash2, Loader2, RefreshCw, Pencil, BarChart2, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { studentAPI } from '@/lib/api';

export default function StudentListPage() {
  const { students, assignCounselor, runPrediction, deleteStudent, counselors, fetchStudents, loadingStudents } = useData();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [assignDialogStudent, setAssignDialogStudent] = useState<string | null>(null);
  const [selectedCounselorId, setSelectedCounselorId] = useState('');
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [predictingId, setPredictingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editStudentId, setEditStudentId] = useState<string | null>(null);
  const [savingEditId, setSavingEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    attendancePercentage: '',
    internalMarks: '',
    assignmentCompletion: '',
    familyIncome: '',
    travelDistance: '',
    previousFailures: '',
    engagementScore: '',
  });

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.rollNumber.toLowerCase().includes(search.toLowerCase())
  );

  const openEditDialog = (studentId: string) => {
    const s = students.find(st => st.id === studentId);
    if (!s) return;
    setEditForm({
      attendancePercentage: String(s.attendancePercentage ?? ''),
      internalMarks: String(s.internalMarks ?? ''),
      assignmentCompletion: String(s.assignmentCompletion ?? ''),
      familyIncome: String(s.familyIncome ?? ''),
      travelDistance: String(s.travelDistance ?? ''),
      previousFailures: String(s.previousFailures ?? ''),
      engagementScore: String(s.engagementScore ?? ''),
    });
    setEditStudentId(studentId);
  };

  const updateEditForm = (key: keyof typeof editForm, value: string) => {
    setEditForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveEdit = async () => {
    if (!editStudentId) return;
    setSavingEditId(editStudentId);
    try {
      await studentAPI.update(editStudentId, {
        attendancePercentage: Number(editForm.attendancePercentage) || 0,
        internalMarks: Number(editForm.internalMarks) || 0,
        assignmentCompletion: Number(editForm.assignmentCompletion) || 0,
        familyIncome: Number(editForm.familyIncome) || 0,
        travelDistance: Number(editForm.travelDistance) || 0,
        previousFailures: Number(editForm.previousFailures) || 0,
        engagementScore: Number(editForm.engagementScore) || 0,
      });
      toast.success('Student data updated');
      setEditStudentId(null);
      await fetchStudents();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update student');
    } finally {
      setSavingEditId(null);
    }
  };

  const handleAssign = async (studentId: string) => {
    if (!selectedCounselorId) {
      toast.error('Please select a counselor');
      return;
    }
    const counselor = counselors.find(c => c._id === selectedCounselorId);
    if (!counselor) return;

    setAssigningId(studentId);
    try {
      await assignCounselor(studentId, selectedCounselorId, counselor.name);
      toast.success(`Counselor ${counselor.name} assigned successfully!`);
      setAssignDialogStudent(null);
      setSelectedCounselorId('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to assign counselor');
    } finally {
      setAssigningId(null);
    }
  };

  const handlePredict = async (studentId: string) => {
    setPredictingId(studentId);
    try {
      const result = await runPrediction(studentId);
      toast.success(`Prediction: ${result.riskLevel} risk (score: ${result.riskScore}%)`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to run prediction');
    } finally {
      setPredictingId(null);
    }
  };

  const handleDelete = async (studentId: string, name: string) => {
    if (!window.confirm(`Delete student ${name}? This cannot be undone.`)) return;
    setDeletingId(studentId);
    try {
      await deleteStudent(studentId);
      toast.success(`Student ${name} deleted`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete student');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Students</h1>
          <p className="text-muted-foreground text-sm">{students.length} total students in database</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchStudents} disabled={loadingStudents}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loadingStudents ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button size="sm" onClick={() => navigate('/teacher/add-student')}>
            <UserPlus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
      </div>

      {loadingStudents ? (
        <div className="stat-card py-16 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
          <span className="text-muted-foreground">Loading students from database...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="stat-card py-16 text-center">
          <p className="text-muted-foreground">
            {students.length === 0
              ? 'No students added yet. Click "Add" to add your first student.'
              : 'No students match your search.'}
          </p>
          {students.length === 0 && (
            <Button className="mt-4" onClick={() => navigate('/teacher/add-student')}>
              <UserPlus className="h-4 w-4 mr-2" /> Add First Student
            </Button>
          )}
        </div>
      ) : (
        <div className="stat-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase">Name</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase hidden sm:table-cell">Roll No.</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase hidden sm:table-cell">Source</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase hidden md:table-cell">Attendance</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase hidden md:table-cell">Marks</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase">Risk</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase">Counselor</th>
                <th className="text-right py-3 px-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-3 px-3 font-medium text-foreground">
                    <div>
                      <p>{s.name}</p>
                      {s.email && <p className="text-xs text-muted-foreground">{s.email}</p>}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-muted-foreground hidden sm:table-cell">{s.rollNumber}</td>
                  <td className="py-3 px-3 hidden sm:table-cell">
                    {s.isRegisteredOnly ? (
                      <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                        Registered
                      </span>
                    ) : (
                      <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded">
                        Added by Teacher
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-muted-foreground hidden md:table-cell">
                    {s.isRegisteredOnly ? '—' : `${s.attendancePercentage}%`}
                  </td>
                  <td className="py-3 px-3 text-muted-foreground hidden md:table-cell">
                    {s.isRegisteredOnly ? '—' : s.internalMarks}
                  </td>
                  <td className="py-3 px-3">
                    {s.riskLevel ? (
                      <div className="space-y-1">
                        <RiskBadge level={s.riskLevel} showScore score={s.riskScore} />
                        {s.riskFactors && s.riskFactors.length > 0 && s.riskFactors[0] !== 'No significant risk factors detected' && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {s.riskFactors.slice(0, 2).map((f, i) => (
                              <span key={i} className="text-xs bg-destructive/10 text-destructive px-1.5 py-0.5 rounded">
                                {f}
                              </span>
                            ))}
                            {s.riskFactors.length > 2 && (
                              <span className="text-xs text-muted-foreground">+{s.riskFactors.length - 2} more</span>
                            )}
                          </div>
                        )}
                      </div>
                    ) : <span className="text-xs text-muted-foreground">Not analyzed</span>}
                  </td>
                  <td className="py-3 px-3 text-xs text-muted-foreground">
                    {s.counselorName || '—'}
                    {s.counselingStatus && (
                      <span className="ml-1 text-xs opacity-70">({s.counselingStatus.replace('_', ' ')})</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Show message for registered-only students */}
                      {s.isRegisteredOnly ? (
                        <span className="text-xs text-muted-foreground italic">
                          No academic data yet
                        </span>
                      ) : (
                        <>
                          {/* Predict button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7"
                            disabled={predictingId === s.id}
                            onClick={() => handlePredict(s.id)}
                          >
                            {predictingId === s.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              s.riskLevel ? 'Re-analyze' : 'Analyze'
                            )}
                          </Button>

                          {/* Score History button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7"
                            title="Score History"
                            onClick={() => navigate(`/teacher/students/${s.id}/score-history`)}
                          >
                            <BarChart2 className="h-3 w-3" />
                          </Button>

                          {/* Behavioural Feedback button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7"
                            title="Behavioural Feedback"
                            onClick={() => navigate(`/teacher/behavioural-feedback/${s.id}`)}
                          >
                            <MessageSquare className="h-3 w-3" />
                          </Button>

                          {/* Edit data button */}
                          <Dialog
                            open={editStudentId === s.id}
                            onOpenChange={open => {
                              if (open) {
                                openEditDialog(s.id);
                              } else {
                                setEditStudentId(null);
                              }
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-7 gap-1"
                              >
                                <Pencil className="h-3 w-3" /> Edit data
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit academic data for {s.name}</DialogTitle>
                              </DialogHeader>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                <div className="space-y-1.5">
                                  <label className="text-xs font-medium" htmlFor="attendancePercentage">
                                    Attendance (%)
                                  </label>
                                  <Input
                                    id="attendancePercentage"
                                    type="number"
                                    value={editForm.attendancePercentage}
                                    onChange={e => updateEditForm('attendancePercentage', e.target.value)}
                                    placeholder="0-100"
                                    min={0}
                                    max={100}
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-xs font-medium" htmlFor="internalMarks">
                                    Internal Marks
                                  </label>
                                  <Input
                                    id="internalMarks"
                                    type="number"
                                    value={editForm.internalMarks}
                                    onChange={e => updateEditForm('internalMarks', e.target.value)}
                                    placeholder="0-100"
                                    min={0}
                                    max={100}
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-xs font-medium" htmlFor="assignmentCompletion">
                                    Assignment Completion (%)
                                  </label>
                                  <Input
                                    id="assignmentCompletion"
                                    type="number"
                                    value={editForm.assignmentCompletion}
                                    onChange={e => updateEditForm('assignmentCompletion', e.target.value)}
                                    placeholder="0-100"
                                    min={0}
                                    max={100}
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-xs font-medium" htmlFor="familyIncome">
                                    Family Income (₹)
                                  </label>
                                  <Input
                                    id="familyIncome"
                                    type="number"
                                    value={editForm.familyIncome}
                                    onChange={e => updateEditForm('familyIncome', e.target.value)}
                                    placeholder="Annual income"
                                    min={0}
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-xs font-medium" htmlFor="travelDistance">
                                    Travel Distance (km)
                                  </label>
                                  <Input
                                    id="travelDistance"
                                    type="number"
                                    value={editForm.travelDistance}
                                    onChange={e => updateEditForm('travelDistance', e.target.value)}
                                    placeholder="Distance in km"
                                    min={0}
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-xs font-medium" htmlFor="previousFailures">
                                    Previous Failures
                                  </label>
                                  <Input
                                    id="previousFailures"
                                    type="number"
                                    value={editForm.previousFailures}
                                    onChange={e => updateEditForm('previousFailures', e.target.value)}
                                    placeholder="Number of failures"
                                    min={0}
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-xs font-medium" htmlFor="engagementScore">
                                    Engagement Score
                                  </label>
                                  <Input
                                    id="engagementScore"
                                    type="number"
                                    value={editForm.engagementScore}
                                    onChange={e => updateEditForm('engagementScore', e.target.value)}
                                    placeholder="0-100"
                                    min={0}
                                    max={100}
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end gap-2 pt-4">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setEditStudentId(null)}
                                  disabled={savingEditId === s.id}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  type="button"
                                  onClick={handleSaveEdit}
                                  disabled={savingEditId === s.id}
                                >
                                  {savingEditId === s.id ? (
                                    <>
                                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                      Saving...
                                    </>
                                  ) : (
                                    'Save changes'
                                  )}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>

                          {/* Assign Counselor button - only if no counselor yet OR risk is high */}
                          {(!s.counselorId || s.riskLevel === 'high') && (
                            <Dialog
                              open={assignDialogStudent === s.id}
                              onOpenChange={open => {
                                setAssignDialogStudent(open ? s.id : null);
                                if (!open) setSelectedCounselorId('');
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-xs h-7 gap-1">
                                  <UserPlus className="h-3 w-3" /> Assign
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Assign Counselor to {s.name}</DialogTitle>
                                </DialogHeader>
                                <p className="text-sm text-muted-foreground mb-3">
                                  Select a counselor to assign to this student.
                                  {s.riskLevel === 'high' && (
                                    <span className="ml-1 text-destructive font-medium">⚠ High risk student</span>
                                  )}
                                </p>
                                {s.riskFactors && s.riskFactors.length > 0 && s.riskFactors[0] !== 'No significant risk factors detected' && (
                                  <div className="mb-3 p-2 bg-muted/50 rounded-lg">
                                    <p className="text-xs font-medium text-muted-foreground mb-1">Risk Factors:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {s.riskFactors.map((f, i) => (
                                        <span key={i} className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">{f}</span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {counselors.length === 0 ? (
                                  <p className="text-sm text-muted-foreground py-2">
                                    No counselors available. Please register counselors first.
                                  </p>
                                ) : (
                                  <Select value={selectedCounselorId} onValueChange={setSelectedCounselorId}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a counselor..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {counselors.map(c => (
                                        <SelectItem key={c._id} value={c._id}>
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium">{c.name}</span>
                                            {c.expertise && (
                                              <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded capitalize">
                                                {c.expertise}
                                              </span>
                                            )}
                                            <span className="text-muted-foreground text-xs">{c.email}</span>
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                                <div className="flex gap-2 justify-end mt-4">
                                  <Button variant="outline" onClick={() => setAssignDialogStudent(null)}>Cancel</Button>
                                  <Button
                                    onClick={() => handleAssign(s.id)}
                                    disabled={!selectedCounselorId || assigningId === s.id}
                                  >
                                    {assigningId === s.id ? (
                                      <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Assigning...</>
                                    ) : (
                                      'Confirm Assignment'
                                    )}
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}

                          {/* Delete button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7 text-destructive hover:text-destructive"
                            disabled={deletingId === s.id}
                            onClick={() => handleDelete(s.id, s.name)}
                            title="Delete student record"
                          >
                            {deletingId === s.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

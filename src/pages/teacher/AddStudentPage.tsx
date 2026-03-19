import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { UserPlus, BookOpen, DollarSign, Activity, Heart } from 'lucide-react';

export default function AddStudentPage() {
  const { addStudent } = useData();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', rollNumber: '', email: '', phoneNumber: '',
    // academic
    attendancePercentage: '', internalMarks: '', assignmentCompletion: '',
    previousFailures: '', engagementScore: '',
    // financial
    familyIncome: '', travelDistance: '',
    scholarshipStatus: 'none',
    partTimeJob: false,
    numberOfDependents: '',
    // behavioural
    disciplinaryActions: '', socialMediaHours: '',
    extracurricularParticipation: false,
    // medical
    hasChronicIllness: false, mentalHealthConcern: false, missedDueMedical: '',
  });

  const update = (key: string, val: string | boolean) => setForm(prev => ({ ...prev, [key]: val }));
  const num = (v: string) => Number(v) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.rollNumber) { toast.error('Name and Roll Number are required'); return; }
    setLoading(true);
    try {
      await addStudent({
        name: form.name, rollNumber: form.rollNumber,
        email: form.email || undefined, phoneNumber: form.phoneNumber || undefined,
        attendancePercentage: num(form.attendancePercentage),
        internalMarks: num(form.internalMarks),
        assignmentCompletion: num(form.assignmentCompletion),
        previousFailures: num(form.previousFailures),
        engagementScore: num(form.engagementScore),
        familyIncome: num(form.familyIncome),
        travelDistance: num(form.travelDistance),
        scholarshipStatus: form.scholarshipStatus as any,
        partTimeJob: form.partTimeJob,
        numberOfDependents: num(form.numberOfDependents),
        disciplinaryActions: num(form.disciplinaryActions),
        socialMediaHours: num(form.socialMediaHours),
        extracurricularParticipation: form.extracurricularParticipation,
        hasChronicIllness: form.hasChronicIllness,
        mentalHealthConcern: form.mentalHealthConcern,
        missedDueMedical: num(form.missedDueMedical),
        userId: undefined,
      });
      toast.success('Student added successfully!');
      navigate('/teacher/students');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground">Add Student</h1>
        <p className="text-muted-foreground text-sm">Enter student data across academic, financial, behavioural and medical dimensions.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="stat-card space-y-4">
          <h2 className="font-semibold text-foreground font-display flex items-center gap-2">
            <UserPlus className="h-4 w-4" /> Student Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs">Full Name <span className="text-destructive">*</span></Label>
              <Input id="name" placeholder="Student's full name" value={form.name} onChange={e => update('name', e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rollNumber" className="text-xs">Roll Number <span className="text-destructive">*</span></Label>
              <Input id="rollNumber" placeholder="e.g. CS2024007" value={form.rollNumber} onChange={e => update('rollNumber', e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs">Email (for student login)</Label>
              <Input id="email" type="email" placeholder="student@email.com" value={form.email} onChange={e => update('email', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phoneNumber" className="text-xs">Phone Number</Label>
              <Input id="phoneNumber" placeholder="+91 9876543210" value={form.phoneNumber} onChange={e => update('phoneNumber', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Academic */}
        <div className="stat-card space-y-4">
          <h2 className="font-semibold text-foreground font-display flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-blue-500" /> Academic Indicators
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'attendancePercentage', label: 'Attendance (%)', placeholder: '0–100' },
              { key: 'internalMarks', label: 'Internal Marks', placeholder: '0–100' },
              { key: 'assignmentCompletion', label: 'Assignment Completion (%)', placeholder: '0–100' },
              { key: 'engagementScore', label: 'Engagement Score', placeholder: '0–100' },
              { key: 'previousFailures', label: 'Previous Failures', placeholder: 'Count' },
            ].map(f => (
              <div key={f.key} className="space-y-1.5">
                <Label htmlFor={f.key} className="text-xs">{f.label}</Label>
                <Input id={f.key} type="number" placeholder={f.placeholder} min="0"
                  value={(form as any)[f.key]} onChange={e => update(f.key, e.target.value)} />
              </div>
            ))}
          </div>
        </div>

        {/* Financial */}
        <div className="stat-card space-y-4">
          <h2 className="font-semibold text-foreground font-display flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-yellow-500" /> Financial Indicators
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="familyIncome" className="text-xs">Family Income (₹/year)</Label>
              <Input id="familyIncome" type="number" placeholder="Annual income" min="0"
                value={form.familyIncome} onChange={e => update('familyIncome', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="travelDistance" className="text-xs">Travel Distance (km)</Label>
              <Input id="travelDistance" type="number" placeholder="One-way km" min="0"
                value={form.travelDistance} onChange={e => update('travelDistance', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Scholarship Status</Label>
              <Select value={form.scholarshipStatus} onValueChange={v => update('scholarshipStatus', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="full">Full</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="numberOfDependents" className="text-xs">Number of Dependents</Label>
              <Input id="numberOfDependents" type="number" placeholder="Family members supported" min="0"
                value={form.numberOfDependents} onChange={e => update('numberOfDependents', e.target.value)} />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg sm:col-span-2">
              <div>
                <p className="text-xs font-medium">Working Part-Time Job</p>
                <p className="text-xs text-muted-foreground">Student has a part-time job alongside studies</p>
              </div>
              <Switch checked={form.partTimeJob} onCheckedChange={v => update('partTimeJob', v)} />
            </div>
          </div>
        </div>

        {/* Behavioural */}
        <div className="stat-card space-y-4">
          <h2 className="font-semibold text-foreground font-display flex items-center gap-2">
            <Activity className="h-4 w-4 text-orange-500" /> Behavioural Indicators
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="disciplinaryActions" className="text-xs">Disciplinary Actions</Label>
              <Input id="disciplinaryActions" type="number" placeholder="Count this semester" min="0"
                value={form.disciplinaryActions} onChange={e => update('disciplinaryActions', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="socialMediaHours" className="text-xs">Social Media Usage (hrs/day)</Label>
              <Input id="socialMediaHours" type="number" placeholder="Average daily hours" min="0"
                value={form.socialMediaHours} onChange={e => update('socialMediaHours', e.target.value)} />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg sm:col-span-2">
              <div>
                <p className="text-xs font-medium">Extracurricular Participation</p>
                <p className="text-xs text-muted-foreground">Participates in clubs, sports or activities</p>
              </div>
              <Switch checked={form.extracurricularParticipation} onCheckedChange={v => update('extracurricularParticipation', v)} />
            </div>
          </div>
        </div>

        {/* Medical */}
        <div className="stat-card space-y-4">
          <h2 className="font-semibold text-foreground font-display flex items-center gap-2">
            <Heart className="h-4 w-4 text-red-500" /> Medical Indicators
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="missedDueMedical" className="text-xs">Days Missed Due to Medical</Label>
              <Input id="missedDueMedical" type="number" placeholder="Days this semester" min="0"
                value={form.missedDueMedical} onChange={e => update('missedDueMedical', e.target.value)} />
            </div>
            <div className="flex flex-col gap-3 sm:col-span-2">
              <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                <div>
                  <p className="text-xs font-medium">Chronic Illness</p>
                  <p className="text-xs text-muted-foreground">Has a chronic illness affecting attendance</p>
                </div>
                <Switch checked={form.hasChronicIllness} onCheckedChange={v => update('hasChronicIllness', v)} />
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                <div>
                  <p className="text-xs font-medium">Mental Health Concern</p>
                  <p className="text-xs text-muted-foreground">Reported or observed mental health concern</p>
                </div>
                <Switch checked={form.mentalHealthConcern} onCheckedChange={v => update('mentalHealthConcern', v)} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Add Student'}</Button>
          <Button type="button" variant="outline" onClick={() => navigate('/teacher/students')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}

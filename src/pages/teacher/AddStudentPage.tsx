import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

export default function AddStudentPage() {
  const { addStudent } = useData();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    rollNumber: '',
    email: '',
    phoneNumber: '',
    attendancePercentage: '',
    internalMarks: '',
    assignmentCompletion: '',
    familyIncome: '',
    travelDistance: '',
    previousFailures: '',
    engagementScore: '',
  });

  const update = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.rollNumber) {
      toast.error('Name and Roll Number are required');
      return;
    }

    setLoading(true);
    try {
      // Add student record to database; if an email is provided, the backend
      // will automatically create a corresponding student user account with
      // initial password set to that email.
      await addStudent({
        name: form.name,
        rollNumber: form.rollNumber,
        email: form.email || undefined,
        phoneNumber: form.phoneNumber || undefined,
        attendancePercentage: Number(form.attendancePercentage) || 0,
        internalMarks: Number(form.internalMarks) || 0,
        assignmentCompletion: Number(form.assignmentCompletion) || 0,
        familyIncome: Number(form.familyIncome) || 0,
        travelDistance: Number(form.travelDistance) || 0,
        previousFailures: Number(form.previousFailures) || 0,
        engagementScore: Number(form.engagementScore) || 0,
        userId: undefined,
      });

      toast.success('Student added successfully and saved to database!');
      navigate('/teacher/students');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  const academicFields = [
    { key: 'attendancePercentage', label: 'Attendance (%)', type: 'number', placeholder: '0-100' },
    { key: 'internalMarks', label: 'Internal Marks', type: 'number', placeholder: '0-100' },
    { key: 'assignmentCompletion', label: 'Assignment Completion (%)', type: 'number', placeholder: '0-100' },
    { key: 'familyIncome', label: 'Family Income (₹)', type: 'number', placeholder: 'Annual income' },
    { key: 'travelDistance', label: 'Travel Distance (km)', type: 'number', placeholder: 'Distance in km' },
    { key: 'previousFailures', label: 'Previous Failures', type: 'number', placeholder: 'Number of failures' },
    { key: 'engagementScore', label: 'Engagement Score', type: 'number', placeholder: '0-100' },
  ];

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground">Add Student</h1>
        <p className="text-muted-foreground text-sm">Enter student academic and demographic data. This will be saved to the database.</p>
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
              <Input id="name" type="text" placeholder="Student's full name" value={form.name} onChange={e => update('name', e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rollNumber" className="text-xs">Roll Number <span className="text-destructive">*</span></Label>
              <Input id="rollNumber" type="text" placeholder="e.g. CS2024007" value={form.rollNumber} onChange={e => update('rollNumber', e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs">Email (for student login)</Label>
              <Input id="email" type="email" placeholder="student@email.com" value={form.email} onChange={e => update('email', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phoneNumber" className="text-xs">Phone Number</Label>
              <Input id="phoneNumber" type="text" placeholder="+91 9876543210" value={form.phoneNumber} onChange={e => update('phoneNumber', e.target.value)} />
            </div>
            <div className="sm:col-span-2 text-xs text-muted-foreground">
              If you provide an email, a student login will be created automatically.
              The initial password will be set to the same value as the email (students
              should change it after first login).
            </div>
          </div>
        </div>

        {/* Academic Data */}
        <div className="stat-card space-y-4">
          <h2 className="font-semibold text-foreground font-display">Academic & Risk Factors</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {academicFields.map(f => (
              <div key={f.key} className="space-y-1.5">
                <Label htmlFor={f.key} className="text-xs">{f.label}</Label>
                <Input
                  id={f.key}
                  type={f.type}
                  placeholder={f.placeholder}
                  value={(form as any)[f.key]}
                  onChange={e => update(f.key, e.target.value)}
                  min="0"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Add Student'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/teacher/students')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}

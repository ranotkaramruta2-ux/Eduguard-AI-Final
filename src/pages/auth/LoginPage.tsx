import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_ROUTES } from '@/utils/constants';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated && user) {
    navigate(ROLE_ROUTES[user.role], { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Login successful!');
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary flex-col justify-between p-12 text-primary-foreground">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold font-display">EduPredict</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold font-display leading-tight mb-4">
            AI-Powered Student<br />Dropout Prediction
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-md">
            Identify at-risk students early and provide timely counseling interventions to improve retention rates.
          </p>
        </div>
        <div className="flex gap-6 text-sm text-primary-foreground/60">
          <div>
            <p className="text-2xl font-bold text-primary-foreground">95%</p>
            <p>Prediction Accuracy</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary-foreground">40%</p>
            <p>Dropout Reduction</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary-foreground">500+</p>
            <p>Students Helped</p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold font-display text-foreground">EduPredict</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold font-display text-foreground">Welcome back</h2>
            <p className="text-muted-foreground mt-1">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">Register</Link>
          </p>

          <div className="bg-muted rounded-lg p-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Demo Accounts</p>
            <div className="grid gap-1 text-xs text-muted-foreground">
              <p><span className="font-medium text-foreground">Teacher:</span> teacher@demo.com / password123</p>
              <p><span className="font-medium text-foreground">Student:</span> student@demo.com / password123</p>
              <p><span className="font-medium text-foreground">Counselor:</span> counselor@demo.com / password123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

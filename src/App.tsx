import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';

import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import UnauthorizedPage from '@/pages/UnauthorizedPage';
import NotFound from '@/pages/NotFound';

import TeacherDashboard from '@/pages/teacher/TeacherDashboard';
import AddStudentPage from '@/pages/teacher/AddStudentPage';
import UploadDatasetPage from '@/pages/teacher/UploadDatasetPage';
import StudentListPage from '@/pages/teacher/StudentListPage';
import RunPredictionPage from '@/pages/teacher/RunPredictionPage';
import StudentScoreHistoryPage from '@/pages/teacher/StudentScoreHistoryPage';
import BehaviouralFeedbackPage from '@/pages/teacher/BehaviouralFeedbackPage';

import StudentDashboard from '@/pages/student/StudentDashboard';
import MyProfilePage from '@/pages/student/MyProfilePage';
import MyRiskStatusPage from '@/pages/student/MyRiskStatusPage';
import CounselingHistoryPage from '@/pages/student/CounselingHistoryPage';
import MyScoreHistoryPage from '@/pages/student/MyScoreHistoryPage';
import MyBehaviouralFeedbackPage from '@/pages/student/MyBehaviouralFeedbackPage';

import CounselorDashboard from '@/pages/counselor/CounselorDashboard';
import AssignedStudentsPage from '@/pages/counselor/AssignedStudentsPage';
import CounselingSessionPage from '@/pages/counselor/CounselingSessionPage';

import AnalyticsDashboard from '@/pages/analytics/AnalyticsDashboard';
import NotificationsPage from '@/pages/notifications/NotificationsPage';

const App = () => (
  <AuthProvider>
    <DataProvider>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Teacher Routes */}
            <Route path="/teacher" element={<ProtectedRoute allowedRoles={['teacher']}><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<TeacherDashboard />} />
              <Route path="students" element={<StudentListPage />} />
              <Route path="add-student" element={<AddStudentPage />} />
              <Route path="upload" element={<UploadDatasetPage />} />
              <Route path="predict" element={<RunPredictionPage />} />
              <Route path="analytics" element={<AnalyticsDashboard />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="students/:id/score-history" element={<StudentScoreHistoryPage />} />
              <Route path="behavioural-feedback/:id" element={<BehaviouralFeedbackPage />} />
            </Route>

            {/* Student Routes */}
            <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<StudentDashboard />} />
              <Route path="profile" element={<MyProfilePage />} />
              <Route path="risk" element={<MyRiskStatusPage />} />
              <Route path="counseling" element={<CounselingHistoryPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="score-history" element={<MyScoreHistoryPage />} />
              <Route path="behavioural-feedback" element={<MyBehaviouralFeedbackPage />} />
            </Route>

            {/* Counselor Routes */}
            <Route path="/counselor" element={<ProtectedRoute allowedRoles={['counselor']}><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<CounselorDashboard />} />
              <Route path="assigned" element={<AssignedStudentsPage />} />
              <Route path="sessions" element={<CounselingSessionPage />} />
              <Route path="analytics" element={<AnalyticsDashboard />} />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </DataProvider>
  </AuthProvider>
);

export default App;

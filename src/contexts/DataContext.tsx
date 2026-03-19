import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Student, CounselingNote, Notification } from '@/utils/constants';
import { studentAPI, predictionAPI, counselingAPI, notificationAPI, authAPI, CounselorUser } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

// ─── Helper: map backend StudentData → frontend Student ───────────────────────
function mapStudent(s: any): Student {
  return {
    id: s._id,
    name: s.name,
    rollNumber: s.rollNumber,
    email: s.email,
    phoneNumber: s.phoneNumber,
    attendancePercentage: s.attendancePercentage,
    internalMarks: s.internalMarks,
    assignmentCompletion: s.assignmentCompletion,
    familyIncome: s.familyIncome,
    travelDistance: s.travelDistance,
    previousFailures: s.previousFailures,
    engagementScore: s.engagementScore,
    riskScore: s.riskScore,
    riskLevel: s.riskLevel,
    recommendation: s.recommendation,
    riskFactors: s.riskFactors,
    counselorType: s.counselorType,
    scholarshipStatus: s.scholarshipStatus,
    partTimeJob: s.partTimeJob,
    numberOfDependents: s.numberOfDependents,
    disciplinaryActions: s.disciplinaryActions,
    socialMediaHours: s.socialMediaHours,
    extracurricularParticipation: s.extracurricularParticipation,
    hasChronicIllness: s.hasChronicIllness,
    mentalHealthConcern: s.mentalHealthConcern,
    missedDueMedical: s.missedDueMedical,
    counselorId: s.counselorId?._id || s.counselorId,
    counselorName: s.counselorId?.name,
    counselingStatus: s.counselingStatus,
    userId: s.userId?._id || s.userId,
  };
}

// ─── Helper: map backend Notification → frontend Notification ─────────────────
function mapNotification(n: any): Notification {
  return {
    id: n._id,
    message: n.message,
    type: n.type === 'system' ? 'update' : n.type,
    read: n.status === 'read',
    date: n.createdAt,
    userId: n.userId?._id || n.userId,
  };
}

interface DataContextType {
  students: Student[];
  notes: CounselingNote[];
  notifications: Notification[];
  counselors: CounselorUser[];
  loadingStudents: boolean;
  loadingNotifications: boolean;
  // Student operations
  fetchStudents: () => Promise<void>;
  addStudent: (s: Omit<Student, 'id'>) => Promise<Student>;
  addStudents: (s: Omit<Student, 'id'>[]) => void;
  deleteStudent: (id: string) => Promise<void>;
  // Prediction operations
  runPrediction: (studentId: string) => Promise<Student>;
  runAllPredictions: () => Promise<void>;
  // Counseling operations
  assignCounselor: (studentId: string, counselorId: string, counselorName: string) => Promise<void>;
  addCounselingNote: (counselingId: string, note: string) => Promise<void>;
  updateCounselingStatus: (counselingId: string, status: 'pending' | 'in_progress' | 'resolved') => Promise<void>;
  fetchCounselingForStudent: (studentId: string) => Promise<any[]>;
  // Notification operations
  fetchNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  addNotification: (n: Omit<Notification, 'id'>) => void;
  // Counselors list
  fetchCounselors: () => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();

  const [students, setStudents] = useState<Student[]>([]);
  const [notes, setNotes] = useState<CounselingNote[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [counselors, setCounselors] = useState<CounselorUser[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Fetch all students from backend
  const fetchStudents = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoadingStudents(true);
      const res = await studentAPI.getAll();
      setStudents(res.data.map(mapStudent));
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setLoadingStudents(false);
    }
  }, [isAuthenticated]);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoadingNotifications(true);
      const res = await notificationAPI.getAll();
      setNotifications(res.data.map(mapNotification));
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoadingNotifications(false);
    }
  }, [isAuthenticated]);

  // Fetch counselors list
  const fetchCounselors = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await authAPI.getCounselors();
      setCounselors(res.data);
    } catch (err) {
      console.error('Failed to fetch counselors:', err);
    }
  }, [isAuthenticated]);

  // Auto-fetch when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Whenever a user logs in or changes, fetch fresh data using their token
      fetchStudents();
      fetchNotifications();
      if (user.role === 'teacher') {
        fetchCounselors();
      }
    }
    if (!isAuthenticated) {
      setStudents([]);
      setNotifications([]);
      setCounselors([]);
      setNotes([]);
    }
  }, [isAuthenticated, user, fetchStudents, fetchNotifications, fetchCounselors]);

  // ─── Student Operations ────────────────────────────────────────────────────

  const addStudent = useCallback(async (s: Omit<Student, 'id'>): Promise<Student> => {
    const res = await studentAPI.add({
      name: s.name,
      rollNumber: s.rollNumber,
      email: s.email,
      phoneNumber: s.phoneNumber,
      attendancePercentage: s.attendancePercentage,
      internalMarks: s.internalMarks,
      assignmentCompletion: s.assignmentCompletion,
      familyIncome: s.familyIncome,
      travelDistance: s.travelDistance,
      previousFailures: s.previousFailures,
      engagementScore: s.engagementScore,
      userId: s.userId,
    });
    const newStudent = mapStudent(res.data);
    setStudents(prev => [newStudent, ...prev]);
    return newStudent;
  }, []);

  const addStudents = useCallback((ss: Omit<Student, 'id'>[]) => {
    // Used after CSV upload - just re-fetch
    fetchStudents();
  }, [fetchStudents]);

  const deleteStudent = useCallback(async (id: string) => {
    await studentAPI.delete(id);
    setStudents(prev => prev.filter(s => s.id !== id));
  }, []);

  // ─── Prediction Operations ─────────────────────────────────────────────────

  const runPrediction = useCallback(async (studentId: string): Promise<Student> => {
    const res = await predictionAPI.runForStudent(studentId);
    const updated = mapStudent(res.data.student);
    setStudents(prev => prev.map(s => s.id === studentId ? updated : s));
    // Also refresh notifications since high-risk detection may create them
    await fetchNotifications();
    return updated;
  }, [fetchNotifications]);

  const runAllPredictions = useCallback(async () => {
    // Run predictions sequentially for all students without risk level
    const studentsToPredict = students.filter(s => !s.riskLevel);
    for (const student of studentsToPredict) {
      try {
        await runPrediction(student.id);
      } catch (err) {
        console.error(`Failed prediction for ${student.name}:`, err);
      }
    }
    // Also run for students who already have a prediction to refresh
    const studentsWithPrediction = students.filter(s => s.riskLevel);
    for (const student of studentsWithPrediction) {
      try {
        await runPrediction(student.id);
      } catch (err) {
        console.error(`Failed prediction for ${student.name}:`, err);
      }
    }
  }, [students, runPrediction]);

  // ─── Counseling Operations ─────────────────────────────────────────────────

  const assignCounselor = useCallback(async (
    studentId: string,
    counselorId: string,
    counselorName: string
  ) => {
    await counselingAPI.assign(studentId, counselorId);
    // Update local student state
    setStudents(prev => prev.map(s =>
      s.id === studentId
        ? { ...s, counselorId, counselorName, counselingStatus: 'pending' as const }
        : s
    ));
    await fetchNotifications();
  }, [fetchNotifications]);

  const addCounselingNote = useCallback(async (counselingId: string, note: string) => {
    await counselingAPI.addNote(counselingId, note);
  }, []);

  const updateCounselingStatus = useCallback(async (
    counselingId: string,
    status: 'pending' | 'in_progress' | 'resolved'
  ) => {
    await counselingAPI.updateStatus(counselingId, status);
    // Refresh students to get updated counseling status
    await fetchStudents();
  }, [fetchStudents]);

  const fetchCounselingForStudent = useCallback(async (studentId: string) => {
    const res = await counselingAPI.getForStudent(studentId);
    return res.data;
  }, []);

  // ─── Notification Operations ───────────────────────────────────────────────

  const markNotificationRead = useCallback(async (id: string) => {
    await notificationAPI.markRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    await notificationAPI.markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const addNotification = useCallback((n: Omit<Notification, 'id'>) => {
    setNotifications(prev => [{ ...n, id: Date.now().toString() }, ...prev]);
  }, []);

  return (
    <DataContext.Provider value={{
      students,
      notes,
      notifications,
      counselors,
      loadingStudents,
      loadingNotifications,
      fetchStudents,
      addStudent,
      addStudents,
      deleteStudent,
      runPrediction,
      runAllPredictions,
      assignCounselor,
      addCounselingNote,
      updateCounselingStatus,
      fetchCounselingForStudent,
      fetchNotifications,
      markNotificationRead,
      markAllNotificationsRead,
      addNotification,
      fetchCounselors,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

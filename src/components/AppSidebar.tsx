import {
  LayoutDashboard, Users, Upload, Brain, BarChart3, Bell,
  UserCircle, ShieldAlert, MessageSquare, ClipboardList, GraduationCap, BarChart2,
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const MENU: Record<string, { title: string; url: string; icon: React.ElementType }[]> = {
  teacher: [
    { title: 'Dashboard', url: '/teacher', icon: LayoutDashboard },
    { title: 'Students', url: '/teacher/students', icon: Users },
    { title: 'Add Student', url: '/teacher/add-student', icon: UserCircle },
    { title: 'Upload Dataset', url: '/teacher/upload', icon: Upload },
    { title: 'Run Prediction', url: '/teacher/predict', icon: Brain },
    { title: 'Analytics', url: '/teacher/analytics', icon: BarChart3 },
    { title: 'Notifications', url: '/teacher/notifications', icon: Bell },
  ],
  student: [
    { title: 'Dashboard', url: '/student', icon: LayoutDashboard },
    { title: 'My Profile', url: '/student/profile', icon: UserCircle },
    { title: 'Risk Status', url: '/student/risk', icon: ShieldAlert },
    { title: 'Score History', url: '/student/score-history', icon: BarChart2 },
    { title: 'Feedback', url: '/student/behavioural-feedback', icon: MessageSquare },
    { title: 'Counseling', url: '/student/counseling', icon: ClipboardList },
    { title: 'Notifications', url: '/student/notifications', icon: Bell },
  ],
  counselor: [
    { title: 'Dashboard', url: '/counselor', icon: LayoutDashboard },
    { title: 'Assigned Students', url: '/counselor/assigned', icon: ClipboardList },
    { title: 'Counseling Sessions', url: '/counselor/sessions', icon: MessageSquare },
    { title: 'Analytics', url: '/counselor/analytics', icon: BarChart3 },
    { title: 'Notifications', url: '/counselor/notifications', icon: Bell },
  ],
};

export default function AppSidebar() {
  const { user } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const items = MENU[user?.role ?? 'student'] ?? [];

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent className="bg-sidebar">
        {/* Logo */}
        <div className="p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg gradient-primary flex items-center justify-center shrink-0">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-sidebar-foreground truncate">EduPredict</h2>
              <p className="text-[10px] text-sidebar-foreground/60">AI Dropout Prediction</p>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-[10px] uppercase tracking-wider">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(item => {
                const isActive = location.pathname === item.url ||
                  (item.url !== `/${user?.role}` && location.pathname.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive
                            ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium'
                            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                        }`}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

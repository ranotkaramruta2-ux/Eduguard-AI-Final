import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { notificationAPI } from '@/lib/api';
import { Bell, CheckCircle, Trash2, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useState } from 'react';

export default function NotificationsPage() {
  const { user } = useAuth();
  const { notifications, markNotificationRead, markAllNotificationsRead, fetchNotifications, loadingNotifications } = useData();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      toast.success('All notifications marked as read');
    } catch (err: any) {
      toast.error(err.message || 'Failed to mark all as read');
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
    } catch (err: any) {
      toast.error(err.message || 'Failed to mark as read');
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await notificationAPI.delete(id);
      // Re-fetch to update list
      await fetchNotifications();
      toast.success('Notification deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground">{unreadCount} unread</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchNotifications} disabled={loadingNotifications}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loadingNotifications ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
              <CheckCircle className="h-4 w-4 mr-1" /> Mark All Read
            </Button>
          )}
        </div>
      </div>

      {loadingNotifications ? (
        <div className="stat-card py-12 flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-2">
          {notifications.map(n => (
            <div key={n.id} className={`stat-card flex items-start gap-3 ${!n.read ? 'border-l-4 border-primary' : ''}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                n.type === 'risk' ? 'bg-destructive/10' :
                n.type === 'counseling' ? 'bg-primary/10' :
                'bg-accent/10'
              }`}>
                <Bell className={`h-4 w-4 ${
                  n.type === 'risk' ? 'text-destructive' :
                  n.type === 'counseling' ? 'text-primary' :
                  'text-accent'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(n.date).toLocaleString()}
                </p>
                <span className={`text-xs px-1.5 py-0.5 rounded mt-1 inline-block ${
                  n.type === 'risk' ? 'bg-destructive/10 text-destructive' :
                  n.type === 'counseling' ? 'bg-primary/10 text-primary' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {n.type}
                </span>
              </div>
              <div className="flex gap-1 shrink-0">
                {!n.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => handleMarkRead(n.id)}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" /> Read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(n.id)}
                  disabled={deletingId === n.id}
                >
                  {deletingId === n.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="stat-card py-12 text-center">
          <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No notifications yet.</p>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Menu, Bell, Sun, Moon, LogOut, Settings, UserCircle, RotateCw } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/app/store/auth.store';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useRefreshUser } from '@/features/auth/hooks/useRefreshUser';
import { api } from '@/shared/api/httpClient';
import type { AuthUser } from '@/shared/types/rbac.types';
import { RBACUtils } from '@/shared/hooks/rbac';
import './Header.css';

interface HeaderProps {
  toggleSidebar: () => void;
}

type NotificationItem = {
  id: number;
  title?: string;
  message?: string;
  data?: {
    title?: string;
    message?: string;
  };
  read_at?: string | null;
  created_at?: string;
};

const getDisplayName = (user: AuthUser | null) => {
  return (
    user?.name ||
    user?.email ||
    "User"
  );
};

const getDisplayRole = (user: AuthUser | null) => {
  if (Array.isArray(user?.roles) && user.roles.length > 0) {
    const primaryRole = user.roles[0];
    if (primaryRole?.name) {
      return RBACUtils.getRoleDisplayName(primaryRole.name);
    }
  }

  return "Employee";
};

const getInitials = (name: string) => {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) return "U";

  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
};

export const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.dataset.theme === 'dark');
  const user = useAuthStore((state) => state.user);
  const { handleLogout } = useAuth();
  const { refreshUserData } = useRefreshUser();
  const navigate = useNavigate();
  const displayName = getDisplayName(user);
  const displayRole = getDisplayRole(user);
  const initials = getInitials(displayName);

  // Notification State
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [openNotifications, setOpenNotifications] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      const responseData = response.data?.data;
      
      // Handle Laravel Pagination: data.data.data OR Simple Array: data.data
      const data = Array.isArray(responseData) 
        ? responseData 
        : (responseData && Array.isArray(responseData.data) ? responseData.data : []);
        
      const notificationsData = data as NotificationItem[];
      setNotifications(notificationsData);
      setUnreadCount(notificationsData.filter((n) => !n.read_at).length);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  React.useEffect(() => {
    if (user) {
      void fetchNotifications();
      const interval = setInterval(() => void fetchNotifications(), 30000); // Polling every 30s
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    document.documentElement.dataset.theme = isDarkMode ? 'dark' : 'light';
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const markAsRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`);
      void fetchNotifications();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      void fetchNotifications();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const onLogout = async () => {
    await handleLogout();
    // 💡 Tidak perlu navigate manual di sini karena handleLogout -> forceLogout 
    // sudah menangani redirect dengan delay agar toast sempat muncul.
  };

  const onRefreshUser = async (event?: React.MouseEvent<HTMLButtonElement>) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    setIsRefreshing(true);
    try {
      await refreshUserData();
    } finally {
      setIsRefreshing(false);
    }
  };

  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const getBreadcrumbLabel = (path: string) => {
    return path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
  };

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button 
          className="icon-button" 
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
        >
          <Menu size={24} />
        </button>
        <div className="header-breadcrumb">
          <span className="breadcrumb-item" onClick={() => navigate('/')}>Home</span>
          {pathnames.map((value, index) => {
            const isLast = index === pathnames.length - 1;
            const to = `/${pathnames.slice(0, index + 1).join('/')}`;
            return (
              <React.Fragment key={to}>
                <ChevronRight size={16} className="breadcrumb-separator" />
                <span 
                  className={`breadcrumb-item ${isLast ? 'active' : ''}`}
                  onClick={() => !isLast && navigate(to)}
                >
                  {getBreadcrumbLabel(value)}
                </span>
              </React.Fragment>
            );
          })}
        </div>
      </div>
      
      <div className="header-right">
        <div className="header-actions" role="group" aria-label="Header actions">
          <button 
            type="button"
            className="icon-button" 
            onClick={(event) => void onRefreshUser(event)}
            disabled={isRefreshing}
            aria-label="Refresh user data"
            title="Refresh user data & roles"
          >
            <RotateCw size={24} className={isRefreshing ? 'rotating' : ''} />
          </button>

          <button
            className="icon-button"
            aria-label="Toggle Dark Mode"
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={() => setIsDarkMode((prev) => !prev)}
          >
            {isDarkMode ? <Moon size={24} /> : <Sun size={24} />}
          </button>
          
          <div className="notification-wrapper">
            <button 
              className="icon-button" 
              aria-label="Notifications"
              onClick={() => setOpenNotifications(!openNotifications)}
            >
              <Bell size={24} />
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>

            {openNotifications && (
              <div className="notification-dropdown visible">
                <div className="notification-dropdown-header">
                  <h3>Notifikasi</h3>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {unreadCount > 0 && (
                      <button 
                        onClick={() => void markAllAsRead()}
                        style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Tandai semua dibaca
                      </button>
                    )}
                    {unreadCount > 0 && <span className="unread-count">{unreadCount}</span>}
                  </div>
                </div>
                <div className="notification-list">
                  {notifications.length === 0 ? (
                    <div className="notification-empty">Tidak ada notifikasi</div>
                  ) : (
                    notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`notification-item ${!n.read_at ? 'unread' : ''}`}
                        onClick={() => void markAsRead(n.id)}
                      >
                        <div className="notification-item-icon">
                          <Bell size={16} />
                        </div>
                        <div className="notification-item-content">
                          <p className="notification-title">{n.title || n.data?.title || 'Notifikasi Baru'}</p>
                          <p className="notification-message">{n.message || n.data?.message || 'Anda memiliki pesan baru'}</p>
                          <span className="notification-time">
                            {n.created_at ? new Date(n.created_at).toLocaleTimeString() : ''}
                          </span>
                        </div>
                        {!n.read_at && <div className="unread-dot"></div>}
                      </div>
                    ))
                  )}
                </div>
                <div className="notification-dropdown-footer">
                  <button onClick={() => setOpenNotifications(false)}>Tutup</button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div
          className="user-profile"
          onClick={() => setOpenDropdown((prev) => !prev)}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              setOpenDropdown((prev) => !prev);
            }
          }}
        >
          <div className="avatar">
            <span>{initials}</span>
          </div>
          <div className="user-info">
            <span className="user-name">{displayName}</span>
            <span className="user-role">{displayRole}</span>
          </div>
          
          <div className={`user-dropdown ${openDropdown ? 'visible' : ''}`}>
            <button className="dropdown-item" type="button" onClick={() => navigate('//profiles')}>
              <UserCircle size={24} />
              <span>Profile Saya</span>
            </button>
            <button className="dropdown-item" type="button" onClick={() => navigate('/settings/company')}>
              <Settings size={24} />
              <span>Settings</span>
            </button>
            <button className="dropdown-item logout-item" type="button" onClick={() => void onLogout()}>
              <LogOut size={24} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import { Menu, Search, Bell, Sun, LogOut, Settings, UserCircle, RotateCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/app/store/auth.store';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useRefreshUser } from '@/features/auth/hooks/useRefreshUser';
import './Header.css';

interface HeaderProps {
  toggleSidebar: () => void;
}

const getDisplayName = (user: any) => {
  return (
    user?.name ||
    user?.full_name ||
    user?.fullname ||
    user?.username ||
    user?.email ||
    "User"
  );
};

const getDisplayRole = (user: any) => {
  // Check for normalized roles array first
  if (Array.isArray(user?.roles) && user.roles.length > 0) {
    const primaryRole = user.roles[0];
    if (typeof primaryRole === "object" && primaryRole?.name) {
      return primaryRole.name === "employee" ? "Employee" : primaryRole.name;
    }
  }

  const role =
    user?.role?.name ||
    user?.role_name ||
    user?.role ||
    user?.position?.name ||
    user?.position;

  return typeof role === "string" && role.trim().length > 0 ? role : "Employee";
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
  const user = useAuthStore((state) => state.user);
  const { handleLogout } = useAuth();
  const { refreshUserData } = useRefreshUser();
  const navigate = useNavigate();
  const displayName = getDisplayName(user);
  const displayRole = getDisplayRole(user);
  const initials = getInitials(displayName);

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

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button 
          className="icon-button" 
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
        >
          <Menu size={40} />
        </button>
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
            <RotateCw size={24} className={isRefreshing ? 'rotating header-action-icon' : 'header-action-icon'} />
          </button>

          <button className="icon-button" aria-label="Toggle Dark Mode">
            <Sun size={24} className="header-action-icon" />
          </button>
          
          <div className="notification-wrapper">
            <button className="icon-button" aria-label="Notifications">
              <Bell size={24} className="header-action-icon" />
              <span className="notification-badge"></span>
            </button>
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
              <span>Pengaturan</span>
            </button>
            <button className="dropdown-item logout-item" type="button" onClick={() => void onLogout()}>
              <LogOut size={24} />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
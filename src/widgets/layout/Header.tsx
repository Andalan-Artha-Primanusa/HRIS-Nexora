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
    navigate("/login", { replace: true });
  };

  const onRefreshUser = async () => {
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
          <Menu size={20} />
        </button>
        
        <div className="search-bar">
          <Search size={18} className="search-icon text-gray" />
          <input 
            type="text" 
            placeholder="Search employee, leave, payroll..." 
            className="search-input"
          />
        </div>
      </div>
      
      <div className="header-right">
        <button 
          className="icon-button" 
          onClick={onRefreshUser}
          disabled={isRefreshing}
          aria-label="Refresh user data"
          title="Refresh user data & roles"
        >
          <RotateCw size={20} className={isRefreshing ? 'rotating' : ''} />
        </button>

        <button className="icon-button" aria-label="Toggle Dark Mode">
          <Sun size={20} />
        </button>
        
        <div className="notification-wrapper">
          <button className="icon-button" aria-label="Notifications">
            <Bell size={20} />
            <span className="notification-badge"></span>
          </button>
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
            <button className="dropdown-item" type="button" onClick={() => navigate('/settings/user-role')}>
              <UserCircle size={16} />
              <span>Profile</span>
            </button>
            <button className="dropdown-item" type="button" onClick={() => navigate('/settings/company')}>
              <Settings size={16} />
              <span>Settings</span>
            </button>
            <button className="dropdown-item logout-item" type="button" onClick={() => void onLogout()}>
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
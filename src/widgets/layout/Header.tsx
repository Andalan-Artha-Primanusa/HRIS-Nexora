import React from 'react';
import { Menu, Search, Bell, Sun, LogOut } from 'lucide-react';
import { useAuthStore } from '@/app/store/auth.store';
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
  const user = useAuthStore((state) => state.user);
  const displayName = getDisplayName(user);
  const displayRole = getDisplayRole(user);
  const initials = getInitials(displayName);

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
        <button className="icon-button" aria-label="Toggle Dark Mode">
          <Sun size={20} />
        </button>
        
        <div className="notification-wrapper">
          <button className="icon-button" aria-label="Notifications">
            <Bell size={20} />
            <span className="notification-badge"></span>
          </button>
        </div>
        
        <div className="user-profile">
          <div className="avatar">
            <span>{initials}</span>
          </div>
          <div className="user-info">
            <span className="user-name">{displayName}</span>
            <span className="user-role">{displayRole}</span>
          </div>
          
          <div className="user-dropdown">
            <LogOut size={16} className="text-gray" />
            <span>Logout</span>
          </div>
        </div>
      </div>
    </header>
  );
};


import React, { useState } from 'react';
import { Menu, Search, Bell, Sun, LogOut, Settings, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  const [openDropdown, setOpenDropdown] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const displayName = getDisplayName(user);
  const displayRole = getDisplayRole(user);
  const initials = getInitials(displayName);

  const handleLogout = () => {
    logout();
    navigate("/login");
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
            <button className="dropdown-item logout-item" type="button" onClick={handleLogout}>
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};


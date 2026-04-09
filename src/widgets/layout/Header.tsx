import React from "react";
import { Menu, Search, Bell, Sun, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom"; // ✅ [NEW]
import { useAuthStore } from "@/app/store/auth.store";
import type { User } from "@/features/auth/types/auth.types";
import "./Header.css";

interface HeaderProps {
  toggleSidebar: () => void;
}

/* =========================
   HELPERS
========================= */

const getInitials = (name: string): string => {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) return "U";

  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
};

const getDisplayName = (user: User | null): string => {
  return user?.name || user?.email || "User";
};

const getDisplayRole = (user: User | null): string => {
  return user?.role?.name || "Employee";
};

/* =========================
   COMPONENT
========================= */

export const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { user, logout } = useAuthStore();

  const navigate = useNavigate(); // ✅ [NEW]

  const displayName = getDisplayName(user);
  const displayRole = getDisplayRole(user);
  const initials = getInitials(displayName);

  // ✅ [UPDATED]
  const handleLogout = async () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (!confirmed) return;

    await logout();

    // 🔥 GANTI INI
    window.location.href = "/login";
  };

  return (
    <header className="dashboard-header">
      {/* LEFT */}
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

      {/* RIGHT */}
      <div className="header-right">
        {/* DARK MODE */}
        <button className="icon-button" aria-label="Toggle Dark Mode">
          <Sun size={20} />
        </button>

        {/* NOTIFICATION */}
        <div className="notification-wrapper">
          <button className="icon-button" aria-label="Notifications">
            <Bell size={20} />
            <span className="notification-badge"></span>
          </button>
        </div>

        {/* USER */}
        <div className="user-profile">
          <div className="avatar">
            <span>{initials}</span>
          </div>

          <div className="user-info">
            <span className="user-name">{displayName}</span>
            <span className="user-role">{displayRole}</span>
          </div>

          {/* LOGOUT */}
          <button className="user-dropdown" onClick={handleLogout}>
            <LogOut size={16} className="text-gray" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
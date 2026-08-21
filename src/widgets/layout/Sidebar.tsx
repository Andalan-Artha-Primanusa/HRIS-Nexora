import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { ChevronRight, X } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import './Sidebar.css';

import { menuItems, essMenuItems } from '@/shared/config/menu';
import type { MenuItem } from '@/shared/config/menu';
import { useAuthStore } from '@/app/store/auth.store';
import { filterMenuItems, fetchAllowedMenuKeys } from '@/shared/config/menuFilter';
import { RBACUtils } from '@/shared/hooks/rbac';

interface SidebarProps {
  collapsed: boolean;
  isMobileOpen?: boolean;
  onClose?: () => void;
}

const checkIsActive = (item: MenuItem, pathname: string): boolean => {
  if (item.path && pathname === item.path) return true;
  if (item.subItems) {
    return item.subItems.some(sub => checkIsActive(sub, pathname));
  }
  return false;
};

const MenuItemComponent: React.FC<{
  item: MenuItem;
  collapsed: boolean;
  level: number;
}> = ({ item, collapsed, level }) => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  const hasSubItems = item.subItems && item.subItems.length > 0;
  const Icon = item.icon;
  const isActive = checkIsActive(item, location.pathname);

  useEffect(() => {
    if (isActive) setIsExpanded(true);
  }, [isActive]);

  const paddingLeft = !collapsed && level > 0 ? `${0.75 + level * 1.25}rem` : undefined;

  if (hasSubItems) {
    return (
      <li className="menu-item-wrapper">
        <div
          className={clsx(
            'menu-item',
            'has-submenu',
            isActive && 'active',
            collapsed && 'collapsed'
          )}
          onClick={() => !collapsed && setIsExpanded(!isExpanded)}
          title={collapsed ? item.label : undefined}
          style={{ paddingLeft }}
        >
          {Icon && <Icon size={20} className="menu-icon" />}
          {!collapsed && (
            <>
              <span className="menu-label">{item.label}</span>
              <span className={clsx('menu-chevron', isExpanded && 'expanded')}>
                <ChevronRight size={16} />
              </span>
            </>
          )}
        </div>
        {!collapsed && (
          <div className={clsx('submenu-wrapper', isExpanded && 'expanded')}>
            <ul className="submenu-list">
              {item.subItems!.map((subItem, idx) => (
                <MenuItemComponent
                  key={idx}
                  item={subItem}
                  collapsed={collapsed}
                  level={level + 1}
                />
              ))}
            </ul>
          </div>
        )}
      </li>
    );
  }

  return (
    <li className="menu-item-wrapper">
      <NavLink
        to={item.path ?? '#'}
        end
        className={({ isActive: isLinkActive }) =>
          clsx(
            level > 0 ? 'submenu-item' : 'menu-item',
            (isActive || isLinkActive) && 'active',
            collapsed && 'collapsed'
          )
        }
        title={collapsed ? item.label : undefined}
        style={{ paddingLeft }}
      >
        {Icon ? (
          <Icon size={20} className="menu-icon" />
        ) : (
          !collapsed && level > 0 && <span className="submenu-dot" />
        )}
        {!collapsed && <span className="menu-label">{item.label}</span>}
      </NavLink>
    </li>
  );
};

<<<<<<< HEAD
const isEmployeeOnly = (user: ReturnType<typeof useAuthStore.getState>['user']): boolean => {
  if (!user) return false;
  const roleNames = user.roles?.map(r => r.name?.toLowerCase()) ?? [];
  const hasAdminAccess = roleNames.some(name =>
    name.includes('admin') || name.includes('super') || name.includes('manager') || name.includes('hr') || name.includes('finance')
  );
  return !hasAdminAccess && !RBACUtils.isSuperAdmin(user);
};

export const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
=======
export const Sidebar: React.FC<SidebarProps> = ({ collapsed, isMobileOpen, onClose }) => {
>>>>>>> de1fc177551de4885a1f8e57cc2c0344d3769ac7
  const user = useAuthStore((state) => state.user);
  const [allowedKeys, setAllowedKeys] = useState<string[] | undefined>();

  useEffect(() => {
    if (!user) return;
    fetchAllowedMenuKeys(user).then(setAllowedKeys);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const handler = () => {
      fetchAllowedMenuKeys(user).then(setAllowedKeys);
    };
    window.addEventListener('menu-cache-cleared', handler);
    return () => window.removeEventListener('menu-cache-cleared', handler);
  }, [user]);

  const employeeOnly = isEmployeeOnly(user);
  const baseMenuItems = employeeOnly ? essMenuItems : menuItems;
  const filteredItems = filterMenuItems(user, baseMenuItems, allowedKeys);

  // When mobile drawer is open, always show full expanded sidebar regardless of collapsed state
  const effectiveCollapsed = isMobileOpen ? false : collapsed;

  return (
    <aside className={clsx('dashboard-sidebar', collapsed && 'collapsed', isMobileOpen && 'mobile-open')}>
      <div className="sidebar-logo">
<<<<<<< HEAD
        <div className={clsx('sidebar-brand', collapsed && 'collapsed')}>
          {!collapsed ? (
            <span className="brand-text">HRIS</span>
          ) : (
            <span className="brand-text-collapsed">H</span>
          )}
        </div>
=======
        {isMobileOpen && (
          <button
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Close sidebar"
            title="Close menu"
          >
            <X size={24} />
          </button>
        )}
        <img
          src="/logo-mahya2.png"
          alt="MAHYA Logo"
          className={clsx('company-logo', effectiveCollapsed && 'collapsed')}
        />
>>>>>>> de1fc177551de4885a1f8e57cc2c0344d3769ac7
      </div>

      <div className="sidebar-menu-container">
        <ul className="menu-list">
          {filteredItems.map((item, idx) => (
            <MenuItemComponent
              key={idx}
              item={item}
              collapsed={effectiveCollapsed}
              level={0}
            />
          ))}
        </ul>
      </div>
    </aside>
  );
};

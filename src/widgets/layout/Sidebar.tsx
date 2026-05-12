import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { ChevronRight } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import './Sidebar.css';

import { menuItems } from '@/shared/config/menu';
import type { MenuItem } from '@/shared/config/menu';
import { useAuthStore } from '@/app/store/auth.store';
import { filterMenuItems, fetchAllowedMenuKeys } from '@/shared/config/menuFilter';

interface SidebarProps {
  collapsed: boolean;
}

// 🔥 cek recursive apakah ada child yg active
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

  // 🔥 ACTIVE (recursive)
  const isActive = checkIsActive(item, location.pathname);

  // 🔥 AUTO EXPAND kalau ada child active
  useEffect(() => {
    if (isActive) {
      setIsExpanded(true);
    }
  }, [isActive]);

  const paddingLeft =
    !collapsed && level > 0 ? `${0.75 + level * 1.25}rem` : undefined;

  if (hasSubItems) {
    return (
      <li className="menu-item-wrapper">
        <div
          className={clsx(
            'menu-item',
            'has-submenu',
            isActive && 'active', // 🔥 parent ikut active
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

              <span
                className={clsx(
                  'menu-chevron',
                  isExpanded && 'expanded'
                )}
              >
                <ChevronRight size={16} />
              </span>
            </>
          )}
        </div>

        {!collapsed && (
          <div
            className={clsx(
              'submenu-wrapper',
              isExpanded && 'expanded'
            )}
          >
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

export const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const user = useAuthStore((state) => state.user);
  const [allowedKeys, setAllowedKeys] = React.useState<string[] | undefined>();

  React.useEffect(() => {
    fetchAllowedMenuKeys(user).then(setAllowedKeys);
  }, []);

  React.useEffect(() => {
    const handler = () => {
      fetchAllowedMenuKeys(user).then(setAllowedKeys);
    };
    window.addEventListener('menu-cache-cleared', handler);
    return () => window.removeEventListener('menu-cache-cleared', handler);
  }, []);

  const filteredItems = filterMenuItems(user, menuItems, allowedKeys);

  // Debug logging
  if (user) {
    console.log("[Sidebar] User permissions:", user.permissions?.map((p: any) => p.name));
    console.log("[Sidebar] User roles:", user.roles?.map((r: any) => r.name));
    console.log("[Sidebar] Filtered menu items count:", filteredItems.length);
  }

  return (
    <aside className={clsx('dashboard-sidebar', collapsed && 'collapsed')}>
      <div className="sidebar-logo">
        <img
          src="/logo-mahya2.png"
          alt="MAHYA Logo"
          className={clsx('company-logo', collapsed && 'collapsed')}
        />
      </div>

      <div className="sidebar-menu-container">
        <ul className="menu-list">
          {filteredItems.map((item, idx) => (
            <MenuItemComponent
              key={idx}
              item={item}
              collapsed={collapsed}
              level={0}
            />
          ))}
        </ul>
      </div>
    </aside>
  );
};
import React, { useState } from 'react';
import clsx from 'clsx';
import { ChevronRight } from 'lucide-react';
import './Sidebar.css';
import { menuItems } from '@/config/menu';
import type { MenuItem } from '@/config/menu';

interface SidebarProps {
  collapsed: boolean;
}

const MenuItemComponent: React.FC<{ item: MenuItem; collapsed: boolean; level: number }> = ({ item, collapsed, level }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasSubItems = item.subItems && item.subItems.length > 0;
  
  // Calculate dynamic padding based on depth level, but only if not collapsed
  const paddingLeft = !collapsed && level > 0 ? `${0.75 + (level * 1.25)}rem` : undefined;

  const Icon = item.icon;

  if (hasSubItems) {
    return (
      <li className="menu-item-wrapper">
        <div 
          className={clsx('menu-item', 'has-submenu', collapsed && 'collapsed')}
          onClick={() => !collapsed && setIsExpanded(!isExpanded)}
          title={collapsed ? item.label : undefined}
          style={{ paddingLeft }}
        >
          {Icon && <Icon size={20} className="menu-icon" />}
          {!collapsed && (
            <>
              <span className={clsx('menu-label', !Icon && 'no-icon')}>{item.label}</span>
              <span className={clsx('menu-chevron', isExpanded && 'expanded')}>
                <ChevronRight size={16} />
              </span>
            </>
          )}
        </div>

        {/* Submenu Overlay or Dropdown */}
        {!collapsed && (
          <div className={clsx('submenu-wrapper', isExpanded && 'expanded')}>
            <ul className="submenu-list">
              {item.subItems!.map((subItem, subIdx) => (
                <MenuItemComponent key={subIdx} item={subItem} collapsed={collapsed} level={level + 1} />
              ))}
            </ul>
          </div>
        )}
      </li>
    );
  }

  // Leaf Menu Item (No subitems)
  return (
    <li className="menu-item-wrapper">
      <a 
        href={item.path} 
        className={clsx(level > 0 ? 'submenu-item' : 'menu-item', item.active && 'active', collapsed && 'collapsed')}
        title={collapsed ? item.label : undefined}
        style={{ paddingLeft }}
        onClick={(e) => {
          e.preventDefault();
          if (item.path) window.location.href = item.path;
        }}
      >
        {Icon ? <Icon size={20} className="menu-icon" /> : (!collapsed && level > 0 && <span className="submenu-dot" />)}
        {!collapsed && <span className={clsx('menu-label', !Icon && 'no-icon')}>{item.label}</span>}
      </a>
    </li>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  return (
    <aside className={clsx('dashboard-sidebar', collapsed && 'collapsed')}>
      <div className="sidebar-logo">
        <img 
          src="/logo-mahya.png" 
          alt="MAHYA Logo" 
          className={clsx('company-logo', collapsed && 'collapsed')}
        />
      </div>
      
      <div className="sidebar-menu-container">
        <ul className="menu-list">
          {menuItems.map((item, idx) => (
            <MenuItemComponent key={idx} item={item} collapsed={collapsed} level={0} />
          ))}
        </ul>
      </div>
    </aside>
  );
};

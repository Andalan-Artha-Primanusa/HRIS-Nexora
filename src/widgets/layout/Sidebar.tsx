import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { Building2, ChevronRight, UserCircle, X } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import './Sidebar.css';

import { menuItems, essMenuItems } from '@/shared/config/menu';
import type { MenuItem } from '@/shared/config/menu';
import { useAuthStore } from '@/app/store/auth.store';
import { filterMenuItems, fetchAllowedMenuKeys } from '@/shared/config/menuFilter';
import { RBACUtils } from '@/shared/hooks/rbac';
import { companyService } from '@/features/company/api/company.service';

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

const isEmployeeOnly = (user: ReturnType<typeof useAuthStore.getState>['user']): boolean => {
  if (!user) return false;
  const roleNames = user.roles?.map(r => r.name?.toLowerCase()) ?? [];
  const hasAdminAccess = roleNames.some(name =>
    name.includes('admin') || name.includes('super') || name.includes('manager') || name.includes('hr') || name.includes('finance') || name === 'ho'
  );
  return !hasAdminAccess && !RBACUtils.isSuperAdmin(user);
};

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, isMobileOpen, onClose }) => {
  const user = useAuthStore((state) => state.user);
  const selectedCompanyId = useAuthStore((state) => state.selectedCompanyId);
  const companyContext = useAuthStore((state) => state.companyContext);
  const setSelectedCompanyId = useAuthStore((state) => state.setSelectedCompanyId);
  const setCompanyContext = useAuthStore((state) => state.setCompanyContext);
  const [allowedKeys, setAllowedKeys] = useState<string[] | undefined>();
  const canSwitchCompany = RBACUtils.hasPermission(user, [
    'company.view',
    'company.view_all',
    'dashboard.view_all_company',
    'admin.company.view',
  ]);

  useEffect(() => {
    if (!user) return;
    fetchAllowedMenuKeys(user).then(setAllowedKeys);
  }, [user]);

  useEffect(() => {
    if (!user || !canSwitchCompany || companyContext) return;

    let cancelled = false;

    const loadCompanyContext = async () => {
      try {
        const context = await companyService.context();
        if (cancelled) return;
        setCompanyContext(context);

        if (selectedCompanyId === null) {
          setSelectedCompanyId(context.can_view_all ? "all" : context.selected_company_id ?? context.default_company_id);
        }
      } catch (error) {
        console.error("Failed to load sidebar company context:", error);
      }
    };

    void loadCompanyContext();

    return () => {
      cancelled = true;
    };
  }, [canSwitchCompany, companyContext, selectedCompanyId, setCompanyContext, setSelectedCompanyId, user]);

  useEffect(() => {
    if (!user) return;
    const handler = () => {
      fetchAllowedMenuKeys(user).then(setAllowedKeys);
    };
    window.addEventListener('menu-cache-cleared', handler);
    return () => window.removeEventListener('menu-cache-cleared', handler);
  }, [user]);

  const employeeOnly = isEmployeeOnly(user);
  const selfServiceMenu: MenuItem = {
    label: 'Employee Self Service',
    icon: UserCircle,
    subItems: essMenuItems,
  };
  const baseMenuItems = employeeOnly ? essMenuItems : [...menuItems, selfServiceMenu];
  const filteredItems = filterMenuItems(user, baseMenuItems, allowedKeys);

  // When mobile drawer is open, always show full expanded sidebar regardless of collapsed state
  const effectiveCollapsed = isMobileOpen ? false : collapsed;
  const handleCompanyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setSelectedCompanyId(value === "all" ? "all" : Number(value));
    window.dispatchEvent(new Event("company-context-changed"));
    setTimeout(() => window.location.reload(), 50);
  };

  return (
    <aside className={clsx('dashboard-sidebar', collapsed && 'collapsed', isMobileOpen && 'mobile-open')}>
      <div className="sidebar-logo">
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
      </div>

      {canSwitchCompany && companyContext && companyContext.companies.length > 0 && !effectiveCollapsed && (
        <label className="sidebar-company-switcher" title="Ganti scope company">
          <span className="sidebar-company-caption">Company aktif</span>
          <span className="sidebar-company-control">
            <Building2 size={17} aria-hidden="true" />
            <select
              aria-label="Ganti company aktif"
              value={selectedCompanyId ?? (companyContext.can_view_all ? "all" : companyContext.selected_company_id ?? companyContext.default_company_id ?? "")}
              onChange={handleCompanyChange}
            >
              {companyContext.can_view_all && <option value="all">HO / Semua Company</option>}
              {companyContext.companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}{company.code ? ` (${company.code})` : ""}
                </option>
              ))}
            </select>
          </span>
        </label>
      )}

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

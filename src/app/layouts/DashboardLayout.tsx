import React from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { Sidebar } from '@/widgets/layout/Sidebar';
import { Header } from '@/widgets/layout/Header';
import { useAuthStore } from '@/app/store/auth.store';
import { menuItems, type MenuItem } from '@/shared/config/menu';
import { filterMenuItems, fetchAllowedMenuKeys } from '@/shared/config/menuFilter';
import { RouteSuspenseFallback } from '@/shared/ui';
import NotFoundPage from '@/pages/error/NotFoundPage';

const routePrefetchers: Record<string, () => Promise<unknown>> = {
  '/dashboard': () => import('@/pages/dashboard/overview/OverviewPage'),
  '/attendance': () => import('@/pages/attendance/AttendanceOverviewPage'),
  '/attendance/history': () => import('@/pages/attendance/AttendanceHistoryPage'),
  '/leave/requests': () => import('@/pages/leave/LeaveRequestsPage'),
  '/leave/approval': () => import('@/pages/leave/LeaveApprovalPage'),
  '/leave/calendar': () => import('@/pages/leave/LeaveCalendarPage'),
  '/kpis': () => import('@/pages/admin/AdminKpiPage'),
  '/my/kpi': () => import('@/pages/ess/MyKpiPage'),
  '/my/payroll': () => import('@/pages/ess/MyPayrollPage'),
  '/my/reimbursements': () => import('@/pages/ess/MyReimbursementsPage'),
  '/leave/my-leave': () => import('@/pages/ess/MyLeavesPage'),
  '/employees': () => import('@/pages/employee/EmployeesPage'),
  '/employees/update/:id': () => import('@/pages/employee/EmployeeEditPage'),
  '/profiles': () => import('@/pages/profiles/ProfilesPage'),
  '/reimbursements': () => import('@/pages/reimbursements/ReimbursementsManagementPage'),
  '/payroll/list': () => import('@/pages/payroll/PayrollListPage'),
  '/payroll': () => import('@/pages/payroll/PayrollDashboard'),
  '/locations': () => import('@/pages/locations/LocationsPage'),
  '/admin/users': () => import('@/pages/admin/AdminUsersPage'),
  '/admin/roles': () => import('@/pages/admin/AdminRolesPage'),
  '/admin/permissions': () => import('@/pages/admin/AdminPermissionsPage'),
};

const flattenPaths = (items: MenuItem[]): string[] => {
  const result: string[] = [];

  for (const item of items) {
    if (item.path) {
      result.push(item.path);
    }

    if (item.subItems?.length) {
      result.push(...flattenPaths(item.subItems));
    }
  }

  return result;
};

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = React.useState(false);
  const [prefetchStats, setPrefetchStats] = React.useState<{
    routeCount: number;
    durationMs: number;
    capturedAt: string;
  } | null>(null);
  const [allowedKeys, setAllowedKeys] = React.useState<string[] | undefined>();
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  const outlet = useOutlet();

  const allMenuPaths = React.useMemo(
    () => Array.from(new Set(flattenPaths(menuItems))),
    []
  );
  const visibleMenu = React.useMemo(
    () => filterMenuItems(user, menuItems, allowedKeys),
    [user, allowedKeys]
  );
  const availablePaths = React.useMemo(
    () => Array.from(new Set(flattenPaths(visibleMenu))),
    [visibleMenu]
  );
  const isRouteBlocked = React.useMemo(() => {
    if (allowedKeys === undefined) return false;
    if (!user) return false;
    return allMenuPaths.includes(location.pathname) && !availablePaths.includes(location.pathname);
  }, [allowedKeys, user, allMenuPaths, availablePaths, location.pathname]);

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

  React.useEffect(() => {
    const prioritizedPaths = ['/dashboard', ...availablePaths]
      .filter((path, index, arr) => arr.indexOf(path) === index)
      .filter((path) => path !== location.pathname)
      .slice(0, 10);

    const prefetchVisiblePages = async () => {
      const shouldMeasure = import.meta.env.DEV && typeof performance !== 'undefined';
      const measurePrefix = `prefetch:${location.pathname}`;
      const startTime = shouldMeasure ? performance.now() : 0;

      if (shouldMeasure) {
        performance.mark(`${measurePrefix}:start`);
      }

      const tasks: Promise<unknown>[] = [];

      for (const path of prioritizedPaths) {
        const prefetch = routePrefetchers[path];
        if (prefetch) {
          tasks.push(prefetch());
        }
      }

      if (tasks.length > 0) {
        await Promise.allSettled(tasks);
      }

      if (import.meta.env.DEV) {
        setPrefetchStats({
          routeCount: tasks.length,
          durationMs: shouldMeasure ? performance.now() - startTime : 0,
          capturedAt: new Date().toLocaleTimeString(),
        });
      }

      if (shouldMeasure) {
        performance.mark(`${measurePrefix}:end`);
        performance.measure(`${measurePrefix}:duration`, `${measurePrefix}:start`, `${measurePrefix}:end`);
      }
    };

    const w = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    let timeoutId: number | null = null;
    let idleId: number | null = null;

    if (typeof w.requestIdleCallback === 'function') {
      idleId = w.requestIdleCallback(() => {
        void prefetchVisiblePages();
      }, { timeout: 1200 });
    } else {
      timeoutId = window.setTimeout(() => {
        void prefetchVisiblePages();
      }, 700);
    }

    return () => {
      if (idleId !== null && typeof w.cancelIdleCallback === 'function') {
        w.cancelIdleCallback(idleId);
      }
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [availablePaths, location.pathname]);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar collapsed={collapsed} />
      <div className="dashboard-main">
        <Header toggleSidebar={toggleSidebar} />
        <main className="dashboard-content">
          <React.Suspense fallback={<RouteSuspenseFallback />}>
            {isRouteBlocked ? <NotFoundPage /> : (outlet || <NotFoundPage />)}
          </React.Suspense>
          {import.meta.env.DEV && prefetchStats ? (
            <div className="prefetch-debug-panel" role="status" aria-live="polite">
              <strong>Prefetch</strong>
              <span>{prefetchStats.routeCount} routes</span>
              <span>{prefetchStats.durationMs.toFixed(1)}ms</span>
              <span>{prefetchStats.capturedAt}</span>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
};


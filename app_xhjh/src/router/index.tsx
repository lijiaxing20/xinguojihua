import { createBrowserRouter, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { ErrorBoundary } from '../components/ErrorBoundary';

import P_login from '../pages/p-login';
import P_parent_dashboard from '../pages/p-parent_dashboard';
import P_child_dashboard from '../pages/p-child_dashboard';
import P_task_list from '../pages/p-task_list';
import P_task_create from '../pages/p-task_create';
import P_task_detail from '../pages/p-task_detail';
import P_task_checkin from '../pages/p-task_checkin_modal';
import P_wish_list from '../pages/p-wish_list';
import P_family_honor_wall from '../pages/p-family_honor_wall';
import P_growth_report from '../pages/p-growth_report';
import P_knowledge_base from '../pages/p-knowledge_base';
import P_family_manage from '../pages/p-family_manage';
import P_user_profile from '../pages/p-user_profile';
import P_settings from '../pages/p-settings';
import P_task_suggest from '../pages/p-task_suggest';
import P_badge_list from '../pages/p-badge-list';
import P_energy_history from '../pages/p-energy-history';
import NotFoundPage from './NotFoundPage';
import ErrorPage from './ErrorPage';

function Listener() {
  const location = useLocation();
  useEffect(() => {
    const pageId = 'P-' + location.pathname.replace('/', '').toUpperCase();
    console.log('当前pageId:', pageId, ', pathname:', location.pathname, ', search:', location.search);
    if (typeof window === 'object' && window.parent && window.parent.postMessage) {
      window.parent.postMessage({
        type: 'chux-path-change',
        pageId: pageId,
        pathname: location.pathname,
        search: location.search,
      }, '*');
    }
  }, [location]);

  return <Outlet />;
}

// 使用 createBrowserRouter 创建路由实例
const router = createBrowserRouter([
  {
    path: '/',
    element: <Listener />,
    children: [
      {
    path: '/',
    element: <Navigate to='/login' replace={true} />,
  },
      {
    path: '/login',
    element: (
      <ErrorBoundary>
        <P_login />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/parent-dashboard',
    element: (
      <ErrorBoundary>
        <P_parent_dashboard />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/child-dashboard',
    element: (
      <ErrorBoundary>
        <P_child_dashboard />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/task-list',
    element: (
      <ErrorBoundary>
        <P_task_list />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/task-create',
    element: (
      <ErrorBoundary>
        <P_task_create />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
        path: '/task-detail',
        element: (
          <ErrorBoundary>
            <P_task_detail />
          </ErrorBoundary>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: '/task-checkin',
        element: (
          <ErrorBoundary>
            <P_task_checkin />
          </ErrorBoundary>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: '/wish-list',
    element: (
      <ErrorBoundary>
        <P_wish_list />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/family-honor-wall',
    element: (
      <ErrorBoundary>
        <P_family_honor_wall />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/growth-report',
    element: (
      <ErrorBoundary>
        <P_growth_report />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/knowledge-base',
    element: (
      <ErrorBoundary>
        <P_knowledge_base />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/family-manage',
    element: (
      <ErrorBoundary>
        <P_family_manage />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/user-profile',
    element: (
      <ErrorBoundary>
        <P_user_profile />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/settings',
    element: (
      <ErrorBoundary>
        <P_settings />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/task-suggest',
    element: (
      <ErrorBoundary>
        <P_task_suggest />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/badge-list',
    element: (
      <ErrorBoundary>
        <P_badge_list />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '/energy-history',
    element: (
      <ErrorBoundary>
        <P_energy_history />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
      {
    path: '*',
    element: <NotFoundPage />,
  },
    ]
  }
]);

export default router;
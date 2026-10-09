import { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import DashboardLayout from '@/layout/DashboardLayout';
import PageLoader from '@/components/PageLoader';
import ErrorPage from '@/pages/errors/ErrorPage';

/* ---------------------------------------------------------------------------
 * Every page is a lazy import.
 *
 * Without this, opening the sign in screen downloads the Kanban board, the
 * chart library, and all twenty something other pages first: the build was one
 * 1.6 MB JavaScript file. Each lazy() below becomes its own chunk that the
 * browser only fetches when the route is visited.
 *
 * The cost is that a route change can now pause, which is what the Suspense
 * fallbacks are for. DashboardLayout holds one inside the shell, so the sidebar
 * and header stay put while the next page loads.
 * ------------------------------------------------------------------------- */

// Auth and standalone pages
const SignIn = lazy(() => import('@/pages/auth/SignIn'));
const SignUp = lazy(() => import('@/pages/auth/SignUp'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));
const LockScreen = lazy(() => import('@/pages/auth/LockScreen'));
const Maintenance = lazy(() => import('@/pages/maintenance/Maintenance'));
const NotFound = lazy(() => import('@/pages/not-found/NotFound'));

// PMO Dashboard pages
const PMO = lazy(() => import('@/pages/pmo/PMO'));
const Portfolios = lazy(() => import('@/pages/portfolios/Portfolios'));
const Projects = lazy(() => import('@/pages/projects/Projects'));
const Marketing = lazy(() => import('@/pages/marketing/Marketing'));
const Departments = lazy(() => import('@/pages/departments/Departments'));

// System pages (kept from ViteDash)
const Notifications = lazy(() => import('@/pages/notifications/Notifications'));
const ActivityLog = lazy(() => import('@/pages/activity/ActivityLog'));
const Profile = lazy(() => import('@/pages/profile/Profile'));
const Settings = lazy(() => import('@/pages/settings/Settings'));

const App = () => (
  <BrowserRouter>
    <Suspense fallback={<PageLoader variant="spinner" minHeight="100dvh" />}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard/pmo" replace />} />

        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/lock" element={<LockScreen />} />
        <Route path="/maintenance" element={<Maintenance />} />

        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Navigate to="pmo" replace />} />

          {/* PMO Command Center */}
          <Route path="pmo" element={<PMO />} />
          <Route path="portfolios" element={<Portfolios />} />
          <Route path="projects" element={<Projects />} />
          <Route path="marketing" element={<Marketing />} />
          <Route path="departments" element={<Departments />} />

          {/* System pages */}
          <Route path="notifications" element={<Notifications />} />
          <Route path="activity" element={<ActivityLog />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />

          <Route
            path="errors/400"
            element={
              <ErrorPage
                status="warning"
                title="400"
                subTitle="Bad Request. The server could not understand your request."
              />
            }
          />
          <Route
            path="errors/403"
            element={
              <ErrorPage
                status="403"
                title="403"
                subTitle="Sorry, you are not authorized to access this page."
              />
            }
          />
          <Route
            path="errors/404"
            element={
              <ErrorPage
                status="404"
                title="404"
                subTitle="Sorry, the page you visited does not exist."
              />
            }
          />
          <Route
            path="errors/500"
            element={
              <ErrorPage
                status="500"
                title="500"
                subTitle="Sorry, something went wrong on our server."
              />
            }
          />

          {/* Unknown /dashboard paths keep the shell rather than dropping the
              user onto a bare full page 404. */}
          <Route
            path="*"
            element={
              <ErrorPage
                status="404"
                title="404"
                subTitle="Sorry, the page you visited does not exist."
              />
            }
          />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default App;

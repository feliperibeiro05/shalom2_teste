// src/router.tsx
import { createBrowserRouter } from 'react-router-dom';
import { App } from './App';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard'; // A sua página principal do dashboard
import { Activities } from './pages/Activities';
import { Financial } from './pages/Financial';
import { Investments } from './pages/Investments';
import { Health } from './pages/Health'; // Importa a página de Saúde (mantido)
import { Emotional } from './pages/Emotional';
import { Community } from './pages/Community';
import { Rewards } from './pages/Rewards';
import { Diary } from './pages/Diary';
import { Journal } from './pages/Journal.tsx';
import { AuthLayout } from './layouts/AuthLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Importe a nova página de categoria
import { CategoryPage } from './pages/CategoryPage'; // Mantido

export const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        path: '/',
        element: <Landing />,
      },
      {
        element: <AuthLayout />,
        children: [
          {
            path: '/login',
            element: <Login />,
          },
          {
            path: '/register',
            element: <Register />,
          },
        ],
      },
      {
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: '/dashboard',
            element: <Dashboard />, // O "Overview" da minha versão simplificada era o seu "Dashboard"
          },
          {
            path: '/dashboard/activities',
            element: <Activities />,
          },
          {
            path: '/dashboard/financial',
            element: <Financial />,
          },
          {
            path: '/dashboard/investments',
            element: <Investments />,
          },
          {
            path: '/dashboard/health',
            element: <Health />,
          },
          {
            path: '/dashboard/emotional',
            element: <Emotional />,
          },
          {
            path: '/dashboard/community',
            element: <Community />,
          },
          {
            path: '/dashboard/rewards',
            element: <Rewards />,
          },
          {
            path: '/dashboard/diary',
            element: <Diary />,
          },
          {
            path: '/dashboard/journal',
            element: <Journal />,
          },
          {
            path: '/dashboard/journal/category/:categoryName',
            element: <CategoryPage />,
          },
        ],
      },
    ],
  },
]);
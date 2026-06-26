import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { Toaster } from 'react-hot-toast';
import { useThemeMode } from '../context/ThemeContext';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';

  return (
    <div className="dashboard-layout" style={{
      display: 'flex',
      height: '100vh',
      background: 'var(--color-bg-primary)',
    }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minWidth: 0,
      }}>
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="layout-main" style={{
          flex: 1,
          overflow: 'auto',
          padding: '16px 24px',
          maxWidth: '100%',
        }}>
          <Outlet />
        </main>
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '8px',
            padding: '10px 16px',
            fontSize: '0.75rem',
            fontFamily: '"Inter", "SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif',
            background: isDark ? 'hsl(222, 12%, 16%)' : '#fff',
            color: isDark ? 'hsl(210, 20%, 98%)' : '#0f172a',
            border: isDark ? '1px solid hsl(222, 8%, 32%)' : '1px solid #e2e8f0',
          },
        }}
      />
    </div>
  );
}

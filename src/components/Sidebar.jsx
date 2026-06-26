import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeContext';
import { LayoutDashboard, Package, MapPin, CreditCard, Bell, Truck, Warehouse, BarChart3, MessageSquare, Navigation, ScanLine, LogOut, ChevronLeft, PanelRightClose } from 'lucide-react';

const adminMain = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/bookings', label: 'Bookings', icon: Package },
  { to: '/tracking', label: 'Tracking', icon: MapPin },
  { to: '/payments', label: 'Payments', icon: CreditCard },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/qr-scan', label: 'QR Scan', icon: ScanLine },
  { to: '/fleet', label: 'Fleet', icon: Truck },
  { to: '/warehouses', label: 'Warehouses', icon: Warehouse },
];

const adminBottom = [
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/support', label: 'Support', icon: MessageSquare },
];

const customerLinks = [
  { to: '/bookings', label: 'New Booking', icon: Package },
  { to: '/tracking', label: 'Track Package', icon: MapPin },
  { to: '/payments', label: 'Payments', icon: CreditCard },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/qr-scan', label: 'QR Scan', icon: ScanLine },
  { to: '/support', label: 'Support', icon: MessageSquare },
];

const driverLinks = [
  { to: '/driver-portal', label: 'My Deliveries', icon: Package },
  { to: '/tracking', label: 'Navigation', icon: Navigation },
  { to: '/notifications', label: 'Alerts', icon: Bell },
  { to: '/qr-scan', label: 'QR Scan', icon: ScanLine },
  { to: '/support', label: 'Support', icon: MessageSquare },
];

function SidebarItems({ links, isDark, onNavigate, collapsed }) {
  const location = useLocation();
  return links.map(link => {
    const isActive = location.pathname === link.to || (link.to !== '/dashboard' && location.pathname.startsWith(link.to));
    const Icon = link.icon;
    return (
      <button
        key={link.to}
        onClick={() => onNavigate(link.to)}
        className={`sidebar-nav-item ${isActive ? 'sidebar-nav-item--active' : ''}`}
        title={collapsed ? link.label : undefined}
      >
        <span className="sidebar-nav-icon">
          <Icon size={15} strokeWidth={isActive ? 2.5 : 1.5} />
        </span>
        {!collapsed && (
          <span className="sidebar-nav-label">
            {link.label}
          </span>
        )}
      </button>
    );
  });
}

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const { mode } = useThemeMode();
  const navigate = useNavigate();
  const isDark = mode === 'dark';
  const isAdmin = user?.role === 'admin';
  const [collapsed, setCollapsed] = useState(false);

  const handleNav = (to) => {
    navigate(to);
    if (onClose) onClose();
  };

  const navLinks = isAdmin ? adminMain : (user?.role === 'driver' ? driverLinks : customerLinks);

  const sidebarContent = (
    <div className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo" onClick={() => navigate('/')} title={collapsed ? 'LogiMove' : undefined}>
          <span className="sidebar-logo-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
          </span>
          {!collapsed && <span className="sidebar-logo-text">LogiMove</span>}
        </div>
        <button
          className="sidebar-collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelRightClose size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-nav-section">
          <SidebarItems links={navLinks} isDark={isDark} onNavigate={handleNav} collapsed={collapsed} />
        </div>

        {isAdmin && (
          <div className="sidebar-nav-section sidebar-nav-section--bottom">
            <div className="sidebar-divider" />
            <SidebarItems links={adminBottom} isDark={isDark} onNavigate={handleNav} collapsed={collapsed} />
            <button
              onClick={() => { logout(); navigate('/login'); if (onClose) onClose(); }}
              className="sidebar-nav-item sidebar-nav-item--logout"
            >
              <span className="sidebar-nav-icon">
                <LogOut size={15} />
              </span>
              {!collapsed && <span className="sidebar-nav-label">Logout</span>}
            </button>
          </div>
        )}
      </nav>

      <style>{`
        .sidebar {
          width: ${collapsed ? '64px' : '240px'};
          height: 100%;
          display: flex;
          flex-direction: column;
          background: var(--color-bg-primary);
          border-right: 1px solid var(--color-border);
          transition: width 200ms ease;
          overflow: hidden;
          flex-shrink: 0;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          min-height: 48px;
          border-bottom: 1px solid var(--color-border);
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          flex-shrink: 0;
        }

        .sidebar-logo-icon {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          background: hsl(8, 85%, 55%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .sidebar-logo-text {
          font-family: 'Lexend', 'Segoe UI', system-ui, sans-serif;
          font-weight: 700;
          font-size: 0.85rem;
          color: var(--color-text-primary);
          letter-spacing: -0.02em;
          white-space: nowrap;
        }

        .sidebar-collapse-btn {
          background: none;
          border: none;
          color: var(--color-text-secondary);
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: color 150ms ease;
        }
        .sidebar-collapse-btn:hover {
          color: var(--color-text-primary);
        }

        .sidebar-nav {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
          padding: 8px;
        }

        .sidebar-nav-section {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .sidebar-nav-section--bottom {
          margin-top: auto;
        }

        .sidebar-divider {
          height: 1px;
          background: var(--color-border);
          margin: 8px 0;
        }

        .sidebar-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          border-radius: 6px;
          border: none;
          background: none;
          cursor: pointer;
          text-align: left;
          width: 100%;
          transition: background 100ms ease;
          flex-shrink: 0;
        }
        .sidebar-nav-item:hover {
          background: var(--color-bg-tertiary);
        }
        .sidebar-nav-item--active {
          background: var(--color-accent-primary-bg);
        }

        .sidebar-nav-item--logout {
          color: var(--color-accent-red);
        }
        .sidebar-nav-item--logout:hover {
          background: var(--color-accent-red-bg);
        }

        .sidebar-nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          flex-shrink: 0;
          color: var(--color-text-secondary);
        }
        .sidebar-nav-item--active .sidebar-nav-icon {
          color: var(--color-accent-primary);
        }
        .sidebar-nav-item--logout .sidebar-nav-icon {
          color: var(--color-accent-red);
        }

        .sidebar-nav-label {
          font-family: 'Lexend', 'Segoe UI', system-ui, sans-serif;
          font-size: 0.72rem;
          font-weight: 500;
          color: var(--color-text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sidebar-nav-item--active .sidebar-nav-label {
          color: var(--color-text-primary);
          font-weight: 600;
        }
        .sidebar-nav-item--logout .sidebar-nav-label {
          color: var(--color-accent-red);
        }

        .sidebar--collapsed .sidebar-nav-item {
          justify-content: center;
          padding: 8px;
        }
        .sidebar--collapsed .sidebar-header {
          justify-content: flex-start;
          gap: 0;
          padding: 12px 6px;
        }
        .sidebar--collapsed .sidebar-collapse-btn {
          margin-left: auto;
          display: flex;
        }
      `}</style>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1100,
            background: 'rgba(0,0,0,0.5)',
          }}
          onClick={onClose}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ width: collapsed ? '64px' : '240px', height: '100%' }}
          >
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div
        className="sidebar-desktop"
        style={{
          position: 'relative',
          flexShrink: 0,
          height: '100vh',
          display: 'flex',
        }}
      >
        {sidebarContent}
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .sidebar-desktop {
            display: none !important;
          }
        }
        @media (min-width: 1025px) {
          .sidebar-desktop {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
}

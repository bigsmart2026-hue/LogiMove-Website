import { useState, useEffect, useMemo } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { fetchDrivers, subscribeToAllOrders } from '../firebase/services';
import { useThemeMode } from '../context/ThemeContext';
import StatusBadge from '../components/StatusBadge';
import MapLibreMap from '../components/MapLibreMap';
import { Package, CreditCard, Truck, TrendingUp, Users, Clock, MapPin, ArrowUpRight, ArrowDownRight, Circle } from 'lucide-react';

const weeklyData = [
  { day: 'Mon', shipments: 42, revenue: 620000 },
  { day: 'Tue', shipments: 38, revenue: 580000 },
  { day: 'Wed', shipments: 51, revenue: 740000 },
  { day: 'Thu', shipments: 45, revenue: 690000 },
  { day: 'Fri', shipments: 63, revenue: 890000 },
  { day: 'Sat', shipments: 28, revenue: 410000 },
  { day: 'Sun', shipments: 15, revenue: 220000 },
];

const recentActivity = [
  { time: '2 min ago', action: 'Shipment LOG-3842 delivered', status: 'delivered' },
  { time: '8 min ago', action: 'Driver Kola assigned to LOG-3845', status: 'assigned' },
  { time: '14 min ago', action: 'Vehicle VH-203 en route to Lagos', status: 'in-transit' },
  { time: '23 min ago', action: 'Payment confirmed for LOG-3829', status: 'cleared' },
  { time: '31 min ago', action: 'Exception flagged on LOG-3833', status: 'exception' },
  { time: '45 min ago', action: 'Fuel alert: VH-108 at 12%', status: 'hold' },
];

export default function Dashboard() {
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);

  const ACCENT = 'hsl(8, 85%, 55%)';

  useEffect(() => {
    fetchDrivers().then(setDrivers);
    const unsub = subscribeToAllOrders(setOrders);
    return unsub;
  }, []);

  const revenue = orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + (o.cost || 0), 0);
  const pendingRev = orders.filter(o => o.paymentStatus === 'pending').reduce((sum, o) => sum + (o.cost || 0), 0);
  const delivered = orders.filter(o => o.status === 'delivered').length;
  const inTransit = orders.filter(o => o.status === 'in-transit').length;
  const exceptions = orders.filter(o => o.status === 'exception' || o.status === 'cancelled').length;
  const activeDrivers = drivers.filter(d => d.status === 'on-delivery').length;

  const mapMarkers = useMemo(() => [
    ...drivers.filter(d => d.location).map(d => ({
      lat: d.location.lat,
      lng: d.location.lng,
      label: d.name,
      color: d.status === 'on-delivery' ? ACCENT : '#10b981',
    })),
  ], [drivers]);

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const kpiTrends = [
    { label: 'Total Shipments', value: orders.length, icon: Package, trend: '+12%', up: true, color: ACCENT },
    { label: 'Revenue', value: `₦${(revenue / 1000).toFixed(1)}k`, icon: CreditCard, trend: '+8.3%', up: true, color: ACCENT },
    { label: 'Active Drivers', value: activeDrivers, icon: Truck, trend: `/${drivers.length} total`, up: true, color: ACCENT },
    { label: 'In Transit', value: inTransit, icon: TrendingUp, trend: `${exceptions} exceptions`, up: exceptions === 0, color: ACCENT },
  ];

  return (
    <><div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: '"Lexend", "Segoe UI", system-ui, sans-serif', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            Operations Dashboard
          </h1>
          <p style={{ fontFamily: '"Inter", sans-serif', fontSize: '0.7rem', color: 'var(--color-text-secondary)', margin: '2px 0 0 0' }}>
            {dateStr} &middot; {orders.length} total shipments
          </p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 12px',
          borderRadius: 6,
          border: '1px solid var(--color-border)',
          background: 'var(--color-bg-secondary)',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
          <span style={{ fontFamily: '"Inter", sans-serif', fontSize: '0.65rem', color: 'var(--color-text-secondary)' }}>System Online</span>
          <span style={{ fontFamily: '"Lexend", sans-serif', fontSize: '0.6rem', color: 'var(--color-text-secondary)', padding: '1px 4px', borderRadius: 3, background: 'var(--color-bg-tertiary)' }}>
            v2.4
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        {kpiTrends.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} style={{
              background: 'var(--color-bg-secondary)',
              borderRadius: 8,
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--color-surface-highlight)',
              padding: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontFamily: '"Lexend", sans-serif', fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)', margin: 0 }}>
                    {kpi.label}
                  </p>
                  <p style={{ fontFamily: '"Lexend", sans-serif', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: '4px 0 0 0', fontVariantNumeric: 'tabular-nums' }}>
                    {kpi.value}
                  </p>
                </div>
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `${kpi.color}18`,
                  color: kpi.color,
                  flexShrink: 0,
                }}>
                  <Icon size={16} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
                {kpi.up ? (
                  <ArrowUpRight size={10} color="#22c55e" />
                ) : (
                  <ArrowDownRight size={10} color="#ef4444" />
                )}
                <span style={{ fontFamily: '"Inter", sans-serif', fontSize: '0.6rem', color: kpi.up ? '#22c55e' : '#ef4444', fontWeight: 500 }}>
                  {kpi.trend}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content: Map + Drivers */}
      <div className="dash-grid-main" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gridTemplateRows: '1fr', gap: 12, minHeight: 0, height: 420 }}>
        {/* Fleet Map */}
        <div style={{
          background: 'var(--color-bg-secondary)',
          borderRadius: 8,
          border: '1px solid var(--color-border)',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}>
          {/* Map Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 12px',
            borderBottom: '1px solid var(--color-border)',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={13} color="var(--color-accent-primary)" />
              <span style={{ fontFamily: '"Lexend", sans-serif', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)' }}>
                Fleet Map
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontFamily: '"Inter", sans-serif', fontSize: '0.55rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 3 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: ACCENT }} /> {drivers.filter(d => d.status === 'on-delivery').length} active
              </span>
              <span style={{ fontFamily: '"Inter", sans-serif', fontSize: '0.55rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 3 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e' }} /> {drivers.filter(d => d.status === 'available').length} idle
              </span>
            </div>
          </div>
          <MapLibreMap
            center={[9.082, 8.6753]}
            zoom={6}
            markers={mapMarkers}
            className="h-full w-full"
            style={{ minHeight: 280, flex: 1 }}
          />
        </div>

        {/* Driver Status */}
        <div style={{
          background: 'var(--color-bg-secondary)',
          borderRadius: 8,
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--color-surface-highlight)',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ fontFamily: '"Lexend", sans-serif', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Users size={13} /> Driver Status
            </h3>
            <span style={{ fontFamily: '"Lexend", sans-serif', fontSize: '0.6rem', fontWeight: 600, color: ACCENT }}>{activeDrivers} online</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, overflow: 'auto' }}>
            {drivers.slice(0, 6).map(d => (
              <div key={d.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                borderRadius: 6,
                background: d.status === 'on-delivery' ? 'var(--color-accent-primary-subtle)' : 'var(--color-bg-tertiary)',
                transition: 'background 150ms ease',
              }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'var(--color-accent-primary-bg)',
                  color: ACCENT,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: '"Lexend", sans-serif',
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  flexShrink: 0,
                }}>
                  {d.name?.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: '"Inter", sans-serif', fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {d.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    <Circle size={6} color={d.status === 'available' ? '#22c55e' : d.status === 'on-delivery' ? ACCENT : '#6b7280'} />
                    <span style={{ fontFamily: '"Inter", sans-serif', fontSize: '0.6rem', color: 'var(--color-text-secondary)' }}>
                      {d.status} &middot; {d.vehicleType || 'N/A'}
                    </span>
                  </div>
                </div>
                <span style={{
                  fontFamily: '"Lexend", sans-serif',
                  fontSize: '0.55rem',
                  fontWeight: 600,
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: d.status === 'on-delivery' ? 'var(--color-accent-primary-bg)' : 'var(--color-bg-tertiary)',
                  color: d.status === 'on-delivery' ? ACCENT : 'var(--color-text-secondary)',
                }}>
                  {d.totalDeliveries || 0}
                </span>
              </div>
            ))}
            {drivers.length === 0 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, fontFamily: '"Inter", sans-serif', fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>
                Loading drivers...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Chart + Activity + Orders */}
      <div className="dash-grid-bottom" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        {/* Weekly Performance Chart */}
        <div style={{
          background: 'var(--color-bg-secondary)',
          borderRadius: 8,
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--color-surface-highlight)',
          padding: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ fontFamily: '"Lexend", sans-serif', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)', margin: 0 }}>
              Weekly Performance
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontFamily: '"Inter", sans-serif', fontSize: '0.55rem', color: 'var(--color-text-secondary)' }}>
                <span style={{ width: 6, height: 6, borderRadius: 2, background: ACCENT }} /> Revenue
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontFamily: '"Inter", sans-serif', fontSize: '0.55rem', color: 'var(--color-text-secondary)' }}>
                <span style={{ width: 6, height: 6, borderRadius: 2, background: 'hsl(145, 65%, 45%)' }} /> Shipments
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={ACCENT} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={ACCENT} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="day" fontSize={10} tick={{ fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} />
              <YAxis fontSize={10} tick={{ fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 6,
                  fontSize: '0.65rem',
                  color: 'var(--color-text-primary)',
                }}
              />
              <Area type="monotone" dataKey="revenue" stroke={ACCENT} fill="url(#revenueGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="shipments" stroke="hsl(145, 65%, 45%)" fill="none" strokeWidth={2} strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div style={{
          background: 'var(--color-bg-secondary)',
          borderRadius: 8,
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--color-surface-highlight)',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
        }}>
          <h3 style={{ fontFamily: '"Lexend", sans-serif', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={13} /> Activity Feed
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
            {recentActivity.map((item, i) => {
              const statusMap = {
                delivered: 'status-pill--clear',
                assigned: 'status-pill--primary',
                'in-transit': 'status-pill--amber',
                cleared: 'status-pill--clear',
                exception: 'status-pill--red',
                hold: 'status-pill--red',
              };
              return (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 0',
                  borderBottom: i < recentActivity.length - 1 ? '1px solid var(--color-border)' : 'none',
                }}>
                  <span className={`status-pill ${statusMap[item.status] || 'status-pill--muted'}`} style={{ fontSize: '0.55rem', padding: '1px 6px 1px 4px', gap: 3 }}>
                    <svg width="6" height="6" viewBox="0 0 8 8" fill="currentColor"><circle cx="4" cy="4" r="3" /></svg>
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: '"Inter", sans-serif', fontSize: '0.65rem', color: 'var(--color-text-primary)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.action}
                    </div>
                  </div>
                  <span style={{ fontFamily: '"Inter", sans-serif', fontSize: '0.55rem', color: 'var(--color-text-secondary)', flexShrink: 0 }}>{item.time}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Orders */}
        <div style={{
          background: 'var(--color-bg-secondary)',
          borderRadius: 8,
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--color-surface-highlight)',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ fontFamily: '"Lexend", sans-serif', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Package size={13} /> Recent Orders
            </h3>
            <span style={{ fontFamily: '"Lexend", sans-serif', fontSize: '0.55rem', fontWeight: 600, color: ACCENT }}>View all</span>
          </div>
          <div style={{ overflow: 'auto', flex: 1 }}>
            <table className="data-grid" style={{ fontSize: '0.65rem' }}>
              <thead>
                <tr>
                  <th style={{ padding: '6px 8px', fontSize: '0.55rem' }}>Pro #</th>
                  <th style={{ padding: '6px 8px', fontSize: '0.55rem' }}>Status</th>
                  <th style={{ padding: '6px 8px', fontSize: '0.55rem', textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 6).map(order => (
                  <tr key={order.id} className={`data-row ${order.status === 'exception' || order.status === 'cancelled' ? 'data-row--alert' : ''}`}>
                    <td style={{ padding: '8px', fontFamily: '"Lexend", sans-serif', fontWeight: 600, fontSize: '0.6rem' }}>
                      {order.id?.slice(0, 8)}
                    </td>
                    <td style={{ padding: '4px 8px' }}>
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="tabular-nums" style={{ padding: '8px', textAlign: 'right', fontSize: '0.6rem' }}>
                      ₦{order.cost?.toLocaleString()}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ padding: '24px', textAlign: 'center', fontFamily: '"Inter", sans-serif', fontSize: '0.65rem', color: 'var(--color-text-secondary)' }}>
                      No orders yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    </>
  );
}

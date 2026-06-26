import { useState } from 'react';
import { Truck, Package, Car, Bike, Search, MapPin, ChevronDown, TrendingUp, Circle, Plus, Zap, Bell } from 'lucide-react';

const fontUrl = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap";

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-0.5 h-5 rounded-full bg-[#3B82F6]" />
      <span className="text-[#94A3B8] text-[10px] font-semibold uppercase tracking-[0.15em]">{children}</span>
      <div className="flex-1 h-px bg-gradient-to-r from-[#1E293B] to-transparent" />
    </div>
  );
}

function Swatch({ name, hex, desc }) {
  return (
    <div className="group relative">
      <div className="w-full aspect-square rounded-lg border border-white/5 mb-2 transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-lg" style={{ backgroundColor: hex }} />
      <div className="text-[10px] font-semibold text-[#F8FAFC] tracking-wide">{name}</div>
      <div className="text-[9px] text-[#64748B] font-mono">{hex}</div>
      {desc && <div className="text-[8px] text-[#475569] mt-0.5 leading-tight">{desc}</div>}
    </div>
  );
}

const C = 'rounded-lg border border-[#1E293B] bg-[#161B26] shadow-[0_4px_24px_rgba(0,0,0,0.25)]';
const H = 'text-[9px] font-semibold text-[#64748B] uppercase tracking-[0.1em]';

const typography = [
  { n: 'H1 Telemetry', s: '64px', l: '72px', w: 800, t: '-0.03em', x: '48,291' },
  { n: 'H2 Section', s: '36px', l: '44px', w: 700, t: '-0.02em', x: 'Fleet Overview' },
  { n: 'H3 Card Title', s: '24px', l: '32px', w: 700, t: '-0.015em', x: 'Active Deliveries' },
  { n: 'H4 Subheading', s: '18px', l: '26px', w: 600, t: '-0.01em', x: 'Vehicle Performance' },
  { n: 'Body Large', s: '16px', l: '24px', w: 500, t: '0', x: 'Track your shipments in real-time.' },
  { n: 'Body Regular', s: '14px', l: '22px', w: 400, t: '0', x: 'Monitor fleet activity across all modalities.' },
  { n: 'Label Medium', s: '13px', l: '18px', w: 600, t: '0.01em', x: 'In Transit' },
  { n: 'Caption', s: '12px', l: '16px', w: 500, t: '0.02em', x: '2.4 km away' },
  { n: 'Micro Table', s: '11px', l: '14px', w: 500, t: '0.01em', x: '#TRK-9421' },
  { n: 'Overline Tiny', s: '10px', l: '12px', w: 700, t: '0.1em', x: 'STATUS: ACTIVE' },
];

const vehicles = [
  { icon: Truck, label: 'Freight Truck', c: '#3B82F6', v: 'truck' },
  { icon: Package, label: 'Delivery Van', c: '#F97316', v: 'van' },
  { icon: Car, label: 'Dispatch Car', c: '#22C55E', v: 'car' },
  { icon: Bike, label: 'Cargo E-Bike', c: '#EC4899', v: 'bike' },
];

const sc = {
  'On Route': { bg: 'rgba(59,130,246,0.15)', t: '#60A5FA', d: '#3B82F6' },
  Delivered: { bg: 'rgba(34,197,94,0.15)', t: '#4ADE80', d: '#22C55E' },
  Idle: { bg: 'rgba(148,163,184,0.15)', t: '#94A3B8', d: '#64748B' },
  Maintenance: { bg: 'rgba(239,68,68,0.15)', t: '#F87171', d: '#EF4444' },
};

const tableData = [
  { id: '#TRK-9421', d: 'Alex Morgan', v: 'Freight Truck', s: 'On Route', eta: '14 min', loc: 'I-95 N, Mile 42', p: 65 },
  { id: '#TRK-8810', d: 'Sarah Chen', v: 'Delivery Van', s: 'Delivered', eta: '—', loc: '142 Main St', p: 100 },
  { id: '#TRK-7732', d: 'James Wilson', v: 'Dispatch Car', s: 'Idle', eta: '—', loc: 'Hub A - Dock 3', p: 0 },
  { id: '#TRK-6645', d: 'Maria Lopez', v: 'Cargo E-Bike', s: 'On Route', eta: '8 min', loc: '5th Ave & 23rd', p: 82 },
  { id: '#TRK-5501', d: 'David Kim', v: 'Freight Truck', s: 'Maintenance', eta: '—', loc: 'Depot Garage', p: 0 },
  { id: '#TRK-4398', d: 'Emma Davis', v: 'Delivery Van', s: 'On Route', eta: '22 min', loc: 'Brooklyn, NY 11201', p: 45 },
];

const drivers = [
  { i: 'AM', c: '#3B82F6' }, { i: 'SC', c: '#22C55E' }, { i: 'JW', c: '#F97316' },
  { i: 'ML', c: '#EC4899' }, { i: 'DK', c: '#8B5CF6' }, { i: 'ED', c: '#06B6D4' },
];

const cap = { truck: '26,000 lbs', van: '4,500 lbs', car: '1,200 lbs', bike: '300 lbs' };

function Avatar({ i, c }) {
  return <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold shrink-0 text-[10px]" style={{ backgroundColor: `${c}20`, color: c }}>{i}</div>;
}

function RadialGauge({ value = 75, color = '#3B82F6', label = 'Battery', unit = '%' }) {
  const r = 32, circ = 2 * Math.PI * r, off = circ - (value / 100) * circ;
  return (
    <div className="relative flex flex-col items-center gap-2">
      <svg width="80" height="80" viewBox="0 0 80 80" className="transform -rotate-90 shrink-0">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#1E293B" strokeWidth="5" />
        <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={off} style={{ filter: `drop-shadow(0 0 6px ${color}40)`, transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-[#F8FAFC]">{value}{unit}</span>
      </div>
      <span className="text-[10px] font-medium text-[#64748B] tracking-wide uppercase">{label}</span>
    </div>
  );
}

function Sparkline({ data = [30, 45, 38, 52, 48, 63, 58, 72, 68, 85], color = '#22C55E' }) {
  const w = 120, h = 32, min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const pts = data.map((d, i) => `${(i / (data.length - 1)) * w},${h - ((d - min) / range) * h}`).join(' ');
  const gid = `sg-${color.replace('#', '')}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0">
      <path d={`M${pts}`} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 4px ${color}40)` }} />
      <path d={`M${pts} V${h} H0 Z`} fill={`url(#${gid})`} opacity="0.15" />
      <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.4" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
    </svg>
  );
}

function MiniAreaChart() {
  const data = [2.4, 2.1, 2.8, 2.5, 3.1, 2.9];
  const w = 200, h = 60, min = Math.min(...data), max = Math.max(...data), range = (max - min) || 1, pad = 4;
  const pts = data.map((d, i) => `${pad + (i / (data.length - 1)) * (w - pad * 2)},${h - pad - ((d - min) / range) * (h - pad * 2)}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="w-full">
      <path d={`M${pts}`} fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 6px rgba(59,130,246,0.3))' }} />
      <path d={`M${pts} V${h} H0 Z`} fill="url(#ag)" opacity="0.12" />
      {data.map((d, i) => <circle key={i} cx={pad + (i / (data.length - 1)) * (w - pad * 2)} cy={h - pad - ((d - min) / range) * (h - pad * 2)} r="2.5" fill="#3B82F6" />)}
      <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" /><stop offset="100%" stopColor="#3B82F6" stopOpacity="0" /></linearGradient></defs>
    </svg>
  );
}

function BentoCard({ size, children }) {
  const s = { '2x1': 'col-span-2 row-span-1', '3x2': 'col-span-3 row-span-2', '1x1': 'col-span-1 row-span-1' };
  return <div className={`${s[size] || s['1x1']} ${C} p-5 flex flex-col transition-all duration-200 hover:border-[#334155]`}>{children}</div>;
}

export default function DesignSystem() {
  const [tab, setTab] = useState('truck');
  const [hv, setHv] = useState(null);
  const [ac, setAc] = useState(null);
  const av = vehicles.find(v => v.v === tab);

  const btnRow = (label, base, hover, active) => (
    <div key={label} className="flex items-center gap-6 mb-4 pb-4 border-b border-[#1E293B] last:border-0">
      <span className="text-[11px] font-semibold text-[#64748B] w-32 shrink-0">{label}</span>
      {['Default', 'Hover', 'Active'].map((s, si) => {
        const k = `${label}-${si}`;
        return (
          <button key={si}
            className={`px-6 py-2.5 rounded-lg text-[13px] font-semibold transition-all duration-200 cursor-pointer ${hv === k ? hover : ac === k ? active : base}`}
            onMouseEnter={() => setHv(k)} onMouseLeave={() => { setHv(null); setAc(null); }} onMouseDown={() => setAc(k)} onMouseUp={() => setAc(null)}>{s}</button>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: '#0B0F17', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <link rel="stylesheet" href={fontUrl} />
      <style>{`body{background:#0B0F17!important;margin:0}#root{background:#0B0F17}`}</style>
      <div className="fixed top-0 left-0 right-0 z-50 px-4 py-2" style={{ background: 'rgba(11,15,23,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(30,41,59,0.6)' }}>
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] flex items-center justify-center"><Zap size={12} className="text-white" /></div>
            <span className="text-[#F8FAFC] font-bold text-xs tracking-tight">LOGISTIX</span>
            <span className="text-[#64748B] text-[9px] font-medium tracking-wide ml-2 uppercase border-l border-[#1E293B] pl-2">Design System v2.0</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-medium text-[#64748B]">
            {['#colors','#typography','#layout','#components','#forms','#data'].map(h => (
              <a key={h} href={h} className="hover:text-[#F8FAFC] transition-colors">{h.replace('#','').replace(/^(.)/, m => m.toUpperCase())}</a>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 pt-20 pb-12">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-4 w-0.5 rounded-full bg-gradient-to-b from-[#3B82F6] to-[#EC4899]" />
            <span className="text-[#64748B] text-[9px] font-semibold uppercase tracking-[0.2em]">Premium Multi-Modal Logistics</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#F8FAFC] mb-2 leading-tight" style={{ letterSpacing: '-0.03em' }}>
            Design System
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] via-[#22C55E] to-[#EC4899]">Component Library</span>
          </h1>
          <p className="text-[#94A3B8] text-xs max-w-2xl leading-relaxed">A comprehensive UI/UX framework powering fleet management across trucks, vans, cars, and cargo e-bikes. Dark-slate aesthetic with semantic modality colors and precision-crafted interactions.</p>
        </div>

        <section id="colors" className="mb-8">
          <SectionLabel>Foundation / Tokens</SectionLabel>
          <h2 className="text-sm font-bold text-[#F8FAFC] mb-3" style={{ letterSpacing: '-0.02em' }}>Color Palette</h2>
          <div className="grid grid-cols-12 gap-3">
            {[
              ['Canvas', [
                { name: 'Canvas Base', hex: '#0B0F17', desc: 'App background' },
                { name: 'Surface Card', hex: '#161B26', desc: 'Card & container' },
                { name: 'Surface Hover', hex: '#1E2538', desc: 'Hover state' },
              ]],
              ['Borders', [
                { name: 'Border Default', hex: '#1E293B', desc: 'Subtle border' },
                { name: 'Border Light', hex: '#334155', desc: 'Emphasized' },
                { name: 'Border Active', hex: '#475569', desc: 'Active state' },
              ]],
              ['Text', [
                { name: 'Text Primary', hex: '#F8FAFC', desc: 'Headings / body' },
                { name: 'Text Secondary', hex: '#CBD5E1', desc: 'Secondary text' },
                { name: 'Text Muted', hex: '#94A3B8', desc: 'Labels / caption' },
                { name: 'Text Dim', hex: '#64748B', desc: 'Placeholder' },
              ]],
              ['Semantic / Accent', [
                { name: 'Electric Blue', hex: '#3B82F6', desc: 'Truck / Primary' },
                { name: 'Safety Orange', hex: '#F97316', desc: 'Van / Warning' },
                { name: 'Lime Green', hex: '#22C55E', desc: 'Car / Success' },
                { name: 'Hot Pink', hex: '#EC4899', desc: 'Bike / Express' },
              ]],
              ['Glows', [
                { name: 'Blue Glow', hex: 'rgba(59,130,246,0.2)', desc: 'Primary aura' },
                { name: 'Orange Glow', hex: 'rgba(249,115,22,0.2)', desc: 'Van aura' },
                { name: 'Green Glow', hex: 'rgba(34,197,94,0.2)', desc: 'Car aura' },
                { name: 'Pink Glow', hex: 'rgba(236,72,153,0.2)', desc: 'Bike aura' },
              ]],
            ].map(([group, items]) => (
              <div key={group} className="col-span-4">
                <div className="text-[9px] font-bold text-[#64748B] uppercase tracking-[0.12em] mb-2">{group}</div>
                <div className="grid grid-cols-3 gap-2">{items.map(c => <Swatch key={c.name} {...c} />)}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="typography" className="mb-8">
          <SectionLabel>Foundation / Tokens</SectionLabel>
          <h2 className="text-sm font-bold text-[#F8FAFC] mb-3" style={{ letterSpacing: '-0.02em' }}>Typography Scale</h2>
          <div className={`${C} overflow-hidden`}>
            <div className="grid grid-cols-12 gap-0">
              <div className="col-span-6 p-3 border-r border-[#1E293B]">
                <div className={H}>Family: Plus Jakarta Sans</div>
                {typography.slice(0, 5).map((t, i) => (
                  <div key={i} className="flex items-baseline justify-between py-1.5 border-b border-[#1E293B] last:border-0">
                    <span className="text-[#F8FAFC] font-bold" style={{ fontSize: t.s, lineHeight: t.l, fontWeight: t.w, letterSpacing: t.t }}>{t.x}</span>
                    <div className="text-right shrink-0 ml-4">
                      <div className="text-[10px] font-semibold text-[#CBD5E1]">{t.n}</div>
                      <div className="text-[8px] text-[#64748B] font-mono">{t.s} / {t.l} · W{t.w}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="col-span-6 p-3">
                <div className={H}>UI & Data Text</div>
                {typography.slice(5).map((t, i) => (
                  <div key={i} className="flex items-baseline justify-between py-1.5 border-b border-[#1E293B] last:border-0">
                    <span className="text-[#F8FAFC]" style={{ fontSize: t.s, lineHeight: t.l, fontWeight: t.w, letterSpacing: t.t }}>{t.x}</span>
                    <div className="text-right shrink-0 ml-4">
                      <div className="text-[10px] font-semibold text-[#CBD5E1]">{t.n}</div>
                      <div className="text-[8px] text-[#64748B] font-mono">{t.s} / {t.l} · W{t.w}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="layout" className="mb-8">
          <SectionLabel>Infrastructure</SectionLabel>
          <h2 className="text-sm font-bold text-[#F8FAFC] mb-3" style={{ letterSpacing: '-0.02em' }}>Bento-Box Grid</h2>
          <div className="grid grid-cols-6 grid-rows-3 gap-3 min-h-[350px]">
            {[
              { s: '2x1', dot: '#3B82F6', l: 'Live Fleet Status', icon: null },
              { s: '1x1', dot: '#22C55E', l: 'Alerts', icon: Bell },
              { s: '1x1', dot: '#F97316', l: 'Quick Actions', icon: Plus },
              { s: '3x2', dot: '#EC4899', l: 'Route Map', icon: MapPin },
              { s: '2x1', dot: '#8B5CF6', l: 'Analytics', icon: TrendingUp },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <BentoCard key={i} size={item.s}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.dot }} />
                    <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-[0.1em]">{item.l}</span>
                  </div>
                  <div className="flex-1 flex items-center justify-center rounded-lg border border-dashed border-[#1E293B] bg-[#0B0F17]/30">
                    {Icon ? <Icon size={18} className="text-[#475569]" /> : <span className="text-[11px] text-[#475569]">Telemetry widget</span>}
                  </div>
                </BentoCard>
              );
            })}
          </div>
        </section>

        <section id="components" className="mb-24">
          <SectionLabel>Interactive Components</SectionLabel>
          <h2 className="text-[28px] font-bold text-[#F8FAFC] mb-8" style={{ letterSpacing: '-0.02em' }}>Buttons & State Micro-interactions</h2>
          {btnRow('Primary Filled', 'bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]', 'from-[#60A5FA] to-[#3B82F6] shadow-[0_0_30px_rgba(59,130,246,0.5)]', 'from-[#1D4ED8] to-[#1E40AF]')}
          {btnRow('Secondary Outline', 'border border-[#334155] text-[#CBD5E1] bg-transparent', 'border-[#3B82F6] text-[#3B82F6] bg-[rgba(59,130,246,0.08)]', 'border-[#2563EB] text-[#60A5FA] bg-[rgba(59,130,246,0.15)]')}
          {btnRow('Destructive', 'bg-gradient-to-r from-[#EF4444] to-[#DC2626] text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]', 'from-[#F87171] to-[#EF4444] shadow-[0_0_30px_rgba(239,68,68,0.5)]', 'from-[#B91C1C] to-[#991B1B]')}
        </section>

        <section className="mb-24">
          <SectionLabel>Multi-Modal Selection</SectionLabel>
          <h2 className="text-[28px] font-bold text-[#F8FAFC] mb-8" style={{ letterSpacing: '-0.02em' }}>Vehicle Mode Selectors</h2>
          <div className="mb-10">
            <div className={H}>Segmented Toggle</div>
            <div className="inline-flex rounded-xl border border-[#1E293B] bg-[#0B0F17] p-1 gap-1">
              {vehicles.map((v) => {
                const Icon = v.icon, a = tab === v.v;
                return (
                  <button key={v.v} onClick={() => setTab(v.v)}
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-[12px] font-semibold transition-all duration-200 cursor-pointer ${a ? 'text-white shadow-sm' : 'text-[#64748B] hover:text-[#CBD5E1]'}`}
                    style={{ backgroundColor: a ? `${v.c}20` : 'transparent', boxShadow: a ? `inset 0 0 0 1px ${v.c}40` : 'none' }}>
                    <Icon size={16} style={{ color: a ? v.c : '#64748B' }} /> {v.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className={`${C} p-8`}>
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${av.c}15`, border: `1px solid ${av.c}30` }}>
                <av.icon size={32} style={{ color: av.c }} />
              </div>
              <div>
                <div className="text-xl font-bold text-[#F8FAFC]">{av.label}</div>
                <div className="text-[13px] text-[#64748B] mt-1">Capacity: {cap[tab]}</div>
              </div>
              <div className="ml-auto flex items-center gap-4">
                {['Active', 'On Route', 'Idle'].map(s => (
                  <div key={s} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#1E293B] text-[11px] font-medium text-[#94A3B8]">
                    <Circle size={6} fill={s === 'Active' ? '#22C55E' : s === 'On Route' ? '#3B82F6' : '#64748B'} stroke="none" /> {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="forms" className="mb-24">
          <SectionLabel>Inputs & Controls</SectionLabel>
          <h2 className="text-[28px] font-bold text-[#F8FAFC] mb-8" style={{ letterSpacing: '-0.02em' }}>Form Elements</h2>
          <div className="grid grid-cols-12 gap-6">
            <div className={`col-span-4 ${C} p-6`}>
              <div className={H}>Floating Label Fields</div>
              <div className="space-y-5">
                {['Pickup Location', 'Dropoff Location', 'Scheduled Date'].map((l, i) => (
                  <div key={i} className="relative">
                    <input type="text" placeholder=" "
                      className="peer w-full bg-transparent border border-[#334155] rounded-lg px-3.5 pt-5 pb-2 text-[13px] text-[#F8FAFC] outline-none transition-all duration-200 focus:border-[#3B82F6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]" />
                    <label className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] text-[#64748B] transition-all duration-200 pointer-events-none peer-focus:text-[11px] peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-[#3B82F6] peer-not-placeholder-shown:text-[11px] peer-not-placeholder-shown:top-3 peer-not-placeholder-shown:-translate-y-0 peer-not-placeholder-shown:text-[#64748B]">{l}</label>
                  </div>
                ))}
              </div>
            </div>
            <div className={`col-span-4 ${C} p-6`}>
              <div className={H}>Multi-Stop Route</div>
              <div>
                {[
                  { l: 'Stop 1 — Origin', c: '#3B82F6' },
                  { l: 'Stop 2 — Waypoint', c: '#F97316' },
                  { l: 'Stop 3 — Waypoint', c: '#22C55E' },
                  { l: 'Stop 4 — Destination', c: '#EC4899' },
                ].map((stop, i) => (
                  <div key={i} className="flex items-stretch gap-3">
                    <div className="flex flex-col items-center w-5">
                      <div className="w-2.5 h-2.5 rounded-full mt-2.5" style={{ backgroundColor: stop.c }} />
                      {i < 3 && <div className="w-px flex-1 bg-gradient-to-b" style={{ backgroundImage: `linear-gradient(to bottom, ${stop.c}, ${['#F97316','#22C55E','#EC4899'][i]})` }} />}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2 mb-1.5"><span className="text-[9px] font-bold text-[#64748B] uppercase tracking-[0.08em]">{stop.l}</span></div>
                      <div className="relative">
                        <input type="text" placeholder="Enter address..." className="w-full bg-[#0B0F17] border border-[#1E293B] rounded-lg px-3 py-2 text-[12px] text-[#CBD5E1] outline-none transition-all duration-200 focus:border-[#3B82F6] placeholder:text-[#475569]" />
                        <MapPin size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#475569]" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={`col-span-4 ${C} p-6`}>
              <div className={H}>Filter Dropdown</div>
              <div className="space-y-4">
                {['All Vehicle Types', 'Sort by: ETA'].map((l, i) => (
                  <div key={i} className="flex items-center justify-between w-full bg-[#0B0F17] border border-[#334155] rounded-lg px-3.5 py-2.5 text-[13px] text-[#CBD5E1] cursor-pointer hover:border-[#475569] transition-colors">
                    <span>{l}</span>
                    <ChevronDown size={14} className="text-[#64748B]" />
                  </div>
                ))}
                <div className="flex items-center gap-2 w-full bg-[#0B0F17] border border-[#334155] rounded-lg px-3.5 py-2 text-[13px] text-[#CBD5E1]">
                  <Search size={14} className="text-[#475569] shrink-0" />
                  <input type="text" placeholder="Search vehicles..." className="bg-transparent outline-none flex-1 text-[13px] text-[#CBD5E1] placeholder:text-[#475569]" />
                  <kbd className="text-[9px] text-[#475569] font-mono border border-[#1E293B] rounded px-1.5 py-0.5">⌘K</kbd>
                </div>
                <div className="pt-2 border-t border-[#1E293B]">
                  {[{ l: 'Show idle vehicles only', on: true }, { l: 'High priority only', on: false }].map((t, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5">
                      <span className="text-[12px] text-[#CBD5E1]">{t.l}</span>
                      <div className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors ${t.on ? 'bg-[#3B82F6]' : 'bg-[#1E293B]'}`}>
                        <div className={`w-3 h-3 rounded-full bg-white absolute top-0.5 shadow-sm ${t.on ? 'right-0.5' : 'left-0.5'}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="data" className="mb-24">
          <SectionLabel>Data Visualization</SectionLabel>
          <h2 className="text-[28px] font-bold text-[#F8FAFC] mb-8" style={{ letterSpacing: '-0.02em' }}>High-Density Data Table</h2>
          <div className={`${C} overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px]">
                <thead>
                  <tr className="border-b border-[#1E293B]">
                    {['Tracking ID', 'Driver', 'Vehicle', 'Status', 'ETA', 'Location', 'Progress'].map(h => (
                      <th key={h} className="px-4 py-3 text-[10px] font-bold text-[#64748B] uppercase tracking-[0.08em] whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, i) => {
                    const s = sc[row.s], dr = drivers[i];
                    const Icon = vehicles.find(v => row.v.startsWith('Freight') ? v.v === 'truck' : row.v.startsWith('Delivery') ? v.v === 'van' : row.v.startsWith('Dispatch') ? v.v === 'car' : v.v === 'bike')?.icon || Truck;
                    return (
                      <tr key={row.id} className="border-b border-[#1E293B] transition-colors hover:bg-[#1E2538]" style={{ backgroundColor: i % 2 ? 'rgba(30,37,56,0.3)' : 'transparent' }}>
                        <td className="px-4 py-3 font-mono text-[11px] text-[#3B82F6] font-semibold whitespace-nowrap">{row.id}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar i={dr.i} c={dr.c} />
                            <span className="text-[#F8FAFC] text-[12px] font-medium whitespace-nowrap">{row.d}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Icon size={13} className="text-[#64748B]" />
                            <span className="text-[#CBD5E1] text-[12px] whitespace-nowrap">{row.v}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full w-fit text-[10px] font-semibold whitespace-nowrap" style={{ backgroundColor: s.bg, color: s.t }}>
                            <Circle size={5} fill={s.d} stroke="none" /> {row.s}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[#F8FAFC] font-medium whitespace-nowrap">{row.eta}</td>
                        <td className="px-4 py-3 text-[#94A3B8] text-[12px] max-w-[160px] truncate whitespace-nowrap">{row.loc}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-20 h-1.5 rounded-full bg-[#1E293B] overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-500" style={{
                                width: `${row.p}%`,
                                background: row.p === 100 ? 'linear-gradient(90deg,#22C55E,#16A34A)' : row.p === 0 ? '#334155' : 'linear-gradient(90deg,#3B82F6,#60A5FA)',
                              }} />
                            </div>
                            <span className="text-[10px] font-mono text-[#64748B] w-8 text-right">{row.p}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#1E293B]">
              <span className="text-[11px] text-[#64748B]">Showing 6 of 142 shipments</span>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 rounded-lg border border-[#1E293B] text-[11px] text-[#64748B] hover:border-[#334155] hover:text-[#CBD5E1] transition-colors cursor-pointer">Previous</button>
                {[1, 2, 3].map(n => (
                  <button key={n} className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold cursor-pointer ${n === 1 ? 'bg-[#3B82F6] text-white' : 'border border-[#1E293B] text-[#64748B] hover:border-[#334155] hover:text-[#CBD5E1] transition-colors'}`}>{n}</button>
                ))}
                <span className="text-[#475569] text-[11px]">...</span>
                <button className="px-3 py-1.5 rounded-lg border border-[#1E293B] text-[11px] text-[#64748B] hover:border-[#334155] hover:text-[#CBD5E1] transition-colors cursor-pointer">Next</button>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-24">
          <SectionLabel>Telemetry & Analytics</SectionLabel>
          <h2 className="text-[28px] font-bold text-[#F8FAFC] mb-8" style={{ letterSpacing: '-0.02em' }}>Charts & Widgets</h2>
          <div className="grid grid-cols-12 gap-6">
            <div className={`col-span-4 ${C} p-6`}>
              <div className={H}>Fleet Telemetry</div>
              <div className="grid grid-cols-3 gap-6">
                <RadialGauge value={82} color="#3B82F6" label="Battery" unit="%" />
                <RadialGauge value={45} color="#F97316" label="Fuel" unit="%" />
                <RadialGauge value={92} color="#22C55E" label="Health" unit="%" />
              </div>
            </div>
            <div className={`col-span-5 ${C} p-6`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className={H}>Cost Per Mile</div>
                  <div className="text-2xl font-bold text-[#F8FAFC] mt-1" style={{ letterSpacing: '-0.02em' }}>$2.94
                    <span className="text-[13px] font-semibold text-[#22C55E] ml-2">+8.3%</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {['1D','1W','1M','1Y'].map(p => (
                    <button key={p} className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-colors cursor-pointer ${p === '1M' ? 'bg-[#3B82F6] text-white' : 'text-[#64748B] hover:text-[#CBD5E1]'}`}>{p}</button>
                  ))}
                </div>
              </div>
              <MiniAreaChart />
              <div className="grid grid-cols-6 gap-2 mt-3">
                {['Jan','Feb','Mar','Apr','May','Jun'].map(m => <div key={m} className="text-[9px] text-[#475569] text-center font-medium">{m}</div>)}
              </div>
            </div>
            <div className={`col-span-3 ${C} p-6`}>
              <div className={H}>Live Metrics</div>
              <div className="space-y-4">
                {[
                  { l: 'Avg. Speed', v: '47 mph', d: [42,48,45,52,49,55,51,58,53,47], c: '#3B82F6' },
                  { l: 'Delivery Rate', v: '98.2%', d: [95,97,96,98,97,99,98,99,98,98.2], c: '#22C55E' },
                  { l: 'Idle Time', v: '12 min', d: [18,15,22,10,8,14,11,9,13,12], c: '#F97316' },
                ].map((m, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-[#1E293B] last:border-0">
                    <div>
                      <div className="text-[11px] text-[#94A3B8]">{m.l}</div>
                      <div className="text-[15px] font-bold text-[#F8FAFC]">{m.v}</div>
                    </div>
                    <Sparkline data={m.d} color={m.c} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="border-t border-[#1E293B] pt-8 mt-16">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-[#3B82F6]" />
              <span className="text-[11px] font-semibold text-[#64748B] tracking-wide">LOGISTIX Design System v2.0</span>
            </div>
            <div className="text-[10px] text-[#475569] font-mono">Tokens · Components · Patterns · Guidelines</div>
          </div>
        </div>
      </div>
    </div>
  );
}

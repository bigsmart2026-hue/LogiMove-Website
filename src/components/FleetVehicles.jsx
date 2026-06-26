import { useState, useEffect, useRef, useCallback } from 'react';

const BikeSVGs = [
  <svg viewBox="0 0 120 80" width="120" height="80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="30" cy="62" r="14" fill="#1e293b" stroke="#334155" strokeWidth="2.5" />
    <circle cx="30" cy="62" r="6" fill="#64748b" />
    <circle cx="90" cy="62" r="14" fill="#1e293b" stroke="#334155" strokeWidth="2.5" />
    <circle cx="90" cy="62" r="6" fill="#64748b" />
    <line x1="30" y1="48" x2="90" y2="48" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
    <line x1="30" y1="48" x2="60" y2="18" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
    <line x1="60" y1="18" x2="82" y2="38" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
    <line x1="50" y1="38" x2="70" y2="28" stroke="#334155" strokeWidth="2" />
    <line x1="60" y1="18" x2="60" y2="48" stroke="#334155" strokeWidth="3" />
    <line x1="60" y1="18" x2="55" y2="12" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
    <rect x="55" y="8" width="10" height="6" rx="2" fill="hsl(8, 85%, 55%)" />
    <circle cx="96" cy="48" r="3" fill="#ef4444" />
    <rect x="96" y="46" width="8" height="8" rx="1" fill="#f59e0b" opacity="0.8" />
  </svg>,
  <svg viewBox="0 0 120 80" width="120" height="80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="28" cy="60" r="13" fill="#1e293b" stroke="#334155" strokeWidth="2.5" />
    <circle cx="28" cy="60" r="5" fill="#64748b" />
    <circle cx="92" cy="60" r="13" fill="#1e293b" stroke="#334155" strokeWidth="2.5" />
    <circle cx="92" cy="60" r="5" fill="#64748b" />
    <line x1="28" y1="47" x2="92" y2="47" stroke="#475569" strokeWidth="3.5" strokeLinecap="round" />
    <line x1="28" y1="47" x2="55" y2="15" stroke="#475569" strokeWidth="3.5" strokeLinecap="round" />
    <line x1="55" y1="15" x2="80" y2="35" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
    <line x1="55" y1="15" x2="55" y2="47" stroke="#334155" strokeWidth="2.5" />
    <line x1="55" y1="15" x2="52" y2="10" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
    <rect x="50" y="6" width="10" height="5" rx="2" fill="#10b981" />
    <rect x="84" y="44" width="14" height="10" rx="2" fill="hsl(8, 85%, 55%)" opacity="0.9" />
    <text x="87" y="52" fill="white" fontSize="6" fontWeight="bold">LOG</text>
  </svg>,
  <svg viewBox="0 0 120 80" width="120" height="80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="63" r="12" fill="#1e293b" stroke="#334155" strokeWidth="2" />
    <circle cx="32" cy="63" r="5" fill="#64748b" />
    <circle cx="88" cy="63" r="12" fill="#1e293b" stroke="#334155" strokeWidth="2" />
    <circle cx="88" cy="63" r="5" fill="#64748b" />
    <line x1="32" y1="51" x2="88" y2="51" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
    <line x1="32" y1="51" x2="58" y2="22" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
    <line x1="58" y1="22" x2="82" y2="42" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
    <line x1="58" y1="22" x2="58" y2="51" stroke="#334155" strokeWidth="2.5" />
    <rect x="52" y="10" width="12" height="6" rx="2" fill="#f59e0b" />
    <rect x="80" y="48" width="16" height="10" rx="2" fill="#ef4444" opacity="0.85" />
    <circle cx="96" cy="48" r="2.5" fill="#fbbf24" />
    <circle cx="96" cy="48" r="1" fill="#1e293b" />
  </svg>,
];

const CarSVGs = [
  <svg viewBox="0 0 160 90" width="160" height="90" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 62c0-8.8 7.2-16 16-16h2l4-12c2-6 8-10 14-10h48c6 0 12 4 14 10l4 12h2c8.8 0 16 7.2 16 16v10c0 5-4 9-9 9H29c-5 0-9-4-9-9v-10z" fill="hsl(8, 85%, 55%)" />
    <path d="M42 46l4-12c2-6 8-10 14-10h48c6 0 12 4 14 10l4 12H42z" fill="hsl(8, 85%, 48%)" opacity="0.6" />
    <rect x="35" y="42" width="90" height="14" rx="3" fill="hsl(8, 85%, 55%)" opacity="0.4" />
    <circle cx="46" cy="66" r="14" fill="#1e293b" stroke="#334155" strokeWidth="2" />
    <circle cx="46" cy="66" r="6" fill="#64748b" />
    <circle cx="114" cy="66" r="14" fill="#1e293b" stroke="#334155" strokeWidth="2" />
    <circle cx="114" cy="66" r="6" fill="#64748b" />
    <rect x="70" y="38" width="20" height="8" rx="3" fill="#93c5fd" opacity="0.5" />
    <circle cx="46" cy="66" r="2.5" fill="#e2e8f0" />
    <circle cx="114" cy="66" r="2.5" fill="#e2e8f0" />
    <rect x="30" y="56" width="6" height="8" rx="1" fill="#fbbf24" opacity="0.9" />
    <rect x="124" y="56" width="6" height="8" rx="1" fill="#ef4444" opacity="0.9" />
  </svg>,
  <svg viewBox="0 0 160 90" width="160" height="90" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 64c0-9.4 7.6-17 17-17h3l5-13c2.5-6.5 9-11 16-11h50c7 0 13.5 4.5 16 11l5 13h3c9.4 0 17 7.6 17 17v12c0 5.5-4.5 10-10 10H28c-5.5 0-10-4.5-10-10V64z" fill="#dc2626" />
    <path d="M43 47l5-13c2.5-6.5 9-11 16-11h50c7 0 13.5 4.5 16 11l5 13H43z" fill="#b91c1c" opacity="0.5" />
    <rect x="36" y="44" width="95" height="15" rx="3" fill="#ef4444" opacity="0.35" />
    <circle cx="48" cy="68" r="14" fill="#1e293b" stroke="#334155" strokeWidth="2" />
    <circle cx="48" cy="68" r="6" fill="#64748b" />
    <circle cx="118" cy="68" r="14" fill="#1e293b" stroke="#334155" strokeWidth="2" />
    <circle cx="118" cy="68" r="6" fill="#64748b" />
    <rect x="72" y="40" width="22" height="8" rx="3" fill="#fca5a5" opacity="0.5" />
    <circle cx="48" cy="68" r="2.5" fill="#e2e8f0" />
    <circle cx="118" cy="68" r="2.5" fill="#e2e8f0" />
    <rect x="28" y="58" width="8" height="8" rx="1" fill="#fbbf24" opacity="0.9" />
    <rect x="130" y="58" width="8" height="8" rx="1" fill="#fbbf24" opacity="0.9" />
  </svg>,
  <svg viewBox="0 0 160 90" width="160" height="90" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 60c0-8.3 6.7-15 15-15h2l5-11c3-5.5 9-9 15-9h46c6 0 12 3.5 15 9l5 11h2c8.3 0 15 6.7 15 15v12c0 5.5-4.5 10-10 10H32c-5.5 0-10-4.5-10-10V60z" fill="#059669" />
    <path d="M44 45l5-11c3-5.5 9-9 15-9h46c6 0 12 3.5 15 9l5 11H44z" fill="#047857" opacity="0.5" />
    <rect x="37" y="42" width="92" height="13" rx="3" fill="#34d399" opacity="0.35" />
    <circle cx="50" cy="64" r="13" fill="#1e293b" stroke="#334155" strokeWidth="2" />
    <circle cx="50" cy="64" r="5.5" fill="#64748b" />
    <circle cx="116" cy="64" r="13" fill="#1e293b" stroke="#334155" strokeWidth="2" />
    <circle cx="116" cy="64" r="5.5" fill="#64748b" />
    <rect x="73" y="36" width="20" height="8" rx="3" fill="#a7f3d0" opacity="0.5" />
    <circle cx="50" cy="64" r="2.5" fill="#e2e8f0" />
    <circle cx="116" cy="64" r="2.5" fill="#e2e8f0" />
    <rect x="32" y="54" width="6" height="8" rx="1" fill="#fbbf24" />
    <rect x="126" y="54" width="6" height="8" rx="1" fill="#fbbf24" />
  </svg>,
];

const VanSVGs = [
  <svg viewBox="0 0 200 100" width="200" height="100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="15" y="38" width="170" height="40" rx="4" fill="#7c3aed" />
    <rect x="15" y="38" width="170" height="40" rx="4" fill="#7c3aed" />
    <rect x="95" y="20" width="80" height="56" rx="4" fill="#8b5cf6" />
    <path d="M95 20l-20 18h100l-20-18H95z" fill="#6d28d9" />
    <rect x="100" y="26" width="70" height="26" rx="2" fill="#a78bfa" opacity="0.4" />
    <rect x="180" y="44" width="8" height="28" rx="2" fill="#8b5cf6" />
    <circle cx="52" cy="72" r="15" fill="#1e293b" stroke="#334155" strokeWidth="2.5" />
    <circle cx="52" cy="72" r="6.5" fill="#64748b" />
    <circle cx="148" cy="72" r="15" fill="#1e293b" stroke="#334155" strokeWidth="2.5" />
    <circle cx="148" cy="72" r="6.5" fill="#64748b" />
    <circle cx="52" cy="72" r="3" fill="#e2e8f0" />
    <circle cx="148" cy="72" r="3" fill="#e2e8f0" />
    <rect x="12" y="52" width="6" height="8" rx="1" fill="#fbbf24" />
    <rect x="183" y="52" width="6" height="8" rx="1" fill="#ef4444" />
  </svg>,
  <svg viewBox="0 0 200 100" width="200" height="100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="12" y="30" width="178" height="50" rx="5" fill="#f59e0b" />
    <rect x="12" y="30" width="178" height="50" rx="5" fill="#f59e0b" />
    <rect x="100" y="12" width="82" height="66" rx="4" fill="#fbbf24" />
    <path d="M100 12l-22 18h104l-22-18H100z" fill="#d97706" />
    <rect x="106" y="18" width="70" height="30" rx="3" fill="#fde68a" opacity="0.5" />
    <rect x="185" y="42" width="8" height="32" rx="2" fill="#f59e0b" />
    <circle cx="55" cy="76" r="15" fill="#1e293b" stroke="#334155" strokeWidth="2.5" />
    <circle cx="55" cy="76" r="6.5" fill="#64748b" />
    <circle cx="150" cy="76" r="15" fill="#1e293b" stroke="#334155" strokeWidth="2.5" />
    <circle cx="150" cy="76" r="6.5" fill="#64748b" />
    <circle cx="55" cy="76" r="3" fill="#e2e8f0" />
    <circle cx="150" cy="76" r="3" fill="#e2e8f0" />
    <rect x="10" y="50" width="6" height="8" rx="1" fill="#ef4444" />
    <rect x="186" y="50" width="6" height="8" rx="1" fill="#ef4444" />
  </svg>,
  <svg viewBox="0 0 200 100" width="200" height="100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="18" y="35" width="168" height="45" rx="4" fill="#0ea5e9" />
    <rect x="92" y="16" width="84" height="62" rx="4" fill="#38bdf8" />
    <path d="M92 16l-20 20h104l-20-20H92z" fill="#0284c7" />
    <rect x="98" y="22" width="72" height="28" rx="2" fill="#bae6fd" opacity="0.4" />
    <rect x="182" y="40" width="8" height="34" rx="2" fill="#0ea5e9" />
    <circle cx="54" cy="74" r="15" fill="#1e293b" stroke="#334155" strokeWidth="2.5" />
    <circle cx="54" cy="74" r="6.5" fill="#64748b" />
    <circle cx="150" cy="74" r="15" fill="#1e293b" stroke="#334155" strokeWidth="2.5" />
    <circle cx="150" cy="74" r="6.5" fill="#64748b" />
    <circle cx="54" cy="74" r="3" fill="#e2e8f0" />
    <circle cx="150" cy="74" r="3" fill="#e2e8f0" />
    <rect x="14" y="48" width="6" height="10" rx="1" fill="#fbbf24" />
    <rect x="186" y="48" width="6" height="10" rx="1" fill="#fbbf24" />
  </svg>,
];

const PlaneSVGs = [
  <svg viewBox="0 0 200 70" width="200" height="70" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M195 47l-45-5-25-15-35-10v12l25 8v6l-15 4H75l-25-8H20l10 8-10 8h30l25-8h25l15 4v6l-25 8 35-10 45-5z" fill="#94a3b8" />
    <path d="M195 47l-45-5-25-15-35-10v12l25 8v6l-15 4H75l-25-8H20l10 8-10 8h30l25-8h25l15 4v6l-25 8 35-10 45-5z" fill="url(#planeGrad1)" opacity="0.5" />
    <path d="M120 35l-10-5v8l10-3z" fill="#64748b" />
    <line x1="90" y1="28" x2="90" y2="45" stroke="#475569" strokeWidth="1.5" />
    <line x1="75" y1="38" x2="95" y2="38" stroke="#475569" strokeWidth="1" />
    <circle cx="185" cy="47" r="3" fill="#ef4444" />
    <circle cx="178" cy="47" r="2" fill="#fbbf24" />
  </svg>,
  <svg viewBox="0 0 200 70" width="200" height="70" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 30l50 3 28 12 38 8v-10l-28-6v-5l18-3H88L58 28H15l12-6-12-6h43l30 8h28l-18 3v5l28 6v10l-38-8-28-12-50-3z" fill="#e2e8f0" />
    <path d="M10 30l50 3 28 12 38 8v-10l-28-6v-5l18-3H88L58 28H15l12-6-12-6h43l30 8h28l-18 3v5l28 6v10l-38-8-28-12-50-3z" fill="url(#planeGrad2)" opacity="0.5" />
    <path d="M88 28l8-4v8l-8-4z" fill="#94a3b8" />
    <line x1="105" y1="22" x2="105" y2="36" stroke="#64748b" strokeWidth="1.5" />
    <line x1="120" y1="30" x2="100" y2="30" stroke="#64748b" strokeWidth="1" />
    <circle cx="18" cy="30" r="3" fill="#ef4444" />
    <circle cx="25" cy="30" r="2" fill="#fbbf24" />
  </svg>,
  <svg viewBox="0 0 200 70" width="200" height="70" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 42l55 2 30 14 42 6v-12l-30-5v-6l20-2H95L60 38H18l14-8-14-8h42l32 10h30l-20 2v6l30 5v12l-42-6-30-14-55-2z" fill="#cbd5e1" />
    <path d="M10 42l55 2 30 14 42 6v-12l-30-5v-6l20-2H95L60 38H18l14-8-14-8h42l32 10h30l-20 2v6l30 5v12l-42-6-30-14-55-2z" fill="url(#planeGrad3)" opacity="0.4" />
    <path d="M95 38l10-6v12l-10-6z" fill="#94a3b8" />
    <line x1="115" y1="30" x2="115" y2="50" stroke="#64748b" strokeWidth="1.5" />
    <line x1="130" y1="40" x2="108" y2="40" stroke="#64748b" strokeWidth="1" />
    <circle cx="18" cy="42" r="3" fill="#ef4444" />
    <circle cx="25" cy="42" r="2" fill="#22c55e" />
  </svg>,
];

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function FleetVehicle({ type, className, svgs, animationDuration }) {
  const [currentSvg, setCurrentSvg] = useState(() => pickRandom(svgs));
  const [variant, setVariant] = useState(0);
  const sectionRef = useRef(null);
  const lastVisit = useRef(null);

  const randomizeOnVisit = useCallback(() => {
    const now = Date.now();
    if (lastVisit.current && now - lastVisit.current < 1000) return;
    lastVisit.current = now;
    setCurrentSvg(pickRandom(svgs));
    setVariant(v => v + 1);
  }, [svgs]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        randomizeOnVisit();
      }
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [randomizeOnVisit]);

  return (
    <div ref={sectionRef} className={className} style={{ animationDuration }}>
      <div className="relative" key={variant}>
        <div className="relative z-10 drop-shadow-lg">
          {currentSvg}
        </div>
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-gradient-to-r from-transparent via-current to-transparent blur-sm opacity-40" />
      </div>
    </div>
  );
}

export default function AnimatedFleet() {
  const [bikes] = useState(() => shuffleArray(BikeSVGs));
  const [cars] = useState(() => shuffleArray(CarSVGs));
  const [vans] = useState(() => shuffleArray(VanSVGs));
  const [planes] = useState(() => shuffleArray(PlaneSVGs));

  return (
    <>
      <FleetVehicle type="plane" className="vehicle-plane absolute top-12 z-10" svgs={planes} animationDuration="14s" />
      <FleetVehicle type="bike" className="vehicle-bike absolute bottom-52 z-20" svgs={bikes} animationDuration="8s" />
      <FleetVehicle type="car" className="vehicle-car absolute bottom-36 z-20" svgs={cars} animationDuration="10s" />
      <FleetVehicle type="van" className="vehicle-van absolute bottom-24 z-20" svgs={vans} animationDuration="12s" />
    </>
  );
}
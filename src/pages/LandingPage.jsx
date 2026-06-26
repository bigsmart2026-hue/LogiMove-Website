import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useThemeMode } from '../context/ThemeContext';
import { Sun, Moon, Truck, Package, BarChart3, Users, Warehouse, ShieldCheck, Zap, Bike, Car, Plane } from 'lucide-react';
import FeatureCard from '../components/FeatureCard';
import hero1 from '../assets/hero1.jpg';
import hero2 from '../assets/hero2.jpg';
import hero3 from '../assets/hero3.jpg';


const hi = [hero1, hero2, hero3];

const truckBg = 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=1200&q=80';

function useScrollPosition() {
  const [sY, setSY] = useState(0);
  useEffect(() => {
    const h = () => setSY(window.scrollY);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);
  return sY;
}

function useIntersection(o = {}) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ob = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); ob.unobserve(el); }
    }, { threshold: 0.1, ...o });
    ob.observe(el);
    return () => ob.disconnect();
  }, [o]);
  return [ref, vis];
}

function AnimatedSection({ children, className = '', delay = 0 }) {
  const [ref, v] = useIntersection();
  return (
    <div ref={ref} className={`transition-all duration-700 ease-out ${v ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: `${delay}ms` }}>
      <div className={className}>{children}</div>
    </div>
  );
}

function Counter({ end, suffix = '', duration = 2000 }) {
  const [c, setC] = useState(0);
  const [ref, v] = useIntersection();
  useEffect(() => {
    if (!v) return;
    let t;
    const a = (time) => {
      if (!t) t = time;
      const e = time - t;
      const p = Math.min(e / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setC(Math.floor(eased * end));
      if (p < 1) requestAnimationFrame(a);
    };
    requestAnimationFrame(a);
  }, [v, end, duration]);
  return <span ref={ref}>{c}{suffix}</span>;
}

const features = [
  { icon: <Truck size={32} strokeWidth={2.5} />, title: 'Real-Time Tracking', description: 'Track your packages in real-time with live GPS updates and accurate ETAs.', gradient: 'linear-gradient(137deg, #FF3D77 0%, #FFB1CE 45%, #FF9D3C 100%)' },
  { icon: <Package size={32} strokeWidth={2.5} />, title: 'Smart Booking', description: 'Multi-step booking form with instant cost calculation and multiple payment options.', gradient: 'linear-gradient(137deg, #FFFFFF 0%, #7DD3FC 45%, #06B6D4 100%)' },
  { icon: <BarChart3 size={32} strokeWidth={2.5} />, title: 'Analytics Dashboard', description: 'Comprehensive analytics with revenue charts, order stats, and performance metrics.', gradient: 'linear-gradient(137deg, #4361EE 0%, #E0AEFF 45%, #F72585 100%)' },
  { icon: <Users size={32} strokeWidth={2.5} />, title: 'Driver Management', description: 'Assign orders via drag-and-drop, track driver performance and earnings.', gradient: 'linear-gradient(137deg, #10B981 0%, #6EE7B7 45%, #FCD34D 100%)' },
  { icon: <Warehouse size={32} strokeWidth={2.5} />, title: 'Warehouse Ops', description: 'Manage warehouses, track inventory levels, and optimize storage across hubs.', gradient: 'linear-gradient(137deg, #F59E0B 0%, #FDE68A 45%, #F97316 100%)' },
  { icon: <ShieldCheck size={32} strokeWidth={2.5} />, title: 'Secure Platform', description: 'Role-based access control, simulated 2FA, and activity logging for security.', gradient: 'linear-gradient(137deg, #6366F1 0%, #C4B5FD 45%, #EC4899 100%)' },
];

const services = [
  { icon: <Bike size={32} strokeWidth={2.5} />, title: 'Bike Dispatch', description: 'Fast last-mile delivery within city limits using our bike fleet.', gradient: 'linear-gradient(137deg, #06B6D4 0%, #67E8F9 45%, #22D3EE 100%)' },
  { icon: <Car size={32} strokeWidth={2.5} />, title: 'Van Delivery', description: 'Medium-sized cargo delivery for businesses and bulk shipments.', gradient: 'linear-gradient(137deg, #F97316 0%, #FDBA74 45%, #FB923C 100%)' },
  { icon: <Truck size={32} strokeWidth={2.5} />, title: 'Truck Haulage', description: 'Heavy cargo and inter-state logistics with real-time tracking.', gradient: 'linear-gradient(137deg, #8B5CF6 0%, #DDD6FE 45%, #A855F7 100%)' },
  { icon: <Plane size={32} strokeWidth={2.5} />, title: 'Express Shipping', description: 'Priority handling with expedited delivery timelines.', gradient: 'linear-gradient(137deg, #14B8A6 0%, #99F6E4 45%, #2DD4BF 100%)' },
];

export default function LandingPage() {
  const sY = useScrollPosition();
  const nav = useNavigate();
  const { toggleTheme, mode } = useThemeMode();
  const scrolled = sY > 60;
  const isDark = mode === 'dark';
  const [hIdx, setHIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setHIdx(i => (i + 1) % hi.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="landing-page min-h-screen bg-white overflow-x-hidden">
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-white/20 backdrop-blur-xl border-b border-white/30 shadow-lg py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link to="/" className={`text-2xl font-bold tracking-tight transition-colors duration-500 flex items-center gap-1.5 ${scrolled ? 'text-red-500' : 'text-white'}`}>
            <Package size={24} /> LogiMove
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Services'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className={`text-sm font-medium transition-colors duration-300 hover:text-red-500 ${scrolled ? 'text-gray-800' : 'text-white/90'}`}>{item}</a>
            ))}
            <Link to="/about" className={`text-sm font-medium transition-colors duration-300 hover:text-red-500 ${scrolled ? 'text-gray-800' : 'text-white/90'}`}>About</Link>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl transition-all duration-300 ${scrolled ? 'text-gray-800 hover:bg-white/20' : 'text-white/80 hover:bg-white/10'}`}
              title={mode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {mode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <Link to="/login" className={`px-5 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${scrolled ? 'text-red-500 hover:bg-white/20' : 'text-white hover:bg-white/10'}`}>Sign In</Link>
            <Link to="/register" className="px-5 py-2 text-sm font-medium rounded-xl bg-white text-red-500 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">Get Started</Link>
          </div>
        </div>
      </nav>

      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          {hi.map((v, i) => (
            <img key={i} src={v} alt="" aria-hidden={i !== hIdx} className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out ${i === hIdx ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`} />
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/70 to-gray-900/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        </div>
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {hi.map((_, i) => (
            <button key={i} onClick={() => setHIdx(i)} className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${i === hIdx ? 'bg-white w-8' : 'bg-white/40 hover:bg-white/60'}`} />
          ))}
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 w-full">
          <div className="max-w-3xl">
            <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 text-sm font-medium mb-6 animate-[fadeInUp_0.6s_ease-out]">
              <Zap size={16} className="inline" /> Trusted by 500+ businesses across Nigeria
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-tight mb-6 animate-[fadeInUp_0.6s_ease-out_0.1s_both]">
              Smart Logistics<br /><span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, hsl(8, 85%, 55%), hsl(38, 92%, 50%))' }}>For Modern Business</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/70 max-w-xl mb-10 animate-[fadeInUp_0.6s_ease-out_0.2s_both]">End-to-end delivery management platform with real-time tracking, smart analytics, and seamless operations across Nigeria.</p>
            <div className="flex items-center gap-6 mt-10 animate-[fadeInUp_0.6s_ease-out_0.4s_both]">
              <div className="flex -space-x-2"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-purple-500 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">JD</div><div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-teal-500 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">SM</div><div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">AM</div><div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">+</div></div>
              <p className="text-white/60 text-sm">Trusted by <span className="text-white font-semibold">2,000+</span> delivery partners</p>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
        </div>
      </section>

      <section id="features" className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-fixed bg-center bg-cover" style={{ backgroundImage: `url(${truckBg})` }}>
          <div className={`absolute inset-0 ${isDark ? 'bg-black/60' : 'bg-white/70'}`} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <span className="text-red-500 font-semibold text-sm uppercase tracking-widest">Platform Features</span>
            <h2 className={`text-3xl sm:text-4xl font-bold mt-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Everything You Need</h2>
            <p className={`mt-4 max-w-xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>A comprehensive logistics platform with powerful tools for every aspect of your delivery operations.</p>
          </AnimatedSection>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-fixed bg-center bg-cover" style={{ backgroundImage: `url(${truckBg})` }}>
          <div className={`absolute inset-0 ${isDark ? 'bg-black/60' : 'bg-white/60'}`} />
        </div>
        <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isDark ? 'backdrop-blur-xl bg-white/5 border border-white/10' : 'backdrop-blur-xl bg-white/30 border border-white/40'} rounded-2xl py-12`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { v: 15000, s: '+', label: 'Packages Delivered' },
              { v: 500, s: '+', label: 'Active Clients' },
              { v: 200, s: '+', label: 'Fleet Vehicles' },
              { v: 98, s: '%', label: 'On-Time Delivery' },
            ].map((d, i) => (
              <AnimatedSection key={i} delay={i * 100}>
                <div>
                  <div className="text-4xl sm:text-5xl font-bold mb-2" style={{ color: isDark ? '#fff' : '#0f172a' }}><Counter end={d.v} suffix={d.s} /></div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{d.label}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section id="services" className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-fixed bg-center bg-cover" style={{ backgroundImage: `url(${truckBg})` }}>
          <div className={`absolute inset-0 ${isDark ? 'bg-black/60' : 'bg-white/70'}`} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <span className={`font-semibold text-sm uppercase tracking-widest ${isDark ? 'text-red-500' : 'text-red-600'}`}>Our Services</span>
            <h2 className={`text-3xl sm:text-4xl font-bold mt-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Delivery Solutions</h2>
            <p className={`mt-4 max-w-xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Flexible delivery options tailored to your business needs.</p>
          </AnimatedSection>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((s, i) => (
              <FeatureCard key={i} {...s} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Transform Your Logistics?</h2>
            <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">Join thousands of businesses using LogiMove to streamline their delivery operations.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <button onClick={() => nav('/register')} className="px-8 py-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-red-500/30 hover:-translate-y-0.5 transition-all duration-300">Get Started Free</button>
              <button onClick={() => nav('/login')} className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 hover:border-white/40 transition-all duration-300">Contact Sales</button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <footer className="bg-gray-950 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <span className="text-2xl font-bold text-white flex items-center gap-1.5"><Package size={24} /> LogiMove</span>
              <p className="mt-4 text-sm leading-relaxed">Smart logistics platform for modern businesses. Real-time tracking, analytics, and seamless delivery management.</p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Integrations', 'API'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press'] },
              { title: 'Support', links: ['Help Center', 'Contact', 'Privacy', 'Terms'] },
            ].map(c => (
              <div key={c.title}>
                <h4 className="text-white font-semibold mb-4">{c.title}</h4>
                <ul className="space-y-2">{c.links.map((l, i) => <li key={i} className="text-sm hover:text-white transition-colors cursor-pointer">{l}</li>)}</ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm">© 2026 LogiMove. All rights reserved.</p>
            <div className="flex gap-4 text-sm"><span className="hover:text-white transition-colors cursor-pointer">Nigeria</span><span className="hover:text-white transition-colors cursor-pointer">Terms</span><span className="hover:text-white transition-colors cursor-pointer">Privacy</span></div>
          </div>
        </div>
      </footer>
    </div>
  );
}

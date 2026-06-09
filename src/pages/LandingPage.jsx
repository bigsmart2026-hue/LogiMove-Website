import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import hero1 from '../assets/hero1.jpg';
import hero2 from '../assets/hero2.jpg';
import hero3 from '../assets/hero3.jpg';

const heroImages = [hero1, hero2, hero3];

function useScrollPosition() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return scrollY;
}

function useIntersection(options = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setIsVisible(true); observer.unobserve(el); }
    }, { threshold: 0.1, ...options });
    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);
  return [ref, isVisible];
}

function AnimatedSection({ children, className = '', delay = 0 }) {
  const [ref, visible] = useIntersection();
  return (
    <div ref={ref} className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: `${delay}ms` }}>
      <div className={className}>{children}</div>
    </div>
  );
}

function Counter({ end, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const [ref, visible] = useIntersection();
  useEffect(() => {
    if (!visible) return;
    let startTime;
    const animate = (time) => {
      if (!startTime) startTime = time;
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [visible, end, duration]);
  return <span ref={ref}>{count}{suffix}</span>;
}

const features = [
  { icon: '🚚', title: 'Real-Time Tracking', desc: 'Track your packages in real-time with live GPS updates and accurate ETAs.' },
  { icon: '📦', title: 'Smart Booking', desc: 'Multi-step booking form with instant cost calculation and multiple payment options.' },
  { icon: '📊', title: 'Analytics Dashboard', desc: 'Comprehensive analytics with revenue charts, order stats, and performance metrics.' },
  { icon: '👥', title: 'Driver Management', desc: 'Assign orders via drag-and-drop, track driver performance and earnings.' },
  { icon: '🏭', title: 'Warehouse Ops', desc: 'Manage warehouses, track inventory levels, and optimize storage across hubs.' },
  { icon: '🔒', title: 'Secure Platform', desc: 'Role-based access control, simulated 2FA, and activity logging for security.' },
];

const services = [
  { icon: '🛵', title: 'Bike Dispatch', desc: 'Fast last-mile delivery within city limits using our bike fleet.' },
  { icon: '🚐', title: 'Van Delivery', desc: 'Medium-sized cargo delivery for businesses and bulk shipments.' },
  { icon: '🚛', title: 'Truck Haulage', desc: 'Heavy cargo and inter-state logistics with real-time tracking.' },
  { icon: '✈️', title: 'Express Shipping', desc: 'Priority handling with expedited delivery timelines.' },
];

export default function LandingPage() {
  const scrollY = useScrollPosition();
  const navigate = useNavigate();
  const isScrolled = scrollY > 60;
  const [heroIdx, setHeroIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setHeroIdx(i => (i + 1) % heroImages.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link to="/" className={`text-2xl font-bold tracking-tight transition-colors duration-500 ${isScrolled ? 'text-blue-600' : 'text-white'}`}>
            <span className="text-3xl">📦</span> LogiMove
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Services'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className={`text-sm font-medium transition-colors duration-300 hover:text-blue-400 ${isScrolled ? 'text-gray-700' : 'text-white/90'}`}>{item}</a>
            ))}
            <Link to="/about" className={`text-sm font-medium transition-colors duration-300 hover:text-blue-400 ${isScrolled ? 'text-gray-700' : 'text-white/90'}`}>About</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className={`px-5 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${isScrolled ? 'text-blue-600 hover:bg-blue-50' : 'text-white hover:bg-white/10'}`}>Sign In</Link>
            <Link to="/register" className="px-5 py-2 text-sm font-medium rounded-xl bg-white text-blue-600 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          {heroImages.map((img, i) => (
            <img key={i} src={img} alt="" aria-hidden={i !== heroIdx} className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out ${i === heroIdx ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`} />
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/70 to-gray-900/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        </div>
        {/* Image indicators */}
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {heroImages.map((_, i) => (
            <button key={i} onClick={() => setHeroIdx(i)} className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${i === heroIdx ? 'bg-white w-8' : 'bg-white/40 hover:bg-white/60'}`} />
          ))}
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 w-full">
          <div className="max-w-3xl">
            <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 text-sm font-medium mb-6 animate-[fadeInUp_0.6s_ease-out]">
              ⚡ Trusted by 500+ businesses across Nigeria
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-tight mb-6 animate-[fadeInUp_0.6s_ease-out_0.1s_both]">
              Smart Logistics
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">For Modern Business</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/70 max-w-xl mb-10 animate-[fadeInUp_0.6s_ease-out_0.2s_both]">
              End-to-end delivery management platform with real-time tracking, 
              smart analytics, and seamless operations across Nigeria.
            </p>
            <div className="flex flex-wrap gap-4 animate-[fadeInUp_0.6s_ease-out_0.3s_both]">
              <button onClick={() => navigate('/register')} className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-2xl shadow-blue-600/30 hover:shadow-blue-600/50 hover:-translate-y-0.5 transition-all duration-300 text-lg">
                Start Free Trial
              </button>
              {/* <button onClick={() => navigate('/login')} className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 hover:border-white/40 transition-all duration-300 text-lg">
                Watch Demo →
              </button> */}
            </div>
            <div className="flex items-center gap-6 mt-10 animate-[fadeInUp_0.6s_ease-out_0.4s_both]">
              <div className="flex -space-x-2"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">JD</div><div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-teal-500 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">SM</div><div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">AM</div><div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">+</div></div>
              <p className="text-white/60 text-sm">Trusted by <span className="text-white font-semibold">2,000+</span> delivery partners</p>
            </div>
          </div>
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Platform Features</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-3">Everything You Need</h2>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto">A comprehensive logistics platform with powerful tools for every aspect of your delivery operations.</p>
          </AnimatedSection>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <AnimatedSection key={i} delay={i * 100}>
                <div className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl border border-gray-100 hover:border-blue-100 transition-all duration-500 hover:-translate-y-1">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform duration-500">{f.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"><div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" /><div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-400 rounded-full blur-3xl" /></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: 15000, suffix: '+', label: 'Packages Delivered' },
              { value: 500, suffix: '+', label: 'Active Clients' },
              { value: 200, suffix: '+', label: 'Fleet Vehicles' },
              { value: 98, suffix: '%', label: 'On-Time Delivery' },
            ].map((stat, i) => (
              <AnimatedSection key={i} delay={i * 100}>
                <div className="text-white">
                  <div className="text-4xl sm:text-5xl font-bold mb-2"><Counter end={stat.value} suffix={stat.suffix} /></div>
                  <p className="text-blue-200 text-sm font-medium">{stat.label}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Our Services</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-3">Delivery Solutions</h2>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto">Flexible delivery options tailored to your business needs.</p>
          </AnimatedSection>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((s, i) => (
              <AnimatedSection key={i} delay={i * 100}>
                <div className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl border border-gray-100 hover:border-blue-100 transition-all duration-500 text-center">
                  <div className="text-5xl mb-5 group-hover:scale-125 transition-transform duration-500 inline-block">{s.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"><div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl" /><div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500 rounded-full blur-3xl" /></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Transform Your Logistics?</h2>
            <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">Join thousands of businesses using LogiMove to streamline their delivery operations.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <button onClick={() => navigate('/register')} className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-blue-600/30 hover:-translate-y-0.5 transition-all duration-300">Get Started Free</button>
              <button onClick={() => navigate('/login')} className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 hover:border-white/40 transition-all duration-300">Contact Sales</button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <span className="text-2xl font-bold text-white">📦 LogiMove</span>
              <p className="mt-4 text-sm leading-relaxed">Smart logistics platform for modern businesses. Real-time tracking, analytics, and seamless delivery management.</p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Integrations', 'API'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press'] },
              { title: 'Support', links: ['Help Center', 'Contact', 'Privacy', 'Terms'] },
            ].map(col => (
              <div key={col.title}>
                <h4 className="text-white font-semibold mb-4">{col.title}</h4>
                <ul className="space-y-2"><li className="text-sm hover:text-white transition-colors cursor-pointer">{col.links[0]}</li><li className="text-sm hover:text-white transition-colors cursor-pointer">{col.links[1]}</li><li className="text-sm hover:text-white transition-colors cursor-pointer">{col.links[2]}</li><li className="text-sm hover:text-white transition-colors cursor-pointer">{col.links[3]}</li></ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm">© 2026 LogiMove. All rights reserved.</p>
            <div className="flex gap-4 text-sm"><span className="hover:text-white transition-colors cursor-pointer">🇳🇬 Nigeria</span><span className="hover:text-white transition-colors cursor-pointer">Terms</span><span className="hover:text-white transition-colors cursor-pointer">Privacy</span></div>
          </div>
        </div>
      </footer>
    </div>
  );
}

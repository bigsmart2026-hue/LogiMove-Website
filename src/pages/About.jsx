import { Link } from 'react-router-dom';
import { useThemeMode } from '../context/ThemeContext';
import { Zap, Shield, Handshake, Lightbulb } from 'lucide-react';

const truckBg = 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=1200&q=80';

const milestones = [
  { year: '2020', title: 'Founded', desc: 'LogiMove Logistics was established with a vision to revolutionize delivery services in Nigeria.' },
  { year: '2021', title: '500 Deliveries', desc: 'Reached 500 successful deliveries with a growing fleet of bikes and vans.' },
  { year: '2022', title: 'Expansion', desc: 'Expanded operations to 5 major cities and launched our real-time tracking platform.' },
  { year: '2023', title: 'Enterprise', desc: 'Partnered with 50+ enterprise clients and introduced warehouse management solutions.' },
  { year: '2024', title: '10,000+ Milestone', desc: 'Crossed 10,000 deliveries and launched driver portal with automated assignment.' },
  { year: '2025', title: 'Full Platform', desc: 'Launched comprehensive logistics platform with analytics, fleet management, and API.' },
];

const team = [
  { name: 'Big S-code', role: 'CEO & Founder', initials: 'CO' },
  { name: 'Emmanuel Noyerem', role: 'CTO', initials: 'AB' },
  { name: 'Jane Nwadike', role: 'Head of Operations', initials: 'FA' },
  { name: 'Abuoma David', role: 'VP of Engineering', initials: 'NE' },
];

const values = [
  { icon: Zap, title: 'Speed', desc: 'We deliver fast without compromising quality.' },
  { icon: Shield, title: 'Reliability', desc: 'Every package tracked, every promise kept.' },
  { icon: Handshake, title: 'Trust', desc: 'Built on transparent communication and integrity.' },
  { icon: Lightbulb, title: 'Innovation', desc: 'Leveraging technology to solve real logistics challenges.' },
];

export default function About() {
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-red-600 via-red-700 to-red-800 py-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">About LogiMove Logistics</h1>
          <p className="text-xl text-red-200 max-w-2xl mx-auto">
            We're on a mission to make logistics seamless, transparent, and efficient for businesses across Africa.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-fixed bg-center bg-cover" style={{ backgroundImage: `url(${truckBg})` }}>
          <div className={`absolute inset-0 ${isDark ? 'bg-black/60' : 'bg-white/70'}`} />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12">
          <div>
            <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Our Mission</h2>
            <p className={`leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              To empower businesses with a smart, reliable, and real-time logistics platform that simplifies delivery 
              operations, reduces costs, and builds trust through transparency. We believe every package tells a 
              story, and we're committed to delivering each one with care.
            </p>
          </div>
          <div>
            <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Our Vision</h2>
            <p className={`leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              To become Africa's most trusted logistics technology platform — connecting businesses, drivers, and 
              customers through innovation, efficiency, and a relentless focus on the delivery experience.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-fixed bg-center bg-cover" style={{ backgroundImage: `url(${truckBg})` }}>
          <div className={`absolute inset-0 ${isDark ? 'bg-black/60' : 'bg-white/70'}`} />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className={`text-3xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Our Core Values</h2>
            <p className={`max-w-xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>The principles that guide everything we do.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <div key={i} className={`rounded-2xl p-8 text-center shadow-sm border ${isDark ? 'bg-white/10 border-white/10 backdrop-blur-sm' : 'bg-white border-gray-100'} hover:shadow-lg transition-shadow`}>
                <div className="mb-4 flex justify-center">{(() => { const Icon = v.icon; return <Icon size={36} className="text-red-500" />; })()}</div>
                <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{v.title}</h3>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story / Milestones */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-fixed bg-center bg-cover" style={{ backgroundImage: `url(${truckBg})` }}>
          <div className={`absolute inset-0 ${isDark ? 'bg-black/60' : 'bg-white/70'}`} />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className={`text-3xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Our Journey</h2>
            <p className={`max-w-xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>From a bold idea to a platform powering thousands of deliveries.</p>
          </div>
          <div className="space-y-8">
            {milestones.map((m, i) => (
              <div key={i} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-sm">
                  {m.year}
                </div>
                <div className={`flex-1 rounded-xl p-5 shadow-sm border ${isDark ? 'bg-white/10 border-white/10 backdrop-blur-sm' : 'bg-white border-gray-100'}`}>
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{m.title}</h3>
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-fixed bg-center bg-cover" style={{ backgroundImage: `url(${truckBg})` }}>
          <div className={`absolute inset-0 ${isDark ? 'bg-black/60' : 'bg-white/70'}`} />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className={`text-3xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Leadership Team</h2>
            <p className={`max-w-xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Experienced professionals driving innovation in logistics.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((t, i) => (
              <div key={i} className={`rounded-2xl p-6 text-center shadow-sm border ${isDark ? 'bg-white/10 border-white/10 backdrop-blur-sm' : 'bg-white border-gray-100'}`}>
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {t.initials}
                </div>
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t.name}</h3>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-fixed bg-center bg-cover" style={{ backgroundImage: `url(${truckBg})` }}>
          <div className={`absolute inset-0 ${isDark ? 'bg-black/60' : 'bg-white/70'}`} />
        </div>
        <div className={`relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center ${isDark ? 'backdrop-blur-xl bg-white/5 border border-white/10' : 'backdrop-blur-xl bg-white/30 border border-white/40'} rounded-2xl py-12`}>
          <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Ready to Work With Us?</h2>
          <p className={`mb-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Join hundreds of businesses that trust LogiMove for their logistics needs.</p>
          <div className="flex justify-center gap-4">
            <Link to="/register" className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all">Get Started</Link>
            <Link to="/contact" className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all">Contact Us</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">© 2026 LogiMove Logistics. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

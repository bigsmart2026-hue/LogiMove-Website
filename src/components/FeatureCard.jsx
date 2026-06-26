import { motion } from 'motion/react';
import { useThemeMode } from '../context/ThemeContext';

export default function FeatureCard({ title, description, icon, gradient, delay = 0 }) {
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const interior = isDark ? '#27272A' : '#FFFFFF';
  const titleColor = isDark ? 'text-white' : 'text-gray-900';
  const descColor = isDark ? 'text-gray-300' : 'text-gray-500';
  const iconBg = isDark ? 'bg-white/10' : 'bg-black/5';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.8, ease: 'easeOut', delay }}
      className="relative flex flex-col items-center"
    >
      <div
        className="absolute w-full h-[160px] md:h-[200px] opacity-60 rounded-[32px] pointer-events-none"
        style={{ background: gradient, filter: 'blur(45px)' }}
      />
      <div
        className="relative self-stretch h-[160px] md:h-[200px] rounded-[32px] z-10 overflow-hidden"
        style={{
          border: '4px solid transparent',
          background: `linear-gradient(${interior}, ${interior}) padding-box, ${gradient} border-box`,
        }}
      >
        <div className="w-full h-full p-4 flex flex-col justify-between">
          <div className={`${iconBg} backdrop-blur-sm flex items-center justify-center w-9 h-9 rounded-xl`}>
            {icon}
          </div>
          <div>
            <h3 className={`${titleColor} font-medium text-base mb-0.5 tracking-tight`}>{title}</h3>
            <p className={`${descColor} text-xs leading-[1.5] font-normal`}>
              {description}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

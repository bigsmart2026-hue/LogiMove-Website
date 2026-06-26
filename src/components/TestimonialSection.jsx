import { useState, useEffect, useRef } from 'react';
import { Quote } from 'lucide-react';
import { AnimatedWrapper } from '../hooks/useInViewAnimation';

export default function TestimonialSection() {
  const [offsetY, setOffsetY] = useState(0);
  const sectionRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!imageRef.current || !sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      if (rect.top < windowHeight && rect.bottom > 0) {
        const scrollProgress = (windowHeight - rect.top) / (windowHeight + rect.height);
        const maxOffset = 200;
        setOffsetY(scrollProgress * maxOffset);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const companies = [
    { name: 'Apple', width: 80 },
    { name: 'IDEO', width: 83 },
    { name: 'Polygon', width: 110 },
  ];

  return (
    <section ref={sectionRef} className="py-12 px-6">
      <div className="max-w-2xl mx-auto text-center">
        <AnimatedWrapper delay={0.1}>
          <Quote size={24} className="text-slate-900 mx-auto mb-4" />
        </AnimatedWrapper>

        <AnimatedWrapper delay={0.2}>
          <h2
            className="text-[32px] md:text-[40px] lg:text-[44px] leading-[1.1] text-[#0D212C] tracking-tight"
          >
            I left{' '}
            <span style={{ fontFamily: "'PP Mondwest', Georgia, serif" }}>
              Apple
            </span>{' '}
            to build the studio I always wanted to work with
          </h2>
        </AnimatedWrapper>

        <AnimatedWrapper delay={0.3}>
          <p className="text-sm italic text-[#273C46] mt-4">
            Viktor Oddy
          </p>
        </AnimatedWrapper>

        <AnimatedWrapper delay={0.4}>
          <div className="flex items-center justify-center gap-8 mt-6">
            {companies.map((c) => (
              <span
                key={c.name}
                style={{ width: c.width }}
                className="text-2xl font-medium text-slate-900"
              >
                {c.name}
              </span>
            ))}
          </div>
        </AnimatedWrapper>

        <AnimatedWrapper delay={0.5}>
          <div className="mt-8 flex justify-center overflow-hidden rounded-2xl" style={{ height: 400 }}>
            <img
              ref={imageRef}
              src="https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260330_103804_7aa5494f-4d5b-432e-9dc7-20715275f143.png&w=1280&q=85"
              alt="Chris Halaska"
              className="w-full max-w-xs rounded-2xl shadow-lg object-cover"
              style={{ transform: `translateY(${offsetY}px)` }}
            />
          </div>
        </AnimatedWrapper>
      </div>
    </section>
  );
}

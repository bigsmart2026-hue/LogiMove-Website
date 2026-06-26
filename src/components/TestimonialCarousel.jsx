import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { AnimatedWrapper } from '../hooks/useInViewAnimation';

const testimonials = [
  {
    name: 'Marcus Anderson',
    role: 'CEO, Data.storage',
    text: 'With very little guidance team delivered designs that were consistently spot on. They understood our vision from day one and brought ideas we hadn\'t even considered.',
    avatar: 'https://images.pexels.com/photos/874158/pexels-photo-874158.jpeg',
  },
  {
    name: 'Alex Wu',
    role: 'Founder, Nexgate',
    text: 'Viktor led the creation of our best fundraising deck to date! The narrative flow and visual storytelling made all the difference in our Series A round.',
    avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg',
  },
  {
    name: 'James Mitchell',
    role: 'VP Product, LaunchPad',
    text: 'Working with Viktor transformed our product vision. The team brought clarity to complexity and delivered an experience that our users genuinely love.',
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg',
  },
  {
    name: 'Rachel Foster',
    role: 'Co-founder, Nexus Labs',
    text: 'The design quality exceeded our expectations. Every pixel felt intentional. Our investors commented on how polished and professional everything looked.',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
  },
  {
    name: 'David Zhang',
    role: 'Head of Design, Paradigm Labs',
    text: 'Incredible work from start to finish. Viktor\'s team operates with a level of craft and speed that is rare to find. They set a new bar for our design partners.',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
  },
];

export default function TestimonialCarousel() {
  const [current, setCurrent] = useState(5);
  const [isPaused, setIsPaused] = useState(false);
  const [disableTransition, setDisableTransition] = useState(false);
  const [cardWidth, setCardWidth] = useState(427.5);
  const cardRef = useRef(null);
  const trackRef = useRef(null);

  const total = testimonials.length;
  const items = [...testimonials, ...testimonials, ...testimonials];
  const gap = 24;

  useEffect(() => {
    const updateWidth = () => {
      if (cardRef.current) {
        setCardWidth(cardRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const goTo = useCallback((index) => {
    setCurrent(index);
  }, []);

  const handleNext = useCallback(() => {
    setCurrent((prev) => prev + 1);
  }, []);

  const handlePrev = useCallback(() => {
    setCurrent((prev) => prev - 1);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(handleNext, 3000);
    return () => clearInterval(timer);
  }, [isPaused, handleNext]);

  useEffect(() => {
    if (current >= total * 2) {
      setDisableTransition(true);
      requestAnimationFrame(() => {
        setCurrent(total);
        requestAnimationFrame(() => {
          setDisableTransition(false);
        });
      });
    } else if (current < total) {
      setDisableTransition(true);
      requestAnimationFrame(() => {
        setCurrent(total * 2 - 1);
        requestAnimationFrame(() => {
          setDisableTransition(false);
        });
      });
    }
  }, [current, total]);

  const step = cardWidth + gap;
  const transform = `translateX(-${(current) * step}px)`;

  return (
    <section className="w-full py-20 px-6">
      <div className="md:max-w-4xl md:ml-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <AnimatedWrapper delay={0.1}>
            <h2 className="text-[32px] md:text-[40px] lg:text-[44px] leading-[1.1] text-[#0D212C] tracking-tight">
              What{' '}
              <span
                style={{ fontFamily: "'PP Mondwest', Georgia, serif" }}
              >
                builders
              </span>{' '}
              say
            </h2>
          </AnimatedWrapper>
          <AnimatedWrapper delay={0.2}>
            <div className="flex items-center gap-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  className="fill-black text-black"
                />
              ))}
              <span className="text-sm font-medium text-[#0D212C] ml-1">
                Clutch 5/5
              </span>
            </div>
          </AnimatedWrapper>
        </div>

        {/* Carousel */}
        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="overflow-hidden">
            <div
              ref={trackRef}
              className="flex"
              style={{
                transform,
                transition: disableTransition
                  ? 'none'
                  : 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {items.map((t, i) => (
                <div
                  key={i}
                  ref={i === 5 ? cardRef : null}
                  className="flex-shrink-0 w-[calc(100vw-48px)] md:w-[427.5px] mx-3"
                >
                  <div
                    className="bg-white rounded-[32px] md:rounded-[40px] h-full px-6 md:pl-10 md:pr-24 py-8"
                    style={{
                      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    }}
                  >
                    {/* Quote icon */}
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="mb-4"
                    >
                      <path
                        d="M3 21c3 0 6-2 6-7V9H3v7h3c0 2-1 3-3 3v2zm12 0c3 0 6-2 6-7V9h-6v7h3c0 2-1 3-3 3v2z"
                        fill="#0D212C"
                        opacity="0.3"
                      />
                    </svg>

                    <p
                      className="text-base leading-relaxed mb-6"
                      style={{ color: '#0D212C' }}
                    >
                      {t.text}
                    </p>

                    <div className="flex items-center gap-3">
                      <img
                        src={t.avatar}
                        alt={t.name}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      />
                      <div>
                        <p className="text-sm font-semibold text-[#051A24]">
                          {t.name}
                        </p>
                        <p className="text-xs text-[#273C46]">
                          → {t.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prev/Next buttons */}
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 rounded-full border border-[#0D212C]/20 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
          >
            <ChevronLeft size={20} className="text-[#0D212C]" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 rounded-full border border-[#0D212C]/20 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
          >
            <ChevronRight size={20} className="text-[#0D212C]" />
          </button>
        </div>
      </div>
    </section>
  );
}

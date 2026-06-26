import { useState, useEffect, useRef, createElement } from 'react';

export function useInViewAnimation(options = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, ...options }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, isVisible];
}

export function AnimatedWrapper({ children, delay = 0, className = '' }) {
  const [ref, isVisible] = useInViewAnimation();
  return createElement(
    'div',
    {
      ref,
      style: {
        transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
        transitionDelay: `${delay}s`,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
      },
      className,
    },
    children
  );
}

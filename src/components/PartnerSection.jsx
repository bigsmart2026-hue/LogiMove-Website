import { useRef, useCallback } from 'react';
import { AnimatedWrapper } from '../hooks/useInViewAnimation';

const gifThumbnails = [
  'https://motionsites.ai/assets/hero-space-voyage-preview-eECLH3Yc.gif',
  'https://motionsites.ai/assets/hero-portfolio-cosmic-preview-BpvWJ3Nc.gif',
  'https://motionsites.ai/assets/hero-velorah-preview-CJNTtbpd.gif',
  'https://motionsites.ai/assets/hero-asme-preview-B_nGDnTP.gif',
  'https://motionsites.ai/assets/hero-transform-data-preview-Cx5OU29N.gif',
  'https://motionsites.ai/assets/hero-aethera-preview-DknSlcTa.gif',
  'https://motionsites.ai/assets/hero-orbit-web3-preview-BXt4OttD.gif',
  'https://motionsites.ai/assets/hero-nexora-preview-cx5HmUgo.gif',
];

export default function PartnerSection() {
  const containerRef = useRef(null);
  const lastSpawn = useRef(0);
  const spawnsRef = useRef([]);

  const spawnGif = useCallback((x, y) => {
    const now = Date.now();
    if (now - lastSpawn.current < 80) return;
    lastSpawn.current = now;

    const container = containerRef.current;
    if (!container) return;

    const gif = document.createElement('img');
    const src = gifThumbnails[Math.floor(Math.random() * gifThumbnails.length)];
    gif.src = src;
    gif.alt = '';

    const rotation = Math.random() * 20 - 10;
    const size = 60 + Math.random() * 60;

    gif.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      object-fit: cover;
      border-radius: 12px;
      pointer-events: none;
      transform: rotate(${rotation}deg) scale(1);
      opacity: 1;
      transition: all 1s ease-out;
      z-index: 10;
    `;

    container.appendChild(gif);

    requestAnimationFrame(() => {
      gif.style.opacity = '0';
      gif.style.transform = `rotate(${rotation}deg) scale(0.5)`;
    });

    setTimeout(() => {
      if (gif.parentNode) {
        gif.parentNode.removeChild(gif);
      }
    }, 1000);
  }, []);

  const handleMouseMove = useCallback(
    (e) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left - 30;
      const y = e.clientY - rect.top - 30;
      spawnGif(x, y);
    },
    [spawnGif]
  );

  const handleMouseLeave = useCallback(() => {
    lastSpawn.current = 0;
  }, []);

  return (
    <section className="w-full py-12 px-6">
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative max-w-7xl mx-auto py-48 rounded-[40px] overflow-hidden"
        style={{
          backgroundColor: 'white',
          boxShadow: '0 4px 30px rgba(0,0,0,0.06)',
        }}
      >
        <div className="relative z-20 flex flex-col items-center">
          <AnimatedWrapper delay={0.1}>
            <h2
              className="text-[48px] md:text-[64px] lg:text-[80px] text-[#0D212C] mb-12 text-center leading-none"
              style={{ fontFamily: "'PP Mondwest', Georgia, serif" }}
            >
              Partner with us
            </h2>
          </AnimatedWrapper>

          <AnimatedWrapper delay={0.2}>
            <a
              href="https://halaskastudio.com/./book"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full text-white text-sm font-medium no-underline"
              style={{
                backgroundColor: '#051A24',
                boxShadow: [
                  '0 1px 2px 0 rgba(5,26,36,0.1)',
                  '0 4px 4px 0 rgba(5,26,36,0.09)',
                  '0 9px 6px 0 rgba(5,26,36,0.05)',
                  '0 17px 7px 0 rgba(5,26,36,0.01)',
                  '0 26px 7px 0 rgba(5,26,36,0)',
                  'inset 0 2px 8px 0 rgba(255,255,255,0.5)',
                ].join(', '),
              }}
            >
              <img
                src="https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg"
                alt=""
                className="w-10 h-10 rounded-full object-cover"
              />
              Start chat with Viktor
            </a>
          </AnimatedWrapper>
        </div>
      </div>
    </section>
  );
}

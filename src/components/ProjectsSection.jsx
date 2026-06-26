import { useState, useEffect, useRef } from 'react';

function ProjectItem({ name, description, image, index }) {
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
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
        transitionDelay: `${0.1 + index * 0.1}s`,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
      }}
    >
      <div className="ml-20 md:ml-28 mb-4">
        <h3
          className="text-2xl md:text-3xl font-semibold text-[#051A24]"
          style={{ fontFamily: "'PP Mondwest', Georgia, serif" }}
        >
          {name}
        </h3>
        <p
          className="text-sm md:text-base mt-1"
          style={{ color: 'rgba(5,26,36,0.7)' }}
        >
          {description}
        </p>
      </div>
      <img
        src={image}
        alt={name}
        className="w-full rounded-2xl shadow-lg object-cover"
      />
    </div>
  );
}

const projects = [
  {
    name: 'evr',
    description: 'From idea to millions raised for a web3 AI product',
    image:
      'https://motionsites.ai/assets/hero-evr-ventures-preview-DZxeVFEX.gif',
  },
  {
    name: 'Automation Machines',
    description: 'Streamlining industrial automation processes',
    image:
      'https://motionsites.ai/assets/hero-automation-machines-preview-DlTveRIN.gif',
  },
  {
    name: 'xPortfolio',
    description: 'Modern portfolio management platform',
    image:
      'https://motionsites.ai/assets/hero-xportfolio-preview-D4A8maiC.gif',
  },
];

export default function ProjectsSection() {
  return (
    <section className="max-w-[1200px] mx-auto px-6 py-12">
      <div className="flex flex-col gap-16 md:gap-20">
        {projects.map((p, i) => (
          <ProjectItem key={p.name} {...p} index={i} />
        ))}
      </div>
    </section>
  );
}

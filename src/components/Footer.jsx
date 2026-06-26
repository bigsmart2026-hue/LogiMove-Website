import { ArrowUpRight } from 'lucide-react';
import Button from './Button';

const links = {
  column1: [
    { label: 'Services', href: '#services' },
    { label: 'Work', href: '#work' },
    { label: 'About', href: '#about' },
  ],
  column2: [
    { label: 'x.com', href: 'https://x.com', external: true },
    { label: 'LinkedIn', href: 'https://linkedin.com', external: true },
  ],
};

export default function Footer() {
  return (
    <footer className="w-full py-12 px-6">
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-start justify-between gap-8">
        {/* Left */}
        <Button
          variant="primary"
          onClick={() =>
            window.open('https://halaskastudio.com/./book', '_blank')
          }
        >
          Start a chat
        </Button>

        {/* Right */}
        <div className="flex items-start gap-12">
          <ArrowUpRight
            size={20}
            className="text-[#051A24] mt-1 flex-shrink-0"
          />

          {/* Column 1 */}
          <div className="flex flex-col gap-3">
            {links.column1.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-base text-[#051A24] hover:opacity-70 transition-opacity no-underline"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-3">
            {links.column2.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                className="text-base text-[#051A24] hover:opacity-70 transition-opacity no-underline"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

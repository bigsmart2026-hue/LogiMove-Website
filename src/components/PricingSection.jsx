import { AnimatedWrapper } from '../hooks/useInViewAnimation';
import Button from './Button';

export default function PricingSection() {
  return (
    <section className="w-full py-12 px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:max-w-4xl md:ml-auto">
        {/* Card 1 - Dark */}
        <AnimatedWrapper delay={0.1}>
          <div
            className="rounded-[40px] pl-10 pr-10 md:pr-24 pt-3 pb-10"
            style={{
              backgroundColor: '#051A24',
              boxShadow: 'inset 0 2px 8px 0 rgba(255,255,255,0.08)',
            }}
          >
            <h3
              className="text-[22px] font-medium mb-2"
              style={{ color: '#F6FCFF' }}
            >
              Monthly Partnership
            </h3>
            <p
              className="text-sm leading-relaxed mb-6"
              style={{ color: '#E0EBF0' }}
            >
              A dedicated creative design team.
              <br />
              You work directly with Viktor.
            </p>
            <div className="mb-6">
              <span
                className="text-2xl font-semibold"
                style={{ color: '#F6FCFF' }}
              >
                $5,000
              </span>
              <p className="text-sm mt-1" style={{ color: '#E0EBF0' }}>
                Monthly
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                onClick={() =>
                  window.open(
                    'https://halaskastudio.com/./book',
                    '_blank'
                  )
                }
              >
                Start a chat
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  window.open(
                    'https://halaskastudio.com/./book',
                    '_blank'
                  )
                }
              >
                How it works
              </Button>
            </div>
          </div>
        </AnimatedWrapper>

        {/* Card 2 - Light */}
        <AnimatedWrapper delay={0.2}>
          <div
            className="rounded-[40px] pl-10 pr-10 md:pr-24 pt-3 pb-10"
            style={{
              backgroundColor: 'white',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            }}
          >
            <h3 className="text-[22px] font-medium mb-2 text-[#0D212C]">
              Custom Project
            </h3>
            <p className="text-sm leading-relaxed mb-6 text-[#273C46]">
              Fixed scope, fixed timeline.
              <br />
              Same team, same standards.
            </p>
            <div className="mb-6">
              <span className="text-2xl font-semibold text-[#0D212C]">
                $5,000
              </span>
              <p className="text-sm mt-1 text-[#273C46]">Minimum</p>
            </div>
            <Button
              variant="tertiary"
              onClick={() =>
                window.open(
                  'https://halaskastudio.com/./book',
                  '_blank'
                )
              }
            >
              Start a chat
            </Button>
          </div>
        </AnimatedWrapper>
      </div>
    </section>
  );
}

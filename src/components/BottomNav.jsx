import Button from './Button';

export default function BottomNav() {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div
        className="flex items-center gap-4 px-8 py-2 rounded-full"
        style={{
          backgroundColor: 'white',
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
        <span
          className="text-2xl font-semibold text-[#051A24]"
          style={{ fontFamily: "'PP Mondwest', Georgia, serif" }}
        >
          V
        </span>
        <Button
          variant="primary"
          onClick={() =>
            window.open('https://halaskastudio.com/./book', '_blank')
          }
        >
          Start a chat
        </Button>
      </div>
    </div>
  );
}

const variantStyles = {
  primary: {
    backgroundColor: '#051A24',
    color: 'white',
    borderRadius: '9999px',
    padding: '12px 28px',
    fontSize: '14px',
    fontWeight: 500,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: [
      '0 1px 2px 0 rgba(5,26,36,0.1)',
      '0 4px 4px 0 rgba(5,26,36,0.09)',
      '0 9px 6px 0 rgba(5,26,36,0.05)',
      '0 17px 7px 0 rgba(5,26,36,0.01)',
      '0 26px 7px 0 rgba(5,26,36,0)',
      'inset 0 2px 8px 0 rgba(255,255,255,0.5)',
    ].join(', '),
  },
  secondary: {
    backgroundColor: 'white',
    color: '#051A24',
    borderRadius: '9999px',
    padding: '12px 28px',
    fontSize: '14px',
    fontWeight: 500,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: '0 0 0 0.5px rgba(0,0,0,0.05), 0 4px 30px rgba(0,0,0,0.08)',
  },
  tertiary: {
    backgroundColor: 'white',
    color: '#0D212C',
    borderRadius: '9999px',
    padding: '12px 28px',
    fontSize: '14px',
    fontWeight: 500,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: [
      '0 1px 2px 0 rgba(5,26,36,0.1)',
      '0 4px 4px 0 rgba(5,26,36,0.09)',
      '0 9px 6px 0 rgba(5,26,36,0.05)',
      '0 17px 7px 0 rgba(5,26,36,0.01)',
      '0 26px 7px 0 rgba(5,26,36,0)',
      'inset 0 2px 8px 0 rgba(255,255,255,0.5)',
    ].join(', '),
  },
};

export default function Button({ variant = 'primary', children, className = '', ...props }) {
  return (
    <button
      style={variantStyles[variant] || variantStyles.primary}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useThemeMode } from '../context/ThemeContext';

const accentMap = {
  primary: 'var(--color-accent-primary)',
  success: 'var(--color-accent-clear)',
  warning: 'var(--color-accent-amber)',
  error: 'var(--color-accent-red)',
};

export default function StatCard({ title, value, icon, color = 'primary' }) {
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const accent = accentMap[color] || accentMap.primary;

  return (
    <Card className="card-glow" sx={{ bgcolor: isDark ? 'hsl(222, 12%, 16%)' : '#fff' }}>
      <CardContent sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: { xs: 1.5, md: 2 },
        '&:last-child': { pb: { xs: 1.5, md: 2 } },
      }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="caption"
            sx={{
              fontFamily: '"Lexend", "Segoe UI", system-ui, sans-serif',
              fontWeight: 600,
              fontSize: '0.6rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: isDark ? 'hsl(214, 12%, 68%)' : '#64748b',
              mb: 0.3,
              display: 'block',
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontFamily: '"Lexend", "Segoe UI", system-ui, sans-serif',
              fontWeight: 700,
              fontSize: '1.25rem',
              color: isDark ? 'hsl(210, 20%, 98%)' : '#0f172a',
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1.2,
            }}
          >
            {value}
          </Typography>
        </Box>
        <Box
          className="card-glow"
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: isDark ? `${accent}18` : `${accent}12`,
            color: accent,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      </CardContent>
    </Card>
  );
}

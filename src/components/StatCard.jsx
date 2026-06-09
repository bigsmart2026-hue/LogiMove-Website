import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export default function StatCard({ title, value, icon, color = 'primary' }) {
  return (
    <Card>
      <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: { xs: 2, md: 3 }, '&:last-child': { pb: { xs: 2, md: 3 } } }}>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>{title}</Typography>
          <Typography variant="h4" color="text.primary">{value}</Typography>
        </Box>
        <Box sx={{ width: 48, height: 48, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: `${color}.main`, color: `${color}.contrastText`, opacity: 0.9 }}>
          {icon}
        </Box>
      </CardContent>
    </Card>
  );
}

import Chip from '@mui/material/Chip';

const statusColors = {
  pending: 'warning',
  'picked-up': 'info',
  assigned: 'secondary',
  'in-transit': 'secondary',
  delivered: 'success',
  cancelled: 'error',
};

export default function StatusBadge({ status }) {
  return (
    <Chip
      label={status?.replace('-', ' ')}
      size="small"
      color={statusColors[status] || 'default'}
      variant="filled"
      sx={{ fontWeight: 600, textTransform: 'capitalize' }}
    />
  );
}

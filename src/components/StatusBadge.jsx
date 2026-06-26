import { Circle } from 'lucide-react';

const statusConfig = {
  delivered: { cssClass: 'status-pill--clear', label: 'Delivered' },
  cleared: { cssClass: 'status-pill--clear', label: 'Cleared' },
  'picked-up': { cssClass: 'status-pill--primary', label: 'Picked Up' },
  assigned: { cssClass: 'status-pill--primary', label: 'Assigned' },
  'in-transit': { cssClass: 'status-pill--amber', label: 'In Transit' },
  pending: { cssClass: 'status-pill--amber', label: 'Pending' },
  delayed: { cssClass: 'status-pill--amber', label: 'Delayed' },
  exception: { cssClass: 'status-pill--red', label: 'Exception' },
  cancelled: { cssClass: 'status-pill--red', label: 'Cancelled' },
  hold: { cssClass: 'status-pill--red', label: 'On Hold' },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || { cssClass: 'status-pill--muted', label: status || 'Unknown' };

  return (
    <span className={`status-pill ${config.cssClass}`}>
      <Circle />
      {config.label}
    </span>
  );
}

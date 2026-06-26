import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useThemeMode } from '../context/ThemeContext';
import { saveOrder, calculateCost, calculateETA, estimateDistance } from '../firebase/services';

const ACCENT = 'hsl(8, 85%, 55%)';

const inputBase = {
  width: '100%',
  padding: '7px 10px',
  fontSize: '0.7rem',
  fontFamily: '"Inter", sans-serif',
  border: '1px solid var(--color-border)',
  borderRadius: 6,
  background: 'var(--color-bg-secondary)',
  color: 'var(--color-text-primary)',
  outline: 'none',
  transition: 'border-color 150ms ease',
};

const btnPrimary = {
  padding: '8px 16px',
  fontSize: '0.7rem',
  fontFamily: '"Lexend", sans-serif',
  fontWeight: 600,
  background: ACCENT,
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
};

const btnSecondary = {
  padding: '8px 16px',
  fontSize: '0.7rem',
  fontFamily: '"Lexend", sans-serif',
  fontWeight: 500,
  background: 'transparent',
  color: 'var(--color-text-secondary)',
  border: '1px solid var(--color-border)',
  borderRadius: 6,
  cursor: 'pointer',
};

export default function Booking() {
  const navigate = useNavigate();
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ senderName: '', senderEmail: '', senderPhone: '', recipientName: '', recipientPhone: '', origin: '', destination: '', weight: '', vehicleType: 'van', priority: 'standard', paymentMethod: 'card', cashOnDelivery: false, lagosTraffic: false, leaveAtDoor: false, description: '' });

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async () => {
    const dist = estimateDistance(6.5244, 3.3792, 9.0765, 7.3986);
    const cost = calculateCost(Number(form.weight), dist, form.vehicleType);
    const eta = calculateETA(dist, form.vehicleType, form.lagosTraffic);
    await saveOrder({ ...form, cost, estimatedDelivery: new Date(Date.now() + eta * 3600000).toISOString(), status: 'pending', paymentStatus: form.paymentMethod === 'cash' ? 'pending' : 'paid', coordinates: { lat: 6.5244, lng: 3.3792 }, destinationCoords: { lat: 9.0765, lng: 7.3986 } });
    toast.success('Booking created successfully!');
    navigate('/tracking');
  };

  const stepCircle = (s) => ({
    width: 24,
    height: 24,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.65rem',
    fontFamily: '"Lexend", sans-serif',
    fontWeight: 600,
    background: step >= s ? ACCENT : 'var(--color-bg-tertiary)',
    color: step >= s ? '#fff' : 'var(--color-text-secondary)',
  });

  const stepLabel = (s) => ({
    fontSize: '0.6rem',
    fontFamily: '"Lexend", sans-serif',
    fontWeight: step >= s ? 600 : 400,
    color: step >= s ? ACCENT : 'var(--color-text-secondary)',
  });

  const stepLine = (s) => ({
    width: 24,
    height: 2,
    background: step > s ? ACCENT : 'var(--color-border)',
    borderRadius: 1,
  });

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <h1 style={{ fontFamily: '"Lexend", sans-serif', fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 16, letterSpacing: '-0.02em' }}>
        Book a Shipment
      </h1>

      {/* Steps */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
        {[1, 2, 3].map(s => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={stepCircle(s)}>{s}</div>
            <span style={stepLabel(s)}>{s === 1 ? 'Details' : s === 2 ? 'Options' : 'Confirm'}</span>
            {s < 3 && <div style={stepLine(s)} />}
          </div>
        ))}
      </div>

      {/* Card */}
      <div style={{
        background: 'var(--color-bg-secondary)',
        borderRadius: 8,
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--color-surface-highlight)',
        padding: 16,
      }}>
        {step === 1 && (
          <div>
            <h3 style={{ fontFamily: '"Lexend", sans-serif', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 12 }}>
              Sender & Recipient Details
            </h3>
            <div className="booking-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label style={labelStyle}>Sender Name</label><input type="text" value={form.senderName} onChange={e => update('senderName', e.target.value)} style={inputBase} /></div>
              <div><label style={labelStyle}>Sender Email</label><input type="email" value={form.senderEmail} onChange={e => update('senderEmail', e.target.value)} style={inputBase} /></div>
              <div><label style={labelStyle}>Sender Phone</label><input type="tel" value={form.senderPhone} onChange={e => update('senderPhone', e.target.value)} style={inputBase} /></div>
              <div><label style={labelStyle}>Recipient Name</label><input type="text" value={form.recipientName} onChange={e => update('recipientName', e.target.value)} style={inputBase} /></div>
              <div><label style={labelStyle}>Recipient Phone</label><input type="tel" value={form.recipientPhone} onChange={e => update('recipientPhone', e.target.value)} style={inputBase} /></div>
              <div><label style={labelStyle}>Origin</label><input type="text" value={form.origin} onChange={e => update('origin', e.target.value)} placeholder="e.g., Lagos, Nigeria" style={inputBase} /></div>
              <div><label style={labelStyle}>Destination</label><input type="text" value={form.destination} onChange={e => update('destination', e.target.value)} placeholder="e.g., Abuja, Nigeria" style={inputBase} /></div>
              <div><label style={labelStyle}>Weight (kg)</label><input type="number" value={form.weight} onChange={e => update('weight', e.target.value)} style={inputBase} /></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={() => setStep(2)} style={btnPrimary}>Next</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 style={{ fontFamily: '"Lexend", sans-serif', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 12 }}>
              Delivery Options
            </h3>
            <div className="booking-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Vehicle Type</label>
                <select value={form.vehicleType} onChange={e => update('vehicleType', e.target.value)} style={inputBase}>
                  <option value="bike">Bike (up to 50kg)</option>
                  <option value="van">Van (up to 1500kg)</option>
                  <option value="truck">Truck (up to 8000kg)</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Priority</label>
                <select value={form.priority} onChange={e => update('priority', e.target.value)} style={inputBase}>
                  <option value="standard">Standard (3-5 days)</option>
                  <option value="express">Express (1-2 days)</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Payment Method</label>
                <select value={form.paymentMethod} onChange={e => update('paymentMethod', e.target.value)} style={inputBase}>
                  <option value="card">Card (Paystack/Flutterwave)</option>
                  <option value="cash">Cash on Delivery</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Package Description</label>
                <input type="text" value={form.description} onChange={e => update('description', e.target.value)} placeholder="e.g., Electronics, Documents" style={inputBase} />
              </div>
            </div>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={checkLabel}><input type="checkbox" checked={form.cashOnDelivery} onChange={e => update('cashOnDelivery', e.target.checked)} style={checkStyle} /><span style={checkText}>Cash on Delivery</span></label>
              <label style={checkLabel}><input type="checkbox" checked={form.lagosTraffic} onChange={e => update('lagosTraffic', e.target.checked)} style={checkStyle} /><span style={checkText}>Lagos Traffic (+30% ETA)</span></label>
              <label style={checkLabel}><input type="checkbox" checked={form.leaveAtDoor} onChange={e => update('leaveAtDoor', e.target.checked)} style={checkStyle} /><span style={checkText}>Leave at Door</span></label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
              <button onClick={() => setStep(1)} style={btnSecondary}>Back</button>
              <button onClick={() => setStep(3)} style={btnPrimary}>Review</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 style={{ fontFamily: '"Lexend", sans-serif', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 12 }}>
              Confirm Booking
            </h3>
            <div style={{
              background: 'var(--color-bg-tertiary)',
              borderRadius: 8,
              padding: 12,
            }}>
              <div className="booking-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', fontSize: '0.65rem' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Sender:</span>
                <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{form.senderName || 'N/A'}</span>
                <span style={{ color: 'var(--color-text-secondary)' }}>Recipient:</span>
                <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{form.recipientName || 'N/A'}</span>
                <span style={{ color: 'var(--color-text-secondary)' }}>Route:</span>
                <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{form.origin || 'N/A'} → {form.destination || 'N/A'}</span>
                <span style={{ color: 'var(--color-text-secondary)' }}>Weight:</span>
                <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{form.weight || 'N/A'} kg</span>
                <span style={{ color: 'var(--color-text-secondary)' }}>Vehicle:</span>
                <span style={{ color: 'var(--color-text-primary)', fontWeight: 500, textTransform: 'capitalize' }}>{form.vehicleType}</span>
                <span style={{ color: 'var(--color-text-secondary)' }}>Payment:</span>
                <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{form.paymentMethod === 'card' ? 'Card' : 'Cash on Delivery'}</span>
              </div>
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 8, marginTop: 8, display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)' }}>Estimated Cost:</span>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: ACCENT }}>
                  ₦{calculateCost(Number(form.weight) || 5, estimateDistance(6.5244, 3.3792, 9.0765, 7.3986), form.vehicleType).toLocaleString()}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
              <button onClick={() => setStep(2)} style={btnSecondary}>Back</button>
              <button onClick={handleSubmit} style={{ ...btnPrimary, background: 'var(--color-accent-clear)' }}>Confirm & Book</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: '0.6rem',
  fontFamily: '"Inter", sans-serif',
  fontWeight: 500,
  color: 'var(--color-text-secondary)',
  marginBottom: 3,
};

const checkLabel = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  cursor: 'pointer',
};

const checkStyle = {
  width: 13,
  height: 13,
  accentColor: 'hsl(8, 85%, 55%)',
};

const checkText = {
  fontSize: '0.65rem',
  fontFamily: '"Inter", sans-serif',
  color: 'var(--color-text-secondary)',
};

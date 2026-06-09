import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { saveOrder, calculateCost, calculateETA, estimateDistance } from '../firebase/services';

export default function Booking() {
  const navigate = useNavigate();
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Book a Shipment</h1>
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>{s}</div>
            <span className={`text-sm ${step >= s ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>{s === 1 ? 'Details' : s === 2 ? 'Options' : 'Confirm'}</span>
            {s < 3 && <div className={`w-8 h-0.5 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 mb-4">Sender & Recipient Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Sender Name</label><input type="text" value={form.senderName} onChange={e => update('senderName', e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Sender Email</label><input type="email" value={form.senderEmail} onChange={e => update('senderEmail', e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Sender Phone</label><input type="tel" value={form.senderPhone} onChange={e => update('senderPhone', e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Recipient Name</label><input type="text" value={form.recipientName} onChange={e => update('recipientName', e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Recipient Phone</label><input type="tel" value={form.recipientPhone} onChange={e => update('recipientPhone', e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Origin</label><input type="text" value={form.origin} onChange={e => update('origin', e.target.value)} placeholder="e.g., Lagos, Nigeria" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Destination</label><input type="text" value={form.destination} onChange={e => update('destination', e.target.value)} placeholder="e.g., Abuja, Nigeria" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label><input type="number" value={form.weight} onChange={e => update('weight', e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
            </div>
            <div className="flex justify-end mt-6"><button onClick={() => setStep(2)} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Next</button></div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 mb-4">Delivery Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                <select value={form.vehicleType} onChange={e => update('vehicleType', e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="bike">Bike (up to 50kg)</option>
                  <option value="van">Van (up to 1500kg)</option>
                  <option value="truck">Truck (up to 8000kg)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select value={form.priority} onChange={e => update('priority', e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="standard">Standard (3-5 days)</option>
                  <option value="express">Express (1-2 days)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select value={form.paymentMethod} onChange={e => update('paymentMethod', e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="card">Card (Paystack/Flutterwave)</option>
                  <option value="cash">Cash on Delivery</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Package Description</label>
                <input type="text" value={form.description} onChange={e => update('description', e.target.value)} placeholder="e.g., Electronics, Documents" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={form.cashOnDelivery} onChange={e => update('cashOnDelivery', e.target.checked)} className="w-4 h-4 text-blue-600 rounded" /><span className="text-sm text-gray-700">Cash on Delivery</span></label>
              <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={form.lagosTraffic} onChange={e => update('lagosTraffic', e.target.checked)} className="w-4 h-4 text-blue-600 rounded" /><span className="text-sm text-gray-700">Lagos Traffic (+30% ETA)</span></label>
              <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={form.leaveAtDoor} onChange={e => update('leaveAtDoor', e.target.checked)} className="w-4 h-4 text-blue-600 rounded" /><span className="text-sm text-gray-700">Leave at Door</span></label>
            </div>
            <div className="flex justify-between mt-6"><button onClick={() => setStep(1)} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">Back</button><button onClick={() => setStep(3)} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Review</button></div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 mb-4">Confirm Booking</h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3"><span className="text-gray-500">Sender:</span><span className="font-medium">{form.senderName || 'N/A'}</span><span className="text-gray-500">Recipient:</span><span className="font-medium">{form.recipientName || 'N/A'}</span><span className="text-gray-500">Route:</span><span className="font-medium">{form.origin || 'N/A'} → {form.destination || 'N/A'}</span><span className="text-gray-500">Weight:</span><span className="font-medium">{form.weight || 'N/A'} kg</span><span className="text-gray-500">Vehicle:</span><span className="font-medium capitalize">{form.vehicleType}</span><span className="text-gray-500">Payment:</span><span className="font-medium">{form.paymentMethod === 'card' ? 'Card' : 'Cash on Delivery'}</span></div>
              <div className="border-t border-gray-200 pt-3 mt-3">
                <span className="text-gray-500">Estimated Cost:</span>
                <span className="text-xl font-bold text-blue-600 ml-2">₦{calculateCost(Number(form.weight) || 5, estimateDistance(6.5244, 3.3792, 9.0765, 7.3986), form.vehicleType).toLocaleString()}</span>
              </div>
            </div>
            <div className="flex justify-between mt-6"><button onClick={() => setStep(2)} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">Back</button><button onClick={handleSubmit} className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">Confirm & Book</button></div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function QRScan() {
  const navigate = useNavigate();
  const [scannedData, setScannedData] = useState('');
  const [scanning, setScanning] = useState(false);
  const qrRef = useRef(null);
  const qrInstance = useRef(null);

  const startScan = () => {
    setScanning(true);
    import('html5-qrcode').then(({ Html5Qrcode }) => {
      const qr = new Html5Qrcode('qr-reader');
      qrInstance.current = qr;
      qr.start({ facingMode: 'environment' }, { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          setScannedData(decodedText);
          toast.success(`QR Scanned: ${decodedText}`);
          qr.stop().catch(() => {});
          setScanning(false);
        },
        () => {}
      ).catch(() => {
        toast.error('Camera access denied or not available');
        setScanning(false);
      });
    }).catch(() => {
      toast.error('QR scanner library not available');
      setScanning(false);
    });
  };

  const stopScan = () => {
    if (qrInstance.current) { qrInstance.current.stop().catch(() => {}); qrInstance.current = null; }
    setScanning(false);
  };

  useEffect(() => {
    if (scannedData) {
      const timer = setTimeout(() => navigate(`/tracking?order=${scannedData}`), 1500);
      return () => clearTimeout(timer);
    }
  }, [scannedData, navigate]);

  useEffect(() => { return () => { if (qrInstance.current) qrInstance.current.stop().catch(() => {}); }; }, []);

  return (
    <div className="max-w-md mx-auto space-y-6 text-center">
      <h1 className="text-2xl font-bold text-gray-900">QR Scanner</h1>
      <p className="text-sm text-gray-500">Scan a QR code to track an order (try a QR with "ORD-XXX")</p>

      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div id="qr-reader" ref={qrRef} className={`w-full ${scanning ? '' : 'hidden'}`} />
        {!scanning && (
          <div className="py-12 text-gray-400">
            <span className="text-5xl">📷</span>
            <p className="mt-3 text-sm">Camera idle</p>
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-center">
        <button onClick={startScan} disabled={scanning} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50">Start Scanner</button>
        <button onClick={stopScan} disabled={!scanning} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-50">Stop</button>
      </div>

      {scannedData && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm font-medium text-green-800">Scanned: {scannedData}</p>
          <p className="text-xs text-green-600 mt-1">Navigating to tracking...</p>
        </div>
      )}
    </div>
  );
}

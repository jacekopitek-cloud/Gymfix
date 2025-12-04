import React, { useEffect, useRef, useState } from 'react';
import { Icons } from './ui/Icons';

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera error:", err);
        setError('Nie udało się uruchomić kamery. Sprawdź uprawnienia przeglądarki.');
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Demo simulation: Pick a random SKU effectively pretending the camera read it
  const simulateScan = () => {
    const demoSkus = ['CBL-004', 'BLT-LF95', 'PCB-MTX', 'LUB-SIL', 'UPH-BK', 'BRG-6004'];
    const randomSku = demoSkus[Math.floor(Math.random() * demoSkus.length)];
    onScan(randomSku);
  };

  return (
    <div className="fixed inset-0 bg-black z-[60] flex flex-col items-center justify-center">
      <div className="absolute top-4 right-4 z-10">
        <button onClick={onClose} className="p-2 bg-white/20 rounded-full text-white backdrop-blur-sm">
          <Icons.Minus className="w-8 h-8 rotate-45" />
        </button>
      </div>

      <div className="relative w-full max-w-lg aspect-[3/4] bg-black overflow-hidden shadow-2xl">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full text-white px-6 text-center gap-4">
            <Icons.Alert className="w-12 h-12 text-red-500" />
            <p>{error}</p>
            <button onClick={onClose} className="bg-white text-black px-4 py-2 rounded-lg">Zamknij</button>
          </div>
        ) : (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              className="w-full h-full object-cover opacity-90"
            />
            
            {/* Camera Overlay UI */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
               <div className="relative w-64 h-48 border-2 border-transparent">
                 {/* Corners */}
                 <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-500 rounded-tl-lg shadow-sm"></div>
                 <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-500 rounded-tr-lg shadow-sm"></div>
                 <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-500 rounded-bl-lg shadow-sm"></div>
                 <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-500 rounded-br-lg shadow-sm"></div>
                 
                 {/* Laser Line */}
                 <div className="w-full h-0.5 bg-red-500 absolute top-1/2 -translate-y-1/2 shadow-[0_0_15px_rgba(255,0,0,0.8)] animate-[pulse_1.5s_ease-in-out_infinite]"></div>
               </div>
               
               <p className="mt-8 text-white font-medium bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-sm border border-white/10">
                 Nakieruj kamerę na kod kreskowy
               </p>
            </div>
            
            {/* Demo Trigger Button (Since we don't have real barcode WASM lib in this env) */}
            <div className="absolute bottom-12 left-0 right-0 flex justify-center px-4">
               <button 
                 onClick={simulateScan}
                 className="w-full max-w-xs bg-white text-slate-900 h-14 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all"
               >
                 <Icons.Scan className="w-6 h-6" />
                 <span>Zeskanuj (Symulacja)</span>
               </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BarcodeScanner;

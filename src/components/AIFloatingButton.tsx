import { useState } from 'react';
import { Camera } from 'lucide-react';
import { useFastingStore } from '@/store/fastingStore';
import PaywallModal from './PaywallModal';
import CameraModal from './CameraModal';

export default function AIFloatingButton() {
  const { subscriptionType } = useFastingStore();
  const [showPaywall, setShowPaywall] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const handleClick = () => {
    if (subscriptionType === 'free') {
      setShowPaywall(true);
    } else {
      setShowCamera(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="fixed bottom-24 right-6 w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-2xl hover:shadow-purple-500/50 transform hover:scale-110 transition-all duration-300 flex items-center justify-center z-40 group"
      >
        <Camera className="w-7 h-7 text-white group-hover:rotate-12 transition-transform duration-300" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 animate-ping opacity-30" />
      </button>

      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
      />

      <CameraModal
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
      />
    </>
  );
}

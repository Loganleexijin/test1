import { Home, User, Camera } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import CameraModal from './CameraModal';
import PaywallModal from './PaywallModal';
import { useFastingStore } from '@/store/fastingStore';

export default function BottomNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { subscriptionType } = useFastingStore();
  const [showCamera, setShowCamera] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  const handleCameraClick = () => {
    if (subscriptionType === 'free') {
      setShowPaywall(true);
    } else {
      setShowCamera(true);
    }
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 pb-safe">
        <div className="max-w-md mx-auto px-6">
          <div className="flex justify-between items-center h-16 relative">
            
            {/* Home Tab */}
            <button
              onClick={() => navigate('/')}
              className={`flex-1 flex flex-col items-center gap-1 transition-all ${
                location.pathname === '/' ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <Home className={`w-6 h-6 ${location.pathname === '/' ? 'fill-current' : ''}`} />
              <span className="text-[10px] font-medium">首页</span>
            </button>

            {/* Center Camera Button */}
            <div className="relative -top-5">
              <button
                onClick={handleCameraClick}
                className="w-14 h-14 bg-[#1a1b2e] rounded-full flex items-center justify-center shadow-lg shadow-blue-900/20 active:scale-95 transition-all"
              >
                <Camera className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Settings Tab */}
            <button
              onClick={() => navigate('/settings')}
              className={`flex-1 flex flex-col items-center gap-1 transition-all ${
                location.pathname === '/settings' ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <User className={`w-6 h-6 ${location.pathname === '/settings' ? 'fill-current' : ''}`} />
              <span className="text-[10px] font-medium">我的</span>
            </button>

          </div>
        </div>
      </nav>

      <CameraModal
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
      />
      
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
      />
    </>
  );
}

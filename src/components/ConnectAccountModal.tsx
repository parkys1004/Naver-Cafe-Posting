import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, Lock, AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface ConnectAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (token: string) => void;
}

export const ConnectAccountModal: React.FC<ConnectAccountModalProps> = ({ isOpen, onClose, onConnect }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // In production, verify event.origin matches your app url
      if (event.data?.type === 'NAVER_AUTH_SUCCESS' && event.data?.token) {
        setIsLoading(false);
        onConnect(event.data.token);
        onClose();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onConnect, onClose]);

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Get the Auth URL from our server
      const response = await fetch('/api/auth/naver/url');
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.url) {
        throw new Error('Failed to get authorization URL');
      }

      // 2. Open the popup
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const popup = window.open(
        data.url,
        'Naver Login',
        `width=${width},height=${height},top=${top},left=${left}`
      );

      if (!popup) {
        throw new Error('Popup was blocked. Please allow popups for this site.');
      }

    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.message || 'Failed to start login process');
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl pointer-events-auto relative overflow-hidden">
              
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col items-center text-center pt-4 pb-6">
                <div className="w-20 h-20 bg-[#03C75A]/10 rounded-full flex items-center justify-center mb-6 text-[#03C75A]">
                  <ShieldCheck size={40} />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-2">네이버 계정 연결</h2>
                <p className="text-gray-500 leading-relaxed mb-8">
                  카페 자동 포스팅을 위해<br/>
                  네이버 계정 연동이 필요합니다.
                </p>

                {error && (
                  <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 text-left w-full">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="w-full space-y-3">
                  <Button 
                    fullWidth 
                    onClick={handleConnect}
                    disabled={isLoading}
                    className="bg-[#03C75A] hover:bg-[#02b351] h-14 text-lg"
                  >
                    {isLoading ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      '네이버 아이디로 로그인'
                    )}
                  </Button>
                  
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-4">
                    <Lock size={12} />
                    <span>안전하게 암호화되어 저장됩니다</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

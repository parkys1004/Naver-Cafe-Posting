import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bell, Moon, Shield, HelpCircle, LogOut, ChevronRight } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const settingsItems = [
    { icon: <Bell size={20} />, label: '알림 설정', type: 'toggle', value: true },
    { icon: <Moon size={20} />, label: '다크 모드', type: 'toggle', value: false },
    { icon: <Shield size={20} />, label: '보안 및 개인정보', type: 'link' },
    { icon: <HelpCircle size={20} />, label: '도움말', type: 'link' },
  ];

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
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 right-0 bg-white z-50 w-full max-w-md shadow-2xl flex flex-col"
          >
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0">
              <h2 className="text-xl font-bold">설정</h2>
              <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                
                {/* Section 1 */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">앱 설정</h3>
                  <div className="bg-gray-50 rounded-2xl overflow-hidden">
                    {settingsItems.map((item, index) => (
                      <div 
                        key={item.label}
                        className={`flex items-center justify-between p-4 ${
                          index !== settingsItems.length - 1 ? 'border-b border-gray-100' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3 text-gray-700">
                          {item.icon}
                          <span className="font-medium">{item.label}</span>
                        </div>
                        {item.type === 'toggle' ? (
                          <div className={`w-12 h-7 rounded-full p-1 transition-colors ${item.value ? 'bg-[#03C75A]' : 'bg-gray-300'}`}>
                            <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${item.value ? 'translate-x-5' : ''}`} />
                          </div>
                        ) : (
                          <ChevronRight size={20} className="text-gray-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 2 */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">계정</h3>
                  <button className="w-full bg-gray-50 rounded-2xl p-4 flex items-center gap-3 text-red-500 hover:bg-red-50 transition-colors">
                    <LogOut size={20} />
                    <span className="font-medium">로그아웃</span>
                  </button>
                </div>

                <div className="text-center text-xs text-gray-400 mt-8">
                  버전 1.0.0
                </div>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

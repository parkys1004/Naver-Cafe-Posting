import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Type, AlignLeft, Save } from 'lucide-react';
import { Button } from './Button';
import { RichTextEditor } from './RichTextEditor';
import { SchedulePicker } from './SchedulePicker';

interface NewPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (post: any) => void;
  initialData?: any;
}

export const NewPostModal: React.FC<NewPostModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    cafeName: '',
    title: '',
    content: '',
    scheduledTime: '',
  });

  // Load initial data if editing
  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        cafeName: initialData.cafeName || '',
        title: initialData.title || '',
        content: initialData.content || '',
        scheduledTime: initialData.scheduledTime || '',
      });
    } else if (isOpen && !initialData) {
      // Reset if opening fresh
      setFormData({ cafeName: '', title: '', content: '', scheduledTime: '' });
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: initialData?.id, // Preserve ID if editing
      ...formData,
      status: 'pending',
    });
    onClose();
  };

  const handleSaveDraft = () => {
    onSubmit({
      id: initialData?.id,
      ...formData,
      status: 'draft',
    });
    onClose();
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
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-w-md mx-auto h-[90vh] flex flex-col shadow-2xl"
          >
            {/* Handle bar for visual cue */}
            <div className="w-full flex justify-center pt-3 pb-1" onClick={onClose}>
              <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
            </div>

            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {initialData ? '예약 수정하기' : '새 예약 만들기'}
              </h2>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleSaveDraft}
                  className="p-2 text-gray-500 hover:text-[#03C75A] hover:bg-green-50 rounded-full transition-colors flex items-center gap-1 text-sm font-medium"
                >
                  <Save size={18} />
                  <span className="hidden sm:inline">임시저장</span>
                </button>
                <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                  <X size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Cafe Selection */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">카페 선택</label>
                <div className="grid grid-cols-2 gap-3">
                  {['중고나라', '리액트 사용자 모임', '개발자 커뮤니티', '자유게시판'].map((cafe) => (
                    <button
                      key={cafe}
                      type="button"
                      onClick={() => setFormData({ ...formData, cafeName: cafe })}
                      className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        formData.cafeName === cafe
                          ? 'border-[#03C75A] bg-[#03C75A]/5 text-[#03C75A]'
                          : 'border-gray-100 text-gray-600 hover:border-gray-200'
                      }`}
                    >
                      {cafe}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <Type size={16} /> 제목
                </label>
                <input
                  type="text"
                  required
                  placeholder="게시글 제목을 입력하세요"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-[#03C75A] outline-none transition-all font-medium"
                />
              </div>

              {/* Content Input (Rich Text) */}
              <div className="space-y-2 flex-1 flex flex-col">
                <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <AlignLeft size={16} /> 내용
                </label>
                <div className="flex-1 min-h-[300px]">
                  <RichTextEditor
                    value={formData.content}
                    onChange={(html) => setFormData({ ...formData, content: html })}
                    placeholder="내용을 작성하세요... (사진/동영상 첨부 가능)"
                  />
                </div>
              </div>

              {/* Schedule Picker */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <Calendar size={16} /> 예약 설정
                </label>
                <SchedulePicker
                  value={formData.scheduledTime}
                  onChange={(val) => setFormData({ ...formData, scheduledTime: val })}
                />
              </div>

              <div className="h-24" /> {/* Spacer for bottom button */}
            </form>

            <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100">
              <Button onClick={handleSubmit} fullWidth className="h-14 text-lg shadow-xl shadow-[#03C75A]/20">
                {initialData ? '수정 완료' : '예약 등록하기'}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

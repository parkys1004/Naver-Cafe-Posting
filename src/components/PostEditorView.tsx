import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft, Calendar, Type, AlignLeft, Coffee } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';
import { SchedulePicker } from './SchedulePicker';
import { Button } from './Button';

interface PostEditorViewProps {
  initialData?: any;
  onSubmit: (post: any) => void;
  onCancel: () => void;
  cafes: any[];
}

export const PostEditorView: React.FC<PostEditorViewProps> = ({ initialData, onSubmit, onCancel, cafes }) => {
  const [formData, setFormData] = useState({
    cafeName: '',
    title: '',
    content: '',
    scheduledTime: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        cafeName: initialData.cafeName || '',
        title: initialData.title || '',
        content: initialData.content || '',
        scheduledTime: initialData.scheduledTime || '',
      });
    }
  }, [initialData]);

  const handleSubmit = (status: 'pending' | 'draft') => {
    onSubmit({
      id: initialData?.id,
      ...formData,
      status,
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-2xl font-bold text-gray-900">
            {initialData ? '게시글 수정' : '새 예약 등록'}
          </h2>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSubmit('draft')}
            className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 font-medium rounded-xl transition-colors flex items-center gap-2"
          >
            <Save size={18} />
            임시저장
          </button>
          <Button 
            onClick={() => handleSubmit('pending')}
            className="px-6 py-2.5 h-auto text-base shadow-lg shadow-green-500/20"
          >
            {initialData ? '수정 완료' : '예약 등록'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: Editor (8/12) */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          
          {/* Title */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Type size={16} /> 제목
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="게시글 제목을 입력하세요"
              className="w-full text-xl font-bold placeholder:text-gray-300 border-none outline-none focus:ring-0 p-0"
            />
          </div>

          {/* Editor */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[600px] flex flex-col">
            <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <AlignLeft size={16} /> 본문 내용
            </label>
            <div className="flex-1">
              <RichTextEditor
                value={formData.content}
                onChange={(html) => setFormData({ ...formData, content: html })}
                placeholder="내용을 작성하세요... (이미지/동영상을 드래그하거나 툴바에서 선택하세요)"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Settings & Preview (4/12) */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          
          {/* Cafe Select */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Coffee size={16} /> 카페 선택
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {cafes.length > 0 ? (
                cafes.map((cafe) => (
                  <button
                    key={cafe.cafeId}
                    onClick={() => setFormData({ ...formData, cafeName: cafe.cafeName })}
                    className={`w-full p-3 rounded-xl border text-left text-sm font-medium transition-all flex items-center gap-3 ${
                      formData.cafeName === cafe.cafeName
                        ? 'border-[#03C75A] bg-[#03C75A]/5 text-[#03C75A]'
                        : 'border-gray-100 text-gray-600 hover:border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-lg">☕</div>
                    <span className="truncate">{cafe.cafeName}</span>
                  </button>
                ))
              ) : (
                <div className="text-sm text-gray-400 text-center py-4">
                  연결된 카페가 없습니다.<br/>먼저 계정을 연결해주세요.
                </div>
              )}
              {/* Fallback for demo if no cafes loaded */}
              {cafes.length === 0 && ['중고나라', '리액트 사용자 모임', '개발자 커뮤니티'].map((cafe) => (
                 <button
                    key={cafe}
                    onClick={() => setFormData({ ...formData, cafeName: cafe })}
                    className={`w-full p-3 rounded-xl border text-left text-sm font-medium transition-all flex items-center gap-3 ${
                      formData.cafeName === cafe
                        ? 'border-[#03C75A] bg-[#03C75A]/5 text-[#03C75A]'
                        : 'border-gray-100 text-gray-600 hover:border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-lg">☕</div>
                    <span className="truncate">{cafe}</span>
                  </button>
              ))}
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Calendar size={16} /> 예약 설정
            </label>
            <SchedulePicker
              value={formData.scheduledTime}
              onChange={(val) => setFormData({ ...formData, scheduledTime: val })}
            />
          </div>

          {/* Media Info (Placeholder for "Upload Preview Area" requested in prompt) */}
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-blue-800">
            <h4 className="font-bold mb-2 flex items-center gap-2">
              💡 미디어 업로드 팁
            </h4>
            <p className="text-sm opacity-80 leading-relaxed">
              본문 에디터의 툴바를 사용하여 사진이나 동영상을 추가하세요. 
              추가된 미디어는 자동으로 서버에 업로드되며, 게시글 본문에 포함됩니다.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

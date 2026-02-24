import React, { useRef, useState } from 'react';
import { Image as ImageIcon, Video, X } from 'lucide-react';

interface RichTextEditorProps {
  value: string; // We'll use HTML string for simplicity in this demo
  onChange: (html: string) => void;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);

  // Sync initial value (only once to avoid cursor jumping)
  React.useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
       // Only update if empty to prevent overwriting user input during typing
       if (!editorRef.current.innerHTML) {
         editorRef.current.innerHTML = value;
       }
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleMediaClick = (type: 'image' | 'video') => {
    setMediaType(type);
    if (fileInputRef.current) {
      fileInputRef.current.accept = type === 'image' ? 'image/*' : 'video/*';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show loading state or placeholder if needed
    // For now, we'll just wait for upload
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      insertMedia(data.url, mediaType!);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('파일 업로드에 실패했습니다.');
    }
    
    // Reset input
    e.target.value = '';
  };

  const insertMedia = (src: string, type: 'image' | 'video') => {
    if (!editorRef.current) return;

    // Focus editor
    editorRef.current.focus();

    // Create media element
    const wrapper = document.createElement('div');
    wrapper.className = "my-4 relative group rounded-xl overflow-hidden";
    wrapper.contentEditable = "false"; // Prevent editing inside the wrapper

    let mediaEl;
    if (type === 'image') {
      mediaEl = document.createElement('img');
      mediaEl.src = src;
      mediaEl.className = "w-full h-auto rounded-xl object-cover max-h-80";
    } else {
      mediaEl = document.createElement('video');
      mediaEl.src = src;
      mediaEl.controls = true;
      mediaEl.className = "w-full h-auto rounded-xl max-h-80 bg-black";
    }

    // Delete button for the media
    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '×';
    deleteBtn.className = "absolute top-2 right-2 bg-black/50 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70";
    deleteBtn.onclick = (e) => {
        e.preventDefault();
        wrapper.remove();
        handleInput(); // Update state after removal
    };

    wrapper.appendChild(mediaEl);
    wrapper.appendChild(deleteBtn);

    // Insert at cursor or append
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && editorRef.current.contains(selection.anchorNode)) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(wrapper);
      
      // Move cursor after the inserted element
      range.setStartAfter(wrapper);
      range.setEndAfter(wrapper);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      editorRef.current.appendChild(wrapper);
    }

    // Add a new paragraph after media for easier typing
    const p = document.createElement('p');
    p.innerHTML = '<br>';
    editorRef.current.appendChild(p);
    
    handleInput();
  };

  return (
    <div className="flex flex-col h-full border-2 border-gray-100 rounded-xl overflow-hidden focus-within:border-[#03C75A] transition-colors bg-gray-50 focus-within:bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b border-gray-100 bg-white">
        <button
          type="button"
          onClick={() => handleMediaClick('image')}
          className="p-2 text-gray-500 hover:text-[#03C75A] hover:bg-green-50 rounded-lg transition-colors flex items-center gap-1.5 text-sm font-medium"
        >
          <ImageIcon size={18} />
          <span>사진</span>
        </button>
        <button
          type="button"
          onClick={() => handleMediaClick('video')}
          className="p-2 text-gray-500 hover:text-[#03C75A] hover:bg-green-50 rounded-lg transition-colors flex items-center gap-1.5 text-sm font-medium"
        >
          <Video size={18} />
          <span>동영상</span>
        </button>
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="flex-1 p-4 outline-none overflow-y-auto min-h-[200px] prose prose-sm max-w-none"
        data-placeholder={placeholder}
        style={{ whiteSpace: 'pre-wrap' }} // Preserve line breaks
      />

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />
      
      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

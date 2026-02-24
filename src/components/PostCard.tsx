import React from 'react';
import { Calendar, Clock, MoreHorizontal, Repeat, Trash2, FileEdit } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  cafeName: string;
  scheduledTime: string;
  status: 'pending' | 'posted' | 'failed' | 'draft';
}

interface PostCardProps {
  post: Post;
  onDelete?: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onDelete }) => {
  let scheduleDisplay = { date: '', time: '', isRecurring: false, recurringText: '' };

  try {
    if (post.scheduledTime.startsWith('{')) {
      const parsed = JSON.parse(post.scheduledTime);
      scheduleDisplay.isRecurring = true;
      scheduleDisplay.time = parsed.time;
      
      if (parsed.type === 'daily') {
        scheduleDisplay.recurringText = '매일';
      } else if (parsed.type === 'weekly') {
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        const dayNames = parsed.days.map((d: number) => days[d]).join(', ');
        scheduleDisplay.recurringText = `매주 ${dayNames}`;
      }
    } else {
      const d = new Date(post.scheduledTime);
      scheduleDisplay.date = d.toLocaleDateString();
      scheduleDisplay.time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  } catch (e) {
    scheduleDisplay.date = 'Invalid Date';
  }

  return (
    <div className={`bg-white p-5 rounded-2xl border shadow-sm mb-4 transition-all hover:shadow-md group ${
      post.status === 'draft' ? 'border-dashed border-gray-300 bg-gray-50/50' : 'border-gray-100'
    }`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block px-2 py-1 rounded-md bg-gray-100 text-xs font-medium text-gray-500">
              {post.cafeName || '카페 미선택'}
            </span>
            {post.status === 'draft' && (
              <span className="inline-block px-2 py-1 rounded-md bg-orange-100 text-xs font-medium text-orange-600">
                임시저장
              </span>
            )}
          </div>
          <h3 className="font-semibold text-gray-900 text-lg leading-tight truncate">
            {post.title || '(제목 없음)'}
          </h3>
        </div>
        
        <div className="flex items-center gap-1">
          {post.status === 'draft' && (
            <div className="p-2 text-gray-400">
              <FileEdit size={18} />
            </div>
          )}
          {onDelete && (
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-4 text-sm text-gray-500">
        {scheduleDisplay.isRecurring ? (
          <div className="flex items-center gap-1.5 text-[#03C75A] font-medium">
            <Repeat size={16} />
            <span>{scheduleDisplay.recurringText}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <Calendar size={16} />
            <span>{scheduleDisplay.date !== 'Invalid Date' ? scheduleDisplay.date : '-'}</span>
          </div>
        )}
        
        <div className="flex items-center gap-1.5">
          <Clock size={16} />
          <span>{scheduleDisplay.time || '-'}</span>
        </div>
      </div>
    </div>
  );
};

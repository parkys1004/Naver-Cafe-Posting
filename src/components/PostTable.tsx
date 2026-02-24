import React from 'react';
import { Edit2, Trash2, Repeat, Calendar, Clock } from 'lucide-react';

interface PostTableProps {
  posts: any[];
  onEdit: (post: any) => void;
  onDelete: (id: string) => void;
}

export const PostTable: React.FC<PostTableProps> = ({ posts, onEdit, onDelete }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold">대기중</span>;
      case 'posted':
        return <span className="px-2.5 py-1 rounded-full bg-green-50 text-green-600 text-xs font-bold">완료</span>;
      case 'failed':
        return <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold">실패</span>;
      case 'draft':
        return <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold">임시저장</span>;
      default:
        return null;
    }
  };

  const formatSchedule = (scheduledTime: string) => {
    try {
      if (scheduledTime.startsWith('{')) {
        const parsed = JSON.parse(scheduledTime);
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        
        if (parsed.type === 'daily') {
          return (
            <div className="flex items-center gap-1.5 text-gray-600">
              <Repeat size={14} className="text-[#03C75A]" />
              <span>매일 {parsed.time}</span>
            </div>
          );
        } else if (parsed.type === 'weekly') {
          return (
            <div className="flex items-center gap-1.5 text-gray-600">
              <Repeat size={14} className="text-[#03C75A]" />
              <span>매주 {parsed.days.map((d: number) => days[d]).join(', ')} {parsed.time}</span>
            </div>
          );
        }
      } else {
        const d = new Date(scheduledTime);
        return (
          <div className="flex items-center gap-2 text-gray-600">
            <span className="flex items-center gap-1"><Calendar size={14} /> {d.toLocaleDateString()}</span>
            <span className="flex items-center gap-1"><Clock size={14} /> {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        );
      }
    } catch (e) {
      return <span className="text-gray-400">-</span>;
    }
    return <span className="text-gray-400">-</span>;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 className="font-bold text-gray-800">예약 현황 리스트</h3>
        <span className="text-xs text-gray-500">총 {posts.length}건</span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-xs uppercase text-gray-400 font-semibold tracking-wider">
              <th className="px-6 py-4 w-48">날짜/시간</th>
              <th className="px-6 py-4 w-40">카페명</th>
              <th className="px-6 py-4">제목</th>
              <th className="px-6 py-4 w-24 text-center">상태</th>
              <th className="px-6 py-4 w-24 text-right">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {posts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-6 py-4 text-sm">
                    {formatSchedule(post.scheduledTime)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-700">
                    {post.cafeName || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 truncate max-w-md">{post.title || '(제목 없음)'}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {getStatusBadge(post.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onEdit(post)}
                        className="p-1.5 text-gray-400 hover:text-[#03C75A] hover:bg-green-50 rounded-lg transition-colors"
                        title="수정"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => onDelete(post.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="삭제"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

import React from 'react';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface DashboardStatsProps {
  posts: any[];
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ posts }) => {
  const pendingCount = posts.filter(p => p.status === 'pending').length;
  
  // Calculate posted today
  const today = new Date().toLocaleDateString();
  const postedTodayCount = posts.filter(p => 
    p.status === 'posted' && 
    new Date(p.scheduledTime).toLocaleDateString() === today
  ).length;

  const failedCount = posts.filter(p => p.status === 'failed').length;

  return (
    <div className="grid grid-cols-3 gap-6 mb-8">
      {/* Pending Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">예약 중인 글</p>
          <div className="text-3xl font-bold text-gray-900 flex items-baseline gap-1">
            {pendingCount}
            <span className="text-sm font-normal text-gray-400">건</span>
          </div>
        </div>
        <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
          <Clock size={24} />
        </div>
      </div>

      {/* Success Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">오늘 등록 성공</p>
          <div className="text-3xl font-bold text-[#03C75A] flex items-baseline gap-1">
            {postedTodayCount}
            <span className="text-sm font-normal text-gray-400">건</span>
          </div>
        </div>
        <div className="w-12 h-12 bg-green-50 text-[#03C75A] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
          <CheckCircle2 size={24} />
        </div>
      </div>

      {/* Failed Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">등록 실패/오류</p>
          <div className="text-3xl font-bold text-red-500 flex items-baseline gap-1">
            {failedCount}
            <span className="text-sm font-normal text-gray-400">건</span>
          </div>
        </div>
        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
          <AlertCircle size={24} />
        </div>
      </div>
    </div>
  );
};

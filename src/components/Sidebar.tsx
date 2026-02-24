import React from 'react';
import { Plus, Coffee, Settings, LogOut, LayoutDashboard } from 'lucide-react';

interface SidebarProps {
  onNewPost: () => void;
  cafes: any[];
  selectedCafeId: number | null;
  onSelectCafe: (id: number | null) => void;
  userProfile: any;
  onConnect: () => void;
  isConnected: boolean;
  currentView: 'dashboard' | 'editor';
  onChangeView: (view: 'dashboard' | 'editor') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onNewPost,
  cafes,
  selectedCafeId,
  onSelectCafe,
  userProfile,
  onConnect,
  isConnected,
  currentView,
  onChangeView
}) => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0 z-20">
      {/* Logo / Header */}
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <div className="w-8 h-8 bg-[#03C75A] rounded-lg flex items-center justify-center text-white">
            N
          </div>
          카페 매니저
        </h1>
      </div>

      {/* Main Actions */}
      <div className="p-4 space-y-2">
        <button
          onClick={onNewPost}
          className="w-full py-3 px-4 bg-[#03C75A] hover:bg-[#02b351] text-white rounded-xl font-bold shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-2 mb-6"
        >
          <Plus size={20} />
          글쓰기 예약
        </button>

        <button
          onClick={() => onChangeView('dashboard')}
          className={`w-full py-3 px-4 rounded-xl font-medium transition-all flex items-center gap-3 text-left ${
            currentView === 'dashboard' 
              ? 'bg-gray-100 text-gray-900' 
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <LayoutDashboard size={20} />
          대시보드
        </button>
      </div>

      {/* Cafe List Dropdown Area */}
      <div className="px-4 py-2 flex-1 overflow-y-auto">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
          내 카페 목록
        </div>
        
        {isConnected ? (
          <div className="space-y-1">
            <button
              onClick={() => onSelectCafe(null)}
              className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2 text-left ${
                selectedCafeId === null
                  ? 'bg-green-50 text-[#03C75A]'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-current" />
              전체 보기
            </button>
            {cafes.map((cafe) => (
              <button
                key={cafe.cafeId}
                onClick={() => onSelectCafe(cafe.cafeId)}
                className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2 text-left ${
                  selectedCafeId === cafe.cafeId
                    ? 'bg-green-50 text-[#03C75A]'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Coffee size={16} />
                <span className="truncate">{cafe.cafeName}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-xs text-gray-500 mb-3">카페 목록을 불러오려면<br/>로그인이 필요합니다.</p>
            <button
              onClick={onConnect}
              className="text-xs font-bold text-[#03C75A] hover:underline"
            >
              네이버 로그인
            </button>
          </div>
        )}
      </div>

      {/* User Profile / Footer */}
      <div className="p-4 border-t border-gray-100">
        {isConnected && userProfile ? (
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
            <img 
              src={userProfile.profile_image || "https://via.placeholder.com/40"} 
              alt="Profile" 
              className="w-10 h-10 rounded-full object-cover border border-gray-200"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{userProfile.name}</p>
              <p className="text-xs text-gray-500 truncate">{userProfile.email}</p>
            </div>
            <Settings size={16} className="text-gray-400" />
          </div>
        ) : (
          <button
            onClick={onConnect}
            className="w-full py-2 px-4 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            계정 연결하기
          </button>
        )}
      </div>
    </div>
  );
};

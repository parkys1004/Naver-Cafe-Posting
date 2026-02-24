import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { DashboardStats } from './components/DashboardStats';
import { PostTable } from './components/PostTable';
import { PostEditorView } from './components/PostEditorView';
import { ConnectAccountModal } from './components/ConnectAccountModal';
import { Toast } from './components/Toast';

interface Cafe {
  cafeId: number;
  cafeName: string;
  cafeUrl: string;
}

export default function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'editor'>('dashboard');
  const [posts, setPosts] = useState<any[]>([]);
  const [editingPost, setEditingPost] = useState<any>(null);
  
  const [isConnected, setIsConnected] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [selectedCafeId, setSelectedCafeId] = useState<number | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  
  // Toast State
  const [toast, setToast] = useState({ message: '', isVisible: false, type: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, 10000);

    const eventSource = new EventSource('/api/notifications');
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'success' || data.type === 'error') {
        showToast(data.message, data.type);
        if (Notification.permission === 'granted') {
          new Notification(data.title, { body: data.message });
        }
        fetchPosts();
      }
    };

    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      clearInterval(interval);
      eventSource.close();
    };
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Failed to fetch posts', error);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, isVisible: true, type });
  };

  const handleSavePost = async (post: any) => {
    try {
      const method = post.id && posts.some(p => p.id === post.id) ? 'PUT' : 'POST';
      const url = method === 'PUT' ? `/api/posts/${post.id}` : '/api/posts';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
      });

      if (res.ok) {
        fetchPosts();
        showToast(post.status === 'draft' ? '임시 저장되었습니다' : '예약이 성공적으로 등록되었습니다');
        setCurrentView('dashboard');
        setEditingPost(null);
      } else {
        throw new Error('Failed to save post');
      }
    } catch (error) {
      console.error('Error saving post:', error);
      showToast('저장에 실패했습니다', 'error');
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchPosts();
        showToast('삭제되었습니다');
      }
    } catch (error) {
      showToast('삭제 실패', 'error');
    }
  };

  const handleEditPost = (post: any) => {
    setEditingPost(post);
    setCurrentView('editor');
  };

  const handleConnect = async (token: string) => {
    setAccessToken(token);
    setIsConnected(true);
    showToast('네이버 계정이 연결되었습니다');
    fetchUserData(token);
  };

  const fetchUserData = async (token: string) => {
    try {
      const profileRes = await fetch('/api/naver/profile', { headers: { Authorization: `Bearer ${token}` } });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setUserProfile(profileData.response);
      }
      const cafeRes = await fetch('/api/naver/cafes', { headers: { Authorization: `Bearer ${token}` } });
      if (cafeRes.ok) {
        const cafeData = await cafeRes.json();
        if (cafeData.cafes) setCafes(cafeData.cafes);
      }
    } catch (error) {
      console.error('Failed to fetch user data', error);
      showToast('데이터를 불러오는데 실패했습니다', 'error');
    }
  };

  // Filter posts based on selected cafe
  const filteredPosts = selectedCafeId 
    ? posts.filter(p => {
        const cafe = cafes.find(c => c.cafeId === selectedCafeId);
        return cafe && p.cafeName === cafe.cafeName;
      })
    : posts;

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] font-sans text-gray-900">
      {/* Sidebar */}
      <Sidebar
        onNewPost={() => {
          setEditingPost(null);
          setCurrentView('editor');
        }}
        cafes={cafes}
        selectedCafeId={selectedCafeId}
        onSelectCafe={setSelectedCafeId}
        userProfile={userProfile}
        onConnect={() => setIsConnectModalOpen(true)}
        isConnected={isConnected}
        currentView={currentView}
        onChangeView={setCurrentView}
      />

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <div className="max-w-[1600px] mx-auto">
          {currentView === 'dashboard' ? (
            <div className="space-y-8 animate-in fade-in duration-500">
              {/* Header */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">대시보드</h2>
                <p className="text-gray-500 mt-1">예약 현황과 포스팅 결과를 한눈에 확인하세요.</p>
              </div>

              {/* Stats Cards */}
              <DashboardStats posts={posts} />

              {/* Table */}
              <PostTable 
                posts={filteredPosts} 
                onEdit={handleEditPost} 
                onDelete={handleDeletePost} 
              />
            </div>
          ) : (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <PostEditorView
                initialData={editingPost}
                onSubmit={handleSavePost}
                onCancel={() => setCurrentView('dashboard')}
                cafes={cafes}
              />
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <ConnectAccountModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onConnect={handleConnect}
      />

      {/* Toast */}
      <Toast 
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  );
}

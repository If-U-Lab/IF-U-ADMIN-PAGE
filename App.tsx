
import React, { useState, useRef, useEffect } from 'react';
import { Icons, COLORS } from './constants';
import Dashboard from './components/Dashboard';
import QuestionManager from './components/QuestionManager';
import AIGenerator from './components/AIGenerator';
import CommentManager from './components/CommentManager';
import UserManager from './components/UserManager';
import LogManager from './components/LogManager';

type View = 'overview' | 'questions' | 'ai-gen' | 'comments' | 'users' | 'logs';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { id: 'overview', name: 'Overview', icon: <Icons.Overview /> },
    { id: 'questions', name: '질문 관리', icon: <Icons.Question /> },
    { id: 'ai-gen', name: 'AI 생성 연구소', icon: <Icons.AI /> },
    { id: 'comments', name: '댓글 관리', icon: <Icons.Comment /> },
    { id: 'users', name: '사용자 관리', icon: <Icons.User /> },
    { id: 'logs', name: '운영 로그', icon: <Icons.Log /> },
  ];

  return (
    <div className="flex min-h-screen bg-[#F9F9F9]">
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        } bg-white border-r border-gray-200 flex flex-col fixed inset-y-0 z-50 transition-all duration-300 ease-in-out
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className={`flex items-center gap-3 overflow-hidden ${isSidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'} transition-opacity duration-200`}>
            <div className="w-8 h-8 bg-black rounded flex items-center justify-center text-white font-bold text-lg flex-shrink-0">If</div>
            <span className="text-xl font-bold tracking-tight whitespace-nowrap">U Lab</span>
          </div>
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
          >
            {isSidebarCollapsed ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
            )}
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-x-hidden">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentView(item.id as View);
                setIsMobileSidebarOpen(false);
              }}
              title={isSidebarCollapsed ? item.name : ''}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                currentView === item.id
                ? 'bg-black text-white shadow-lg shadow-black/20'
                : 'text-gray-500 hover:bg-gray-50 hover:text-black'
              }`}
            >
              <div className="flex-shrink-0">{item.icon}</div>
              {!isSidebarCollapsed && <span className="font-medium whitespace-nowrap">{item.name}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className={`flex items-center gap-3 px-2 py-2 overflow-hidden`}>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold flex-shrink-0">A</div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold truncate">Master Admin</span>
                <span className="text-xs text-gray-400 truncate">iflab.info@gmail.com</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'} flex-1 p-4 sm:p-6 lg:p-8 transition-all duration-300`}>
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 lg:mb-8">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {menuItems.find(m => m.id === currentView)?.name}
              </h1>
              <p className="text-gray-500 text-xs sm:text-sm mt-1 uppercase tracking-wider font-semibold">
                Admin Control Panel / {currentView}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 relative w-full sm:w-auto justify-end">
            <div className="hidden sm:flex bg-white border border-gray-200 rounded-xl px-3 sm:px-4 py-2 items-center gap-2 sm:gap-3 shadow-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] sm:text-xs font-bold text-gray-500 hidden md:inline">SYSTEM ONLINE</span>
            </div>

            <div ref={notificationRef}>
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className={`p-2 rounded-xl text-gray-400 relative bg-white border border-gray-200 shadow-sm transition-all hover:bg-gray-50 ${isNotificationOpen ? 'ring-2 ring-black border-black text-black' : ''}`}
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>

              {/* Notification Popover */}
              {isNotificationOpen && (
                <div className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 mt-3 sm:w-80 bg-white rounded-2xl border border-gray-100 shadow-2xl z-[100] animate-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                    <h4 className="font-bold text-sm">알림 및 이슈</h4>
                    <span className="text-[10px] bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-bold">2 NEW</span>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    <div className="p-4 hover:bg-gray-50 border-b border-gray-50 cursor-pointer transition-colors">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500 flex-shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">미확인 신고 발생</p>
                          <p className="text-[11px] text-gray-500 mt-0.5">'라면 vs 치킨' 댓글에 신고 15건이 누적되었습니다.</p>
                          <p className="text-[9px] text-gray-400 mt-1">방금 전</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 hover:bg-gray-50 border-b border-gray-50 cursor-pointer transition-colors">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 flex-shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">AI 질문 자동 생성 완료</p>
                          <p className="text-[11px] text-gray-500 mt-0.5">다음 주 7일치 트렌드 질문이 연구소에 대기 중입니다.</p>
                          <p className="text-[9px] text-gray-400 mt-1">15분 전</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 text-center">
                    <button onClick={() => setCurrentView('logs')} className="text-[11px] font-bold text-gray-400 hover:text-black">모든 로그 보기</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {currentView === 'overview' && <Dashboard />}
          {currentView === 'questions' && <QuestionManager />}
          {currentView === 'ai-gen' && <AIGenerator />}
          {currentView === 'comments' && <CommentManager />}
          {currentView === 'users' && <UserManager />}
          {currentView === 'logs' && <LogManager />}
        </div>
      </main>
    </div>
  );
};

export default App;

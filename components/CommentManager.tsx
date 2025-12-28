
import React, { useState } from 'react';
import { Comment } from '../types';

const INITIAL_MOCK_COMMENTS: Comment[] = [
  { id: 1, questionId: 1, username: 'user123', content: '이건 정말 좋은 질문이네요!', reportCount: 0, isDeleted: false, createdAt: '2023-12-20' },
  { id: 2, questionId: 1, username: 'bad_guy', content: '욕설이 포함된 댓글입니다. 정말 기분 나쁘네요.', reportCount: 15, isDeleted: false, createdAt: '2023-12-20' },
  { id: 3, questionId: 2, username: 'anonymous', content: '논쟁의 소지가 있네요. 저는 B가 맞다고 봅니다.', reportCount: 5, isDeleted: false, createdAt: '2023-12-21' },
  { id: 4, questionId: 1, username: 'good_user', content: '저는 치킨을 선택하겠습니다. 왜냐면 맛있으니까요.', reportCount: 0, isDeleted: false, createdAt: '2023-12-20', parentId: 2 },
  { id: 5, questionId: 1, username: 'replier', content: '맞아요 치킨이 진리죠!', reportCount: 0, isDeleted: false, createdAt: '2023-12-20', parentId: 4 },
];

const CommentManager: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>(INITIAL_MOCK_COMMENTS);
  const [filter, setFilter] = useState<'all' | 'reported'>('all');
  const [threadViewId, setThreadViewId] = useState<number | null>(null);

  const toggleSoftDelete = (id: number) => {
    setComments(comments.map(c => c.id === id ? { ...c, isDeleted: !c.isDeleted } : c));
  };

  const activeComments = comments; // 관리자는 삭제된 것도 다 봐야 함
  const filteredComments = filter === 'reported'
    ? activeComments.filter(c => c.reportCount >= 3)
    : activeComments;

  // 맥락(Thread) 데이터 추출
  const getThread = (commentId: number) => {
    const thread: Comment[] = [];
    let current = comments.find(c => c.id === commentId);

    // 조상 찾기 (최대 1단계 위만 단순화)
    if (current?.parentId) {
      const parent = comments.find(c => c.id === current?.parentId);
      if (parent) thread.push(parent);
    }

    if (current) thread.push(current);

    // 자식 찾기
    const children = comments.filter(c => c.parentId === commentId);
    thread.push(...children);

    return thread;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-black">
          <p className="text-gray-400 text-[10px] sm:text-xs font-bold uppercase mb-1">전체 활성 댓글</p>
          <h3 className="text-xl sm:text-2xl font-bold">{activeComments.filter(c => !c.isDeleted).length}건</h3>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-red-500">
          <p className="text-gray-400 text-[10px] sm:text-xs font-bold uppercase mb-1">검토 필요 (신고 3회+)</p>
          <h3 className="text-xl sm:text-2xl font-bold text-red-500">{activeComments.filter(c => c.reportCount >= 3 && !c.isDeleted).length}건</h3>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-blue-500">
          <p className="text-gray-400 text-[10px] sm:text-xs font-bold uppercase mb-1">최근 24시간 작성</p>
          <h3 className="text-xl sm:text-2xl font-bold text-blue-500">128건</h3>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 bg-gray-50/50">
          <h3 className="font-bold text-sm sm:text-base">최근 댓글 피드</h3>
          <div className="flex bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
            <button 
              onClick={() => setFilter('all')}
              className={`text-[11px] font-bold px-4 py-1.5 rounded-lg transition-all ${filter === 'all' ? 'bg-black text-white' : 'text-gray-400'}`}
            >
              전체
            </button>
            <button 
              onClick={() => setFilter('reported')}
              className={`text-[11px] font-bold px-4 py-1.5 rounded-lg transition-all ${filter === 'reported' ? 'bg-red-500 text-white' : 'text-gray-400'}`}
            >
              신고 우선
            </button>
          </div>
        </div>
        <div className="divide-y divide-gray-50">
          {filteredComments.sort((a,b) => b.reportCount - a.reportCount).map((comment) => (
            <div key={comment.id} className={`p-4 sm:p-6 transition-colors flex items-start gap-3 sm:gap-4 ${comment.isDeleted ? 'bg-gray-50/50 grayscale-[0.5]' : 'hover:bg-gray-50/50'}`}>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-sm sm:text-base text-gray-400 flex-shrink-0">
                {comment.username[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                  <span className={`font-bold text-xs sm:text-sm ${comment.isDeleted ? 'text-gray-400' : 'text-gray-900'}`}>{comment.username}</span>
                  <span className="text-[9px] sm:text-[10px] text-gray-400 tabular-nums">{comment.createdAt}</span>
                  {comment.reportCount > 0 && !comment.isDeleted && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${comment.reportCount >= 10 ? 'bg-red-500 text-white' : 'bg-red-50 text-red-500'}`}>
                      REPORTED {comment.reportCount}
                    </span>
                  )}
                  {comment.isDeleted && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-200 text-gray-500">
                      DELETED BY ADMIN
                    </span>
                  )}
                </div>
                <p className={`text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed ${comment.isDeleted ? 'text-gray-300 line-through' : 'text-gray-600'}`}>
                  {comment.content}
                </p>
                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                  {comment.isDeleted ? (
                    <button onClick={() => toggleSoftDelete(comment.id)} className="text-[10px] sm:text-[11px] font-bold text-blue-500 hover:text-blue-700 transition-colors flex items-center gap-1">
                      <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      삭제 복구
                    </button>
                  ) : (
                    <button onClick={() => toggleSoftDelete(comment.id)} className="text-[10px] sm:text-[11px] font-bold text-red-500 hover:text-red-700 transition-colors flex items-center gap-1">
                      <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      삭제 처리
                    </button>
                  )}
                  <button
                    onClick={() => setThreadViewId(comment.id)}
                    className="text-[10px] sm:text-[11px] font-bold text-gray-400 hover:text-black transition-colors flex items-center gap-1"
                  >
                    <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    맥락 확인
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Thread Viewer Modal */}
      {threadViewId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[80vh]">
            <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-base sm:text-lg font-bold">댓글 맥락 트래킹</h3>
                <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">선택한 댓글의 전후 대화를 확인합니다.</p>
              </div>
              <button onClick={() => setThreadViewId(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
              {getThread(threadViewId).map((c, i) => (
                <div
                  key={c.id}
                  className={`relative flex gap-4 p-4 rounded-2xl border transition-all ${
                    c.id === threadViewId
                      ? 'bg-white border-black shadow-lg scale-105 z-10'
                      : 'bg-white/60 border-gray-100 opacity-60'
                  }`}
                  style={{ marginLeft: c.parentId ? '2rem' : '0' }}
                >
                  {/* 스레드 연결선 */}
                  {c.parentId && (
                    <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-4 h-px bg-gray-200"></div>
                  )}

                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${c.id === threadViewId ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {c.username[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold">{c.username}</span>
                      <span className="text-[10px] text-gray-400">{c.createdAt}</span>
                    </div>
                    <p className={`text-sm ${c.isDeleted ? 'text-gray-300 line-through' : 'text-gray-600'}`}>
                      {c.content}
                    </p>
                    {c.isDeleted && (
                      <div className="mt-2 text-[10px] text-red-400 font-bold uppercase">Admin Deleted</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-white border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setThreadViewId(null)}
                className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-black transition-colors"
              >
                닫기
              </button>
              {comments.find(c => c.id === threadViewId)?.isDeleted ? (
                <button 
                  onClick={() => { toggleSoftDelete(threadViewId); setThreadViewId(null); }}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                >
                  오해였음 (복구하기)
                </button>
              ) : (
                <button 
                  onClick={() => { toggleSoftDelete(threadViewId); setThreadViewId(null); }}
                  className="px-6 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                >
                  잘못 확인 (삭제하기)
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentManager;

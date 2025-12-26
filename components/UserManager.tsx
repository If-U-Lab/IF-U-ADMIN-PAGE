
import React, { useState } from 'react';
import { User } from '../types';

const INITIAL_MOCK_USERS: User[] = [
  { id: 1, username: 'user123', status: 'normal', suspendedUntil: null, reportTotal: 2, joinedAt: '2023-01-15', votes: 45, comments: 23 },
  { id: 2, username: 'troll_master', status: 'suspended', suspendedUntil: '2023-12-30', reportTotal: 28, joinedAt: '2023-05-10', votes: 12, comments: 156 },
  { id: 3, username: 'active_voter', status: 'normal', suspendedUntil: null, reportTotal: 0, joinedAt: '2023-11-01', votes: 890, comments: 5 },
];

const UserManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>(INITIAL_MOCK_USERS);
  const [filter, setFilter] = useState<'all' | 'reported' | 'suspended'>('all');

  const filteredUsers = users.filter(user => {
    if (filter === 'reported') return user.reportTotal > 5;
    if (filter === 'suspended') return user.status === 'suspended';
    return true;
  });

  const toggleStatus = (id: number) => {
    setUsers(users.map(u => {
      if (u.id === id) {
        const isSuspending = u.status === 'normal';
        return {
          ...u,
          status: isSuspending ? 'suspended' : 'normal',
          suspendedUntil: isSuspending ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null
        };
      }
      return u;
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div className="flex gap-4">
          <button onClick={() => setFilter('all')} className={`text-sm font-bold px-4 py-2 rounded-xl transition-all ${filter === 'all' ? 'bg-black text-white' : 'text-gray-400 hover:text-black'}`}>전체</button>
          <button onClick={() => setFilter('reported')} className={`text-sm font-bold px-4 py-2 rounded-xl transition-all ${filter === 'reported' ? 'bg-black text-white' : 'text-gray-400 hover:text-black'}`}>신고 누적</button>
          <button onClick={() => setFilter('suspended')} className={`text-sm font-bold px-4 py-2 rounded-xl transition-all ${filter === 'suspended' ? 'bg-black text-white' : 'text-gray-400 hover:text-black'}`}>정지 상태</button>
        </div>
        <div className="relative">
          <input type="text" placeholder="사용자 검색..." className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-black outline-none" />
          <svg className="w-4 h-4 absolute left-4 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">사용자</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">가입일</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">상태</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">투표/댓글</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">신고수</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-center">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-sm">{user.username}</div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">ID: {user.id}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 tabular-nums">{user.joinedAt}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-bold inline-block min-w-[60px] text-center ${
                    user.status === 'normal' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {user.status === 'normal' ? '정상' : '정지'}
                  </span>
                  {user.status === 'suspended' && (
                    <div className="text-[9px] text-red-400 mt-1 font-semibold">~{user.suspendedUntil}</div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-right text-gray-500 tabular-nums">
                  {user.votes} / {user.comments}
                </td>
                <td className="px-6 py-4 text-sm text-right font-bold text-red-500 tabular-nums">
                  {user.reportTotal > 0 ? user.reportTotal : '-'}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button 
                      onClick={() => toggleStatus(user.id)}
                      title={user.status === 'normal' ? '정지하기' : '해제하기'}
                      className={`p-2 rounded-xl transition-all ${
                        user.status === 'normal' 
                        ? 'hover:bg-red-50 text-red-500 border border-transparent hover:border-red-100' 
                        : 'hover:bg-green-50 text-green-600 border border-transparent hover:border-green-100'
                      }`}
                    >
                      {user.status === 'normal' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      )}
                    </button>
                    <button className="p-2 hover:bg-gray-100 text-gray-400 rounded-xl transition-all border border-transparent hover:border-gray-200">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManager;


import React from 'react';
import { AdminLog } from '../types';

const MOCK_LOGS: AdminLog[] = [
  { id: 'L001', adminId: 'master', actionType: '질문 수정', targetId: 'Q001', description: '라면 vs 치킨 오타 수정', createdAt: '2023-12-20 14:30:22' },
  { id: 'L002', adminId: 'master', actionType: '사용자 정지', targetId: 'U002', description: '반복적인 욕설로 인한 7일 정지', createdAt: '2023-12-20 12:15:05' },
  { id: 'L003', adminId: 'sub_admin', actionType: '질문 생성', targetId: 'Q003', description: 'AI를 통한 신규 질문 생성 및 적재', createdAt: '2023-12-19 18:45:12' },
];

const LogManager: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-bold">시스템 로그</h3>
        <button className="text-xs font-bold text-blue-600 hover:underline">CSV 내보내기</button>
      </div>
      <div className="divide-y divide-gray-50">
        {MOCK_LOGS.map((log) => (
          <div key={log.id} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                  log.actionType === '사용자 정지' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  {log.actionType}
                </span>
                <span className="text-sm font-bold text-gray-900">{log.adminId}</span>
              </div>
              <span className="text-xs text-gray-400 tabular-nums">{log.createdAt}</span>
            </div>
            <p className="text-sm text-gray-600">{log.description}</p>
            <div className="mt-2 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
              Target ID: {log.targetId}
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
        <button className="text-sm font-bold text-gray-500 hover:text-black">과거 로그 더보기</button>
      </div>
    </div>
  );
};

export default LogManager;

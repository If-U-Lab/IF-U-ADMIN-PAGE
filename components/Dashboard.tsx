
import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const chartDataSets = {
  '1d': [
    { name: '00시', users: 400, active: 300, prev: 350 },
    { name: '04시', users: 200, active: 150, prev: 180 },
    { name: '08시', users: 800, active: 600, prev: 700 },
    { name: '12시', users: 1500, active: 1200, prev: 1300 },
    { name: '16시', users: 1800, active: 1400, prev: 1600 },
    { name: '20시', users: 2400, active: 2000, prev: 2100 },
    { name: '24시', users: 1200, active: 900, prev: 1000 },
  ],
  '7d': [
    { name: '월', users: 2100, active: 1800, prev: 1900 },
    { name: '화', users: 2400, active: 1750, prev: 2000 },
    { name: '수', users: 2200, active: 1900, prev: 2100 },
    { name: '목', users: 2800, active: 2300, prev: 2050 },
    { name: '금', users: 2300, active: 2100, prev: 2200 },
    { name: '토', users: 2700, active: 1850, prev: 2400 },
    { name: '일', users: 2950, active: 2200, prev: 2300 },
  ],
  '30d': [
    { name: '1주', users: 12000, active: 9000, prev: 11000 },
    { name: '2주', users: 15000, active: 11000, prev: 13000 },
    { name: '3주', users: 14000, active: 10500, prev: 12500 },
    { name: '4주', users: 18000, active: 14000, prev: 16000 },
  ]
};

const KPICard: React.FC<{ title: string; value: string; trend: string; isUp: boolean }> = ({ title, value, trend, isUp }) => (
  <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
    <p className="text-gray-400 text-xs sm:text-sm font-medium">{title}</p>
    <div className="flex items-baseline gap-2 mt-2">
      <h3 className="text-2xl sm:text-3xl font-bold">{value}</h3>
      <span className={`text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full ${isUp ? 'text-blue-600 bg-blue-50' : 'text-red-600 bg-red-50'}`}>
        {isUp ? '▲' : '▼'} {trend}%
      </span>
    </div>
    <p className="text-[10px] sm:text-xs text-gray-400 mt-2">전주 대비</p>
  </div>
);

const RankingCard: React.FC<{ rank: number; title: string; category: string; score: number }> = ({ rank, title, category, score }) => (
  <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-gray-50 transition-colors rounded-xl">
    <div className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg font-bold text-base sm:text-lg ${rank === 1 ? 'bg-black text-white' : 'text-gray-400'}`}>
      {rank}
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-semibold text-xs sm:text-sm truncate">{title}</h4>
      <span className="text-[10px] sm:text-xs text-gray-400">{category}</span>
    </div>
    <div className="text-right">
      <span className="text-xs sm:text-sm font-bold text-blue-600">{score.toLocaleString()}</span>
      <p className="text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-wider hidden sm:block">Dopamine Score</p>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const [period, setPeriod] = useState<keyof typeof chartDataSets>('7d');

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <KPICard title="신규 가입 사용자" value="2,341" trend="12.5" isUp={true} />
        <KPICard title="일간 활성 사용자" value="8,234" trend="8.2" isUp={true} />
        <KPICard title="총 투표 수" value="34,521" trend="15.3" isUp={true} />
        <KPICard title="총 댓글 수" value="12,876" trend="5.8" isUp={true} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Charts */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-6">
              <h3 className="font-bold text-base sm:text-lg">사용자 추이</h3>
              <div className="flex gap-1 sm:gap-2 bg-gray-50 p-1 rounded-xl">
                {(['1d', '7d', '30d'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`text-[10px] sm:text-xs px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg font-bold transition-all ${
                      period === p ? 'bg-white shadow-sm text-black' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {p === '1d' ? '1일' : p === '7d' ? '7일' : '30일'}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[200px] sm:h-[250px] lg:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartDataSets[period]}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#007AFF" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#007AFF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#A0A0A0'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#A0A0A0'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="users" stroke="#007AFF" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                  <Area type="monotone" dataKey="prev" stroke="#E5E5E5" strokeWidth={2} strokeDasharray="5 5" fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-base sm:text-lg">활성 사용자 분석</h3>
            </div>
            <div className="h-[200px] sm:h-[250px] lg:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartDataSets[period]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#A0A0A0'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#A0A0A0'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="active" stroke="#000000" strokeWidth={3} dot={{ r: 4, fill: '#000', strokeWidth: 2, stroke: '#FFF' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6 sm:space-y-8">
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-base sm:text-lg mb-4 sm:mb-6">🔥 도파민 랭킹</h3>
            <div className="space-y-3 sm:space-y-4">
              <RankingCard rank={1} title="평생 라면만 먹기 vs 평생 치킨만 먹기" category="가치관" score={9824} />
              <RankingCard rank={2} title="100억 받고 감옥 5년 vs 그냥 살기" category="사회" score={8542} />
              <RankingCard rank={3} title="썸 탈 때 고백은 남자가? 여자가?" category="연애" score={7219} />
              <button className="w-full mt-3 sm:mt-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-gray-500 hover:text-black transition-colors">
                순위 더보기 →
              </button>
            </div>
          </div>

          <div className="bg-black text-white p-4 sm:p-6 rounded-2xl shadow-xl">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-base sm:text-lg">인기 카테고리</h3>
                <p className="text-gray-400 text-xs sm:text-sm mt-1">현재 가장 뜨거운 주제</p>
              </div>
              <span className="bg-red-500 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">HOT</span>
            </div>
            <div className="mt-6 sm:mt-8">
              <span className="text-2xl sm:text-3xl lg:text-4xl font-bold">시사/사회</span>
            </div>
            <div className="mt-3 sm:mt-4 flex items-center gap-2 text-xs sm:text-sm text-gray-400">
              <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-black bg-gray-700" />
                ))}
              </div>
              <span>1.2k+ 실시간 참여중</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

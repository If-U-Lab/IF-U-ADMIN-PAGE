
import React, { useState } from 'react';
import { generateDiverseQuestion, researchAndBatchGenerate } from '../services/geminiService';
import { AIGeneratedQuestion } from '../types';
import { Icons } from '../constants';

const AIGenerator: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<AIGeneratedQuestion[]>([]);
  const [activeTab, setActiveTab] = useState<'manual' | 'auto'>('manual');

  const handleManualGenerate = async () => {
    if (!keyword.trim()) return;
    setIsGenerating(true);

    // 고도화된 질문 생성 (다양성 검증 포함)
    const data = await generateDiverseQuestion(keyword);

    if (data) {
      setResults([data, ...results]);
      console.log('[질문 생성 성공]', {
        title: data.title,
        dna: data.dna,
        triggers: data.triggers
      });
    } else {
      alert('질문 생성에 실패했습니다. 다양성 기준을 만족하는 질문을 생성할 수 없습니다. 다른 키워드를 시도해보세요.');
    }

    setIsGenerating(false);
    setKeyword('');
  };

  const handleAutoResearch = async () => {
    setIsGenerating(true);
    const batch = await researchAndBatchGenerate();
    setResults([...batch, ...results]);
    setIsGenerating(false);
  };

  const updateResult = (index: number, updated: AIGeneratedQuestion) => {
    const newResults = [...results];
    newResults[index] = updated;
    setResults(newResults);
  };

  const removeResult = (index: number) => {
    setResults(results.filter((_, i) => i !== index));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Control Panel */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-8">
          <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
            <button 
              onClick={() => setActiveTab('manual')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'manual' ? 'bg-white shadow text-black' : 'text-gray-400'}`}
            >
              수동 키워드
            </button>
            <button 
              onClick={() => setActiveTab('auto')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'auto' ? 'bg-white shadow text-black' : 'text-gray-400'}`}
            >
              자동 트렌드 리서치
            </button>
          </div>

          {activeTab === 'manual' ? (
            <div className="space-y-4">
              <textarea
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="이슈 키워드를 입력하세요..."
                className="w-full min-h-[120px] p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none transition-all resize-none text-sm"
              />
              <button
                onClick={handleManualGenerate}
                disabled={isGenerating || !keyword.trim()}
                className="w-full bg-black text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all disabled:bg-gray-200"
              >
                {isGenerating ? '생성 중...' : '질문 1개 생성'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-blue-700">
                <p className="text-xs font-bold mb-1">AI 트렌드 봇 활성화 (gemini-2.5-flash-lite)</p>
                <p className="text-[11px] opacity-80 leading-relaxed">
                  한국 온라인 커뮤니티 트렌드를 기반으로 논쟁적인 7일치 질문을 자동으로 생성합니다.
                </p>
              </div>
              <button
                onClick={handleAutoResearch}
                disabled={isGenerating}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all disabled:bg-gray-200 disabled:text-gray-400"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>생성 중...</span>
                  </>
                ) : (
                  <>
                    <Icons.AI />
                    <span>7일치 리서치 & 생성</span>
                  </>
                )}
              </button>
            </div>
          )}
          <div className="mt-6 bg-black text-white p-6 rounded-2xl shadow-xl">
            <h4 className="font-bold text-xs uppercase text-gray-400 mb-1">대기 중인 질문</h4>
            <div className="text-3xl font-bold">{results.length} 건</div>
          </div>
        </div>
      </div>

      {/* Results List - Updated to allow natural card expansion */}
      <div className="lg:col-span-8 space-y-6">
        {results.length > 0 ? (
          results.map((item, idx) => (
            <div 
              key={idx} 
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-black/10 transition-all animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-2">
                  <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-1 rounded">#{idx + 1}</span>
                  <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded">{item.category}</span>
                </div>
                <button 
                  onClick={() => removeResult(idx)}
                  className="p-1.5 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <input 
                    className="w-full text-xl font-bold border-none focus:ring-0 outline-none p-0 bg-transparent"
                    value={item.title}
                    onChange={(e) => updateResult(idx, {...item, title: e.target.value})}
                  />
                </div>
                <div>
                  {/* Card Height Auto Expansion - Removed fixed heights and internal scroll */}
                  <textarea 
                    className="w-full text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border-none focus:ring-1 focus:ring-gray-100 outline-none resize-none overflow-hidden"
                    value={item.description}
                    rows={item.description.split('\n').length + 1}
                    style={{ height: 'auto', minHeight: '80px' }}
                    onChange={(e) => {
                      updateResult(idx, {...item, description: e.target.value});
                    }}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs flex-shrink-0">A</div>
                    <input
                      className="flex-1 text-sm font-semibold bg-transparent border-none focus:ring-0"
                      value={item.optionA}
                      onChange={(e) => updateResult(idx, {...item, optionA: e.target.value})}
                    />
                  </div>
                  <div className="flex items-center gap-3 bg-red-50/50 p-3 rounded-xl border border-red-100/50">
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs flex-shrink-0">B</div>
                    <input
                      className="flex-1 text-sm font-semibold bg-transparent border-none focus:ring-0"
                      value={item.optionB}
                      onChange={(e) => updateResult(idx, {...item, optionB: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between pt-4 border-t border-gray-50 gap-4">
                <div className="flex items-center gap-2 text-[11px] text-blue-500 font-bold italic bg-blue-50 px-3 py-1 rounded-lg">
                  <Icons.AI />
                  <span>DOPAMINE INSIGHT: "{item.dopaminePreview}"</span>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <button 
                    onClick={() => {
                      alert('DB에 적재되었습니다!');
                      removeResult(idx);
                    }}
                    className="flex-1 md:flex-none px-6 py-2.5 bg-black text-white rounded-xl text-xs font-bold hover:bg-gray-800 shadow-lg shadow-black/10 transition-all"
                  >
                    적재 승인
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="h-64 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 bg-white shadow-inner">
            <Icons.AI />
            <p className="mt-4 font-bold text-gray-500">생성된 질문이 없습니다.</p>
            <p className="text-xs text-gray-400">자동 트렌드 리서치를 통해 7일치 도파민을 충전하세요.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIGenerator;

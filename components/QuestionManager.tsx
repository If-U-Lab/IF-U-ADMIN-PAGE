
import React, { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, useDraggable, useDroppable } from '@dnd-kit/core';
import { QuestionStatus, QuestionCategory, Question } from '../types';

const INITIAL_MOCK_QUESTIONS: Question[] = [
  // Scheduled questions
  {
    id: 1,
    title: '라면 vs 치킨',
    description: '평생 하나만 먹는다면?',
    choice_1: '라면',
    choice_2: '치킨',
    category: QuestionCategory.VALUES,
    status: QuestionStatus.PUBLISHED,
    publish_at: '2025-12-25T09:00:00+09:00',
    close_at: '2025-12-25T23:59:59+09:00',
    notification_sent_at: '2025-12-25T08:50:00+09:00',
    isDeleted: false,
    createdAt: '2025-12-20',
    views: 1200,
    dopamine_score: 95,
    tags: ['음식', '밸런스']
  },
  {
    id: 2,
    title: '연봉 1억 vs 저녁',
    description: '당신의 선택은?',
    choice_1: '연봉 1억 (야근)',
    choice_2: '연봉 5천 (칼퇴)',
    category: QuestionCategory.WORKPLACE,
    status: QuestionStatus.DRAFT,
    publish_at: '2025-12-30T09:00:00+09:00',
    close_at: '2025-12-30T23:59:59+09:00',
    notification_sent_at: null,
    isDeleted: false,
    createdAt: '2025-12-22',
    dopamine_score: 88
  },
  // Unscheduled questions (status=DRAFT AND publish_at=null)
  {
    id: 3,
    title: '고양이 vs 강아지',
    description: '평생 키운다면?',
    choice_1: '고양이 (츤데레)',
    choice_2: '강아지 (충성)',
    category: QuestionCategory.LEISURE,
    status: QuestionStatus.DRAFT,
    publish_at: null,
    close_at: null,
    notification_sent_at: null,
    isDeleted: false,
    createdAt: '2025-12-23',
    dopamine_score: 92
  },
  {
    id: 4,
    title: '서울 vs 지방',
    description: '살기 좋은 곳은?',
    choice_1: '서울 (기회)',
    choice_2: '지방 (여유)',
    category: QuestionCategory.SOCIAL,
    status: QuestionStatus.DRAFT,
    publish_at: null,
    close_at: null,
    notification_sent_at: null,
    isDeleted: false,
    createdAt: '2025-12-23',
    dopamine_score: 85
  },
  {
    id: 5,
    title: '아이폰 vs 갤럭시',
    description: '평생 하나만 쓴다면?',
    choice_1: '아이폰',
    choice_2: '갤럭시',
    category: QuestionCategory.TECHNOLOGY,
    status: QuestionStatus.DRAFT,
    publish_at: null,
    close_at: null,
    notification_sent_at: null,
    isDeleted: false,
    createdAt: '2025-12-24',
    dopamine_score: 90
  },
  {
    id: 6,
    title: '현금 vs 카드',
    description: '어느 쪽이 더 좋나?',
    choice_1: '현금',
    choice_2: '카드',
    category: QuestionCategory.MONEY,
    status: QuestionStatus.DRAFT,
    publish_at: null,
    close_at: null,
    notification_sent_at: null,
    isDeleted: false,
    createdAt: '2025-12-24',
    dopamine_score: 78
  },
  {
    id: 7,
    title: '아침형 vs 저녁형',
    description: '당신의 타입은?',
    choice_1: '아침형 인간',
    choice_2: '저녁형 인간',
    category: QuestionCategory.VALUES,
    status: QuestionStatus.DRAFT,
    publish_at: null,
    close_at: null,
    notification_sent_at: null,
    isDeleted: false,
    createdAt: '2025-12-25',
    dopamine_score: 82
  }
];

const QuestionManager: React.FC = () => {
  // Initialize with current date
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed

  const [questions, setQuestions] = useState<Question[]>(INITIAL_MOCK_QUESTIONS);
  const [selectedDate, setSelectedDate] = useState<string>(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  );
  const [isEditing, setIsEditing] = useState(false);
  const [activeDragId, setActiveDragId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [statusFilter, setStatusFilter] = useState<QuestionStatus | '전체'>('전체');

  // Unscheduled questions: status=DRAFT AND publish_at=null
  const unscheduledQuestions = questions.filter(
    q => q.status === QuestionStatus.DRAFT && q.publish_at === null && !q.isDeleted
  );

  // Get question for selected date
  const selectedDateQuestion = questions.find(
    q => q.publish_at?.startsWith(selectedDate) && !q.isDeleted
  );

  // Filtered questions for list view
  const filteredQuestions = questions.filter(q =>
    (statusFilter === '전체' || q.status === statusFilter) && !q.isDeleted
  );

  // Calendar logic
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const offset = firstDayOfMonth(currentYear, currentMonth);

  // Today's date string for highlighting
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Calendar navigation
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDate(todayString);
  };

  // Month names in Korean
  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

  // Drag and drop handlers
  const handleDragStart = (event: any) => {
    setActiveDragId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (!over) return;

    const questionId = active.id as number;
    const targetDate = over.id as string;

    // Update question with new publish_at
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          publish_at: `${targetDate}T09:00:00+09:00`,
          close_at: `${targetDate}T23:59:59+09:00`
        };
      }
      return q;
    }));

    // Select the date where we just dropped
    setSelectedDate(targetDate);
    console.log(`Question ${questionId} scheduled for ${targetDate}`);
  };

  // Update selected question
  const updateSelectedQuestion = (updates: Partial<Question>) => {
    if (!selectedDateQuestion) return;

    setQuestions(questions.map(q =>
      q.id === selectedDateQuestion.id ? { ...q, ...updates } : q
    ));
  };

  const saveEdit = () => {
    setIsEditing(false);
    console.log('Changes saved:', selectedDateQuestion);
  };

  const deleteQuestion = (id: number) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      setQuestions(questions.map(q => q.id === id ? { ...q, isDeleted: true } : q));
    }
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="space-y-4 sm:space-y-6">
        {/* Header Controls */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
          <div className="flex gap-2 bg-gray-50 p-1 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                viewMode === 'calendar' ? 'bg-white shadow-md text-black' : 'text-gray-400'
              }`}
            >
              캘린더
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                viewMode === 'list' ? 'bg-white shadow-md text-black' : 'text-gray-400'
              }`}
            >
              리스트
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1">
            <div className="flex items-center gap-2 flex-nowrap">
              {['전체', ...Object.values(QuestionStatus)].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status as any)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap ${
                    statusFilter === status ? 'bg-black text-white' : 'bg-white border border-gray-200 text-gray-500'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {viewMode === 'calendar' ? (
          <>
        {/* Main Layout: Calendar (left) + Detail Panel (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Calendar Section - Compact */}
          <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
            {/* Calendar Header with Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold">{currentYear}년 {monthNames[currentMonth]}</h3>
                <button
                  onClick={goToToday}
                  className="text-xs font-bold px-3 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all"
                >
                  오늘
                </button>
              </div>

              <button
                onClick={goToNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-xl overflow-hidden border border-gray-100">
              {['일', '월', '화', '수', '목', '금', '토'].map(d => (
                <div key={d} className="bg-gray-50 p-2 text-center text-[10px] font-bold text-gray-400 uppercase">{d}</div>
              ))}
              {Array.from({ length: 42 }).map((_, i) => {
                const dayNumber = i - offset + 1;
                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
                const dayQuestion = questions.find(q => q.publish_at?.startsWith(dateStr) && !q.isDeleted);
                const isCurrent = dayNumber > 0 && dayNumber <= daysInMonth;
                const isToday = dateStr === todayString;

                return (
                  <CalendarDay
                    key={i}
                    dateStr={dateStr}
                    dayNumber={dayNumber}
                    isCurrent={isCurrent}
                    isToday={isToday}
                    question={dayQuestion}
                    isSelected={selectedDate === dateStr}
                    onSelect={() => isCurrent && setSelectedDate(dateStr)}
                  />
                );
              })}
            </div>
          </div>

          {/* Detail Panel - Inline Editing */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm h-fit lg:sticky lg:top-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-xs sm:text-sm text-gray-400">{selectedDate} 질문</h4>
              {selectedDateQuestion && (
                <button
                  onClick={() => isEditing ? saveEdit() : setIsEditing(true)}
                  className={`text-xs font-bold px-3 py-1 rounded-lg transition-all ${
                    isEditing ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {isEditing ? '저장' : '편집'}
                </button>
              )}
            </div>

            {selectedDateQuestion ? (
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">제목</label>
                  <input
                    type="text"
                    value={selectedDateQuestion.title}
                    onChange={e => updateSelectedQuestion({ title: e.target.value })}
                    disabled={!isEditing}
                    className="w-full p-2 text-sm font-bold border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none disabled:bg-gray-50 disabled:text-gray-600"
                    maxLength={20}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">설명</label>
                  <textarea
                    value={selectedDateQuestion.description}
                    onChange={e => updateSelectedQuestion({ description: e.target.value })}
                    disabled={!isEditing}
                    className="w-full p-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none disabled:bg-gray-50 disabled:text-gray-600 resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">선택지 A</label>
                  <input
                    type="text"
                    value={selectedDateQuestion.choice_1}
                    onChange={e => updateSelectedQuestion({ choice_1: e.target.value })}
                    disabled={!isEditing}
                    className="w-full p-2 text-xs font-semibold border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none disabled:bg-gray-50 disabled:text-gray-600"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">선택지 B</label>
                  <input
                    type="text"
                    value={selectedDateQuestion.choice_2}
                    onChange={e => updateSelectedQuestion({ choice_2: e.target.value })}
                    disabled={!isEditing}
                    className="w-full p-2 text-xs font-semibold border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none disabled:bg-gray-50 disabled:text-gray-600"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">카테고리</label>
                  <select
                    value={selectedDateQuestion.category}
                    onChange={e => updateSelectedQuestion({ category: e.target.value as QuestionCategory })}
                    disabled={!isEditing}
                    className="w-full p-2 text-xs font-bold border border-gray-200 rounded-lg outline-none disabled:bg-gray-50 disabled:text-gray-600"
                  >
                    {Object.values(QuestionCategory).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">상태</label>
                  <select
                    value={selectedDateQuestion.status}
                    onChange={e => updateSelectedQuestion({ status: e.target.value as QuestionStatus })}
                    disabled={!isEditing}
                    className="w-full p-2 text-xs font-bold border border-gray-200 rounded-lg outline-none disabled:bg-gray-50 disabled:text-gray-600"
                  >
                    {Object.values(QuestionStatus).map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <div className="text-[10px] text-gray-400 space-y-1">
                    <div>조회수: <span className="font-bold text-gray-600">{selectedDateQuestion.views || 0}</span></div>
                    <div>도파민: <span className="font-bold text-blue-600">🔥 {selectedDateQuestion.dopamine_score || 0}</span></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p className="text-xs">선택된 날짜에 질문이 없습니다</p>
                <p className="text-[10px] mt-2">아래에서 질문을 드래그하여 배치하세요</p>
              </div>
            )}
          </div>
        </div>

        {/* Unscheduled Questions Pool */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold">일정 미지정 질문</h3>
              <p className="text-[10px] sm:text-xs text-gray-500">드래그하여 캘린더에 배치하세요</p>
            </div>
            <div className="bg-black text-white px-3 sm:px-4 py-2 rounded-xl">
              <span className="text-xl sm:text-2xl font-bold">{unscheduledQuestions.length}</span>
              <span className="text-[10px] sm:text-xs ml-1">건</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {unscheduledQuestions.map(question => (
              <DraggableQuestionCard key={question.id} question={question} />
            ))}
          </div>

          {unscheduledQuestions.length === 0 && (
            <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
              <p className="font-bold">모든 질문이 배치되었습니다</p>
              <p className="text-xs mt-1">새로운 질문을 생성하거나 AI 생성을 이용하세요</p>
            </div>
          )}
        </div>
        </>
        ) : (
          /* List View */
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">제목</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">카테고리</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">상태</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">공개 일시</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">도파민</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-center">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredQuestions.map(q => (
                    <tr key={q.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-sm">{q.title}</div>
                        <div className="text-xs text-gray-400 line-clamp-1">{q.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold px-2 py-1 rounded bg-blue-50 text-blue-600">
                          {q.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                          q.status === QuestionStatus.PUBLISHED ? 'bg-green-50 text-green-600' :
                          q.status === QuestionStatus.CLOSED ? 'bg-gray-100 text-gray-500' :
                          'bg-yellow-50 text-yellow-600'
                        }`}>
                          {q.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 tabular-nums">
                        {q.publish_at ? new Date(q.publish_at).toLocaleString('ko-KR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : (
                          <span className="text-gray-400 italic">미지정</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-right text-blue-600 italic">
                        🔥 {q.dopamine_score || 0}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => {
                              const dateStr = q.publish_at?.split('T')[0] || '2024-05-15';
                              setSelectedDate(dateStr);
                              setViewMode('calendar');
                            }}
                            className="text-gray-400 hover:text-black font-bold text-xs"
                          >
                            EDIT
                          </button>
                          <button
                            onClick={() => deleteQuestion(q.id)}
                            className="text-red-400 hover:text-red-600 font-bold text-xs"
                          >
                            DEL
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredQuestions.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <p className="font-bold">필터에 맞는 질문이 없습니다</p>
                </div>
              )}
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {filteredQuestions.map(q => (
                <div key={q.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm mb-1 line-clamp-2">{q.title}</h3>
                      <p className="text-xs text-gray-500 line-clamp-2">{q.description}</p>
                    </div>
                    <span className="text-xs font-bold text-blue-600 italic whitespace-nowrap">
                      🔥 {q.dopamine_score || 0}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-blue-50 text-blue-600">
                      {q.category}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                      q.status === QuestionStatus.PUBLISHED ? 'bg-green-50 text-green-600' :
                      q.status === QuestionStatus.CLOSED ? 'bg-gray-100 text-gray-500' :
                      'bg-yellow-50 text-yellow-600'
                    }`}>
                      {q.status}
                    </span>
                  </div>

                  <div className="text-xs text-gray-400 mb-3">
                    {q.publish_at ? new Date(q.publish_at).toLocaleString('ko-KR', {
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : '미지정'}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const dateStr = q.publish_at?.split('T')[0] || '2024-05-15';
                        setSelectedDate(dateStr);
                        setViewMode('calendar');
                      }}
                      className="flex-1 py-2 text-xs font-bold text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      편집
                    </button>
                    <button
                      onClick={() => deleteQuestion(q.id)}
                      className="flex-1 py-2 text-xs font-bold text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
              {filteredQuestions.length === 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
                  <p className="font-bold">필터에 맞는 질문이 없습니다</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeDragId ? (
          <div className="bg-white p-4 rounded-xl border-2 border-black shadow-2xl opacity-90">
            <div className="font-bold text-sm">
              {questions.find(q => q.id === activeDragId)?.title}
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

// Calendar Day Component with Droppable
const CalendarDay: React.FC<{
  dateStr: string;
  dayNumber: number;
  isCurrent: boolean;
  isToday: boolean;
  question?: Question;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ dateStr, dayNumber, isCurrent, isToday, question, isSelected, onSelect }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: dateStr,
    disabled: !isCurrent
  });

  return (
    <div
      ref={setNodeRef}
      onClick={onSelect}
      className={`min-h-[70px] p-2 transition-all cursor-pointer relative ${
        isCurrent ? 'bg-white hover:bg-blue-50' : 'bg-gray-50/50 cursor-default'
      } ${isSelected ? 'ring-2 ring-inset ring-black bg-blue-50' : ''} ${
        isOver ? 'bg-blue-100 ring-2 ring-blue-400' : ''
      } ${isToday && !isSelected ? 'ring-2 ring-inset ring-blue-300 bg-blue-50/30' : ''}`}
    >
      {isCurrent && (
        <>
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold ${
              isToday ? 'text-blue-600' : isSelected ? 'text-black' : 'text-gray-400'
            }`}>
              {dayNumber}
            </span>
            {isToday && (
              <span className="text-[8px] font-bold text-blue-600 bg-blue-100 px-1 rounded">
                오늘
              </span>
            )}
          </div>
          {question && (
            <div className="mt-1">
              <div className="text-[9px] bg-blue-500 text-white p-1 rounded truncate font-bold">
                {question.title}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Draggable Question Card Component
const DraggableQuestionCard: React.FC<{ question: Question }> = ({ question }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: question.id
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`bg-white p-4 rounded-xl border-2 border-gray-200 hover:border-black transition-all cursor-move ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-600">
          {question.category}
        </span>
        <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>
      <h4 className="font-bold text-sm mb-1 truncate">{question.title}</h4>
      <p className="text-xs text-gray-500 line-clamp-2 mb-2">{question.description}</p>
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-gray-400">도파민: 🔥 {question.dopamine_score}</span>
      </div>
    </div>
  );
};

export default QuestionManager;

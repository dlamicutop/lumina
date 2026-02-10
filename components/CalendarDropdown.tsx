
import React, { useState, useEffect, useRef } from 'react';
import { DateRange, Bookmark } from '../types';

interface CalendarDropdownProps {
  dateRange: DateRange;
  onChange: (range: DateRange) => void;
  bookmarks: Bookmark[]; // 用于显示哪天有数据
}

type CalendarView = 'days' | 'years';

const CalendarDropdown: React.FC<CalendarDropdownProps> = ({ dateRange, onChange, bookmarks }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 视图状态：'days' (日期) 或 'years' (年份选择)
  const [view, setView] = useState<CalendarView>('days');
  
  // 日历视图当前的年月
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // 年份视图的分页基准年份
  const [yearPageStart, setYearPageStart] = useState(new Date().getFullYear() - 5);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setView('days'); // 关闭时重置回日期视图
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 同步年份分页
  useEffect(() => {
    if (isOpen) {
      setYearPageStart(currentDate.getFullYear() - 5);
    }
  }, [isOpen, currentDate]);

  // 格式化显示的日期文本 (按钮上的)
  const getDisplayText = () => {
    if (!dateRange.start) return '全部时间';
    const startStr = dateRange.start.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
    if (!dateRange.end || dateRange.start.getTime() === dateRange.end.getTime()) {
      return startStr;
    }
    const endStr = dateRange.end.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
    return `${startStr} - ${endStr}`;
  };

  // 切换月份
  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  // 切换年份页 (12年一页)
  const changeYearPage = (offset: number) => {
    setYearPageStart(prev => prev + (offset * 12));
  };

  // 选择年份
  const selectYear = (year: number) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(year);
    setCurrentDate(newDate);
    setView('days'); // 选完年份切回日期选择
  };

  // 获取当前月的所有天
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days = [];
    // 补全前面的空白
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    // 填充日期
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  // 生成年份列表 (4x3网格)
  const getYearsList = () => {
    return Array.from({ length: 12 }, (_, i) => yearPageStart + i);
  };

  // 检查某天是否有书签
  const hasBookmarkOnDate = (date: Date) => {
    return bookmarks.some(b => {
      const bDate = new Date(b.createdAtTimestamp);
      return bDate.getFullYear() === date.getFullYear() &&
             bDate.getMonth() === date.getMonth() &&
             bDate.getDate() === date.getDate();
    });
  };

  // 处理日期点击 (范围选择逻辑)
  const handleDateClick = (date: Date) => {
    // 如果没有开始时间，或者已经有了完整的范围（重置选择）
    if (!dateRange.start || (dateRange.start && dateRange.end)) {
      onChange({ start: date, end: null });
    } else {
      // 已经有开始时间，正在选择结束时间
      if (date < dateRange.start) {
        // 如果点的比开始时间早，把它变成新的开始时间
        onChange({ start: date, end: null });
      } else {
        // 设置结束时间，并设置时间为当天的 23:59:59 以包含全天
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
        onChange({ ...dateRange, end: endDate });
      }
    }
  };

  const isSelected = (date: Date) => {
    if (!dateRange.start) return false;
    const d = date.setHours(0,0,0,0);
    const s = new Date(dateRange.start).setHours(0,0,0,0);
    const e = dateRange.end ? new Date(dateRange.end).setHours(0,0,0,0) : null;
    
    return d === s || (e !== null && d === e);
  };

  const isInRange = (date: Date) => {
    if (!dateRange.start || !dateRange.end) return false;
    const d = date.setHours(0,0,0,0);
    const s = new Date(dateRange.start).setHours(0,0,0,0);
    const e = new Date(dateRange.end).setHours(0,0,0,0);
    return d > s && d < e;
  };

  const clearFilter = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({ start: null, end: null });
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`px-4 py-2.5 rounded-xl shadow-sm text-sm font-medium flex items-center gap-2 transition-all border
          ${isOpen 
            ? 'bg-primary text-white border-primary ring-4 ring-primary/20' 
            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-white dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
          }
        `}
      >
        <span className="material-symbols-outlined text-[20px]">calendar_month</span>
        <span>{getDisplayText()}</span>
        {dateRange.start && (
          <span 
            onClick={clearFilter}
            className="ml-1 w-5 h-5 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">close</span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-14 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-menu border border-slate-100 dark:border-slate-700 p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => view === 'days' ? changeMonth(-1) : changeYearPage(-1)} 
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            
            <button 
              onClick={() => setView(view === 'days' ? 'years' : 'days')}
              className="font-bold text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 px-2 py-1 rounded-md transition-colors flex items-center gap-1"
            >
              <span>
                {view === 'days' 
                  ? currentDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })
                  : `${yearPageStart} - ${yearPageStart + 11}`
                }
              </span>
              <span className="material-symbols-outlined text-sm text-slate-400">
                {view === 'days' ? 'arrow_drop_down' : 'arrow_drop_up'}
              </span>
            </button>
            
            <button 
              onClick={() => view === 'days' ? changeMonth(1) : changeYearPage(1)} 
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>

          {view === 'days' ? (
            <>
              {/* Weekday Header */}
              <div className="grid grid-cols-7 mb-2">
                {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                  <div key={day} className="text-center text-xs font-bold text-slate-400 py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1 h-[190px] content-start">
                {getDaysInMonth().map((date, index) => {
                  if (!date) return <div key={`empty-${index}`} />;
                  
                  const selected = isSelected(date);
                  const range = isInRange(date);
                  const hasData = hasBookmarkOnDate(date);
                  const isToday = new Date().toDateString() === date.toDateString();

                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => handleDateClick(date)}
                      className={`
                        h-8 rounded-lg text-xs font-medium relative transition-all flex flex-col items-center justify-center
                        ${selected 
                          ? 'bg-primary text-white shadow-md shadow-blue-500/30' 
                          : range 
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-primary' 
                            : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }
                        ${isToday && !selected ? 'border border-primary/50 text-primary' : ''}
                      `}
                    >
                      <span className="z-10">{date.getDate()}</span>
                      
                      {/* 极简指示点 */}
                      {hasData && (
                        <span 
                          className={`absolute bottom-1 w-1 h-1 rounded-full transition-colors ${selected ? 'bg-white/70' : 'bg-primary'}`} 
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            /* Years Grid */
            <div className="grid grid-cols-4 gap-2 h-[220px] content-start pt-2">
              {getYearsList().map(year => {
                const isCurrentYear = year === new Date().getFullYear();
                const isSelectedYear = year === currentDate.getFullYear();
                
                return (
                  <button
                    key={year}
                    onClick={() => selectYear(year)}
                    className={`
                      h-10 rounded-xl text-sm font-medium transition-all
                      ${isSelectedYear
                        ? 'bg-primary text-white shadow-md'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }
                      ${isCurrentYear && !isSelectedYear ? 'text-primary border border-primary/30' : ''}
                    `}
                  >
                    {year}
                  </button>
                );
              })}
            </div>
          )}

          {/* Footer Info (Only Clear Button or Placeholder) */}
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700 text-[10px] text-slate-400 flex justify-end items-center h-6">
            {dateRange.start ? (
               <button onClick={clearFilter} className="text-primary hover:underline font-medium">清除筛选</button>
            ) : (
               <span className="opacity-0">Placeholder</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarDropdown;

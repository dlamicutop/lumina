
import React, { useState, useRef, useEffect } from 'react';
import CalendarDropdown from './CalendarDropdown';
import { DateRange, Bookmark } from '../types';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onLogout: () => void;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  bookmarks: Bookmark[];
}

const Header: React.FC<HeaderProps> = ({ 
  searchQuery, 
  onSearchChange, 
  isDarkMode, 
  toggleDarkMode, 
  onLogout,
  dateRange,
  setDateRange,
  bookmarks
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="flex items-center justify-between mb-6 pt-2 px-1 z-30">
      <div className="relative w-96 group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 group-focus-within:text-primary transition-colors">search</span>
        </div>
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="block w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border-none rounded-2xl text-sm shadow-sm placeholder-slate-400 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/40 transition-all" 
          placeholder="搜索书签、标签或网址..." 
        />
      </div>

      <div className="flex items-center gap-4">
        {/* 主题切换按钮 - 样式同步登录页 */}
        <button 
          onClick={toggleDarkMode}
          className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-500 dark:text-yellow-400 hover:text-primary dark:hover:text-yellow-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:scale-110 active:scale-95 group border border-slate-100 dark:border-slate-700"
          title={isDarkMode ? "切换到亮色模式" : "切换到暗色模式"}
        >
          <span className="material-symbols-outlined filled group-hover:rotate-[360deg] transition-transform duration-500 text-[20px]">
            {isDarkMode ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        {/* 替换原有的静态日期显示为日历组件 */}
        <CalendarDropdown 
          dateRange={dateRange}
          onChange={setDateRange}
          bookmarks={bookmarks}
        />
        
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm text-slate-700 dark:text-slate-200 font-bold border-2 border-white dark:border-slate-700 ring-2 ring-primary/20 hover:ring-primary/50 transition-all active:scale-95 cursor-pointer"
          >
            JD
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-12 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-menu border border-slate-100 dark:border-slate-700 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 mb-1">
                <p className="text-sm font-bold text-slate-800 dark:text-white">John Doe</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">demo@lumina.app</p>
              </div>
              
              <button 
                onClick={() => {
                  setIsMenuOpen(false);
                  onLogout();
                }}
                className="w-full text-left px-4 py-2 text-[13px] text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span> 
                退出登录
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

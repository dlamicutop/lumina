
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Bookmark, Folder, ViewMode, Tag, SortOption, SortOrder } from '../types';
import { TAG_COLORS } from '../constants';

interface BookmarkContentProps {
  bookmarks: Bookmark[];
  folders: Folder[];
  viewMode: ViewMode;
  setViewMode: (m: ViewMode) => void;
  sortOption: SortOption;
  setSortOption: (s: SortOption) => void;
  sortOrder: SortOrder;
  setSortOrder: (o: SortOrder) => void;
  selectedFolderId: string;
  onFolderClick: (id: string) => void;
  activeTags: string[];
  onRemoveTag: (tag: string) => void;
  onClearTags: () => void;
  onDeleteBookmark: (id: string) => void;
  onBookmarkClick: (bookmark: Bookmark) => void;
  onOpenNotes: (bookmark: Bookmark) => void;
  onOpenNewBookmark: (folderId?: string) => void; // New prop
  allTags: Tag[];
}

const BookmarkContent: React.FC<BookmarkContentProps> = ({ 
  bookmarks, 
  folders,
  viewMode, 
  setViewMode, 
  sortOption,
  setSortOption,
  sortOrder,
  setSortOrder,
  selectedFolderId,
  onFolderClick,
  activeTags,
  onRemoveTag,
  onClearTags,
  onDeleteBookmark,
  onBookmarkClick,
  onOpenNotes,
  onOpenNewBookmark,
  allTags
}) => {
  const [contextMenu, setContextMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  const selectedFolder = folders.find(f => f.id === selectedFolderId);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // 点击外部关闭排序菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setIsSortMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault(); 
    e.stopPropagation();
    setContextMenu({
      id,
      x: e.clientX,
      y: e.clientY
    });
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setContextMenu(null);
  };
  
  const handleCardClick = (e: React.MouseEvent, bookmark: Bookmark) => {
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onBookmarkClick(bookmark);
  };

  const handleDoubleClick = (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    window.open(url, '_blank');
  };

  const getTagStyles = (tagName: string) => {
    const tag = allTags.find(t => t.name === tagName);
    const colorKey = tag?.color || 'slate';
    return TAG_COLORS[colorKey] || TAG_COLORS.slate;
  };

  const getSortLabel = (option: SortOption) => {
    switch (option) {
        case 'created': return '添加时间';
        case 'frequent': return '经常访问';
        case 'recent': return '最近访问';
        default: return '排序';
    }
  };

  // 辅助函数：切换选项时设置合理的默认排序
  const handleSortOptionChange = (option: SortOption) => {
    setSortOption(option);
    setIsSortMenuOpen(false);
    // 设置默认排序方向
    setSortOrder('desc');
  };

  // 计算面包屑导航路径
  const breadcrumbs = useMemo(() => {
    // 如果选择的是 'all' (根目录)，则不显示面包屑，只显示标题
    if (selectedFolderId === 'all') return [];

    const path: Folder[] = [];
    let current = folders.find(f => f.id === selectedFolderId);
    
    while (current) {
      // 避免把 'all' 加进去，我们在UI上会手动添加一个 Home 图标/链接
      if (current.id === 'all') break;
      
      path.unshift(current);
      
      if (!current.parentId) {
         // 理论上都有 parentId，如果没有，尝试找 root
         break;
      }
      current = folders.find(f => f.id === current?.parentId);
    }
    
    return path;
  }, [selectedFolderId, folders]);

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pb-10 px-1 relative">
      <div className="flex items-end justify-between mb-8">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-soft text-primary flex-shrink-0">
            <span className="material-symbols-outlined text-3xl filled">{selectedFolder?.icon || 'folder'}</span>
          </div>
          <div>
            {/* 动态面包屑 - 仅在非 'all' 状态或有层级时显示 */}
            {selectedFolderId !== 'all' && (
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1 flex-wrap">
                {/* 根目录快速跳转 */}
                <button 
                  onClick={() => onFolderClick('all')}
                  className="flex items-center hover:text-primary transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 rounded px-1 -ml-1"
                >
                  <span className="material-symbols-outlined text-[14px] mr-1">home</span>
                  <span>首页</span>
                </button>
                
                {breadcrumbs.map((folder, index) => (
                  <React.Fragment key={folder.id}>
                    <span className="material-symbols-outlined text-xs text-slate-300">chevron_right</span>
                    <button 
                      onClick={() => onFolderClick(folder.id)}
                      className={`
                        hover:text-primary transition-colors px-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800
                        ${index === breadcrumbs.length - 1 ? 'text-slate-600 dark:text-slate-300 cursor-default pointer-events-none font-extrabold' : 'text-slate-500'}
                      `}
                    >
                      {folder.name}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            )}
            
            {/* 主标题 */}
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
              {selectedFolderId === 'all' ? 'Lumina 书签库' : (selectedFolder?.name || '所有书签')}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* 醒目的新建书签按钮 */}
          <button 
              onClick={() => onOpenNewBookmark(selectedFolderId)}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-light text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 font-bold text-sm"
          >
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span>新建书签</span>
          </button>

          {/* 排序控制组 */}
          <div className="flex items-center bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 p-1">
            {/* 排序菜单 */}
            <div className="relative" ref={sortMenuRef}>
                <button 
                    onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium text-slate-600 dark:text-slate-300 border-r border-slate-100 dark:border-slate-700 mr-1"
                >
                    <span className="material-symbols-outlined text-[18px]">sort</span>
                    <span>{getSortLabel(sortOption)}</span>
                    <span className="material-symbols-outlined text-[16px] text-slate-400">expand_more</span>
                </button>

                {isSortMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-menu border border-slate-100 dark:border-slate-700 z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                        <button onClick={() => handleSortOptionChange('created')} className={`w-full text-left px-4 py-2 text-[13px] flex items-center justify-between ${sortOption === 'created' ? 'text-primary bg-blue-50 dark:bg-blue-900/20' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                            <span>添加时间</span>
                            {sortOption === 'created' && <span className="material-symbols-outlined text-[16px]">check</span>}
                        </button>
                        <button onClick={() => handleSortOptionChange('frequent')} className={`w-full text-left px-4 py-2 text-[13px] flex items-center justify-between ${sortOption === 'frequent' ? 'text-primary bg-blue-50 dark:bg-blue-900/20' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                            <span>经常访问</span>
                            {sortOption === 'frequent' && <span className="material-symbols-outlined text-[16px]">check</span>}
                        </button>
                        <button onClick={() => handleSortOptionChange('recent')} className={`w-full text-left px-4 py-2 text-[13px] flex items-center justify-between ${sortOption === 'recent' ? 'text-primary bg-blue-50 dark:bg-blue-900/20' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                            <span>最近访问</span>
                            {sortOption === 'recent' && <span className="material-symbols-outlined text-[16px]">check</span>}
                        </button>
                    </div>
                )}
            </div>
            
            {/* 升降序切换 */}
            <button 
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-400 hover:text-primary transition-colors flex items-center justify-center"
                title={sortOrder === 'asc' ? "切换为降序" : "切换为升序"}
            >
                <span className="material-symbols-outlined text-[20px]">
                    {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                </span>
            </button>
          </div>

          <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-blue-50 dark:bg-blue-900/40 text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <span className="material-symbols-outlined text-[20px]">grid_view</span>
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-blue-50 dark:bg-blue-900/40 text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <span className="material-symbols-outlined text-[20px]">view_list</span>
            </button>
          </div>
        </div>
      </div>

      {activeTags.length > 0 && (
        <div className="mb-6 flex items-start sm:items-center gap-2 flex-col sm:flex-row">
            <div className="flex items-center gap-2 shrink-0">
                <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">筛选标签:</span>
                {/* 清除全部按钮 */}
                <button 
                    onClick={onClearTags}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                    title="清除所有标签"
                >
                    <span className="material-symbols-outlined text-[14px]">playlist_remove</span>
                    清除
                </button>
                <div className="w-px h-3 bg-slate-300 dark:bg-slate-600 mx-1"></div>
            </div>
            <div className="flex flex-wrap gap-2">
                {activeTags.map(tag => {
                const styles = getTagStyles(tag);
                return (
                    <span key={tag} className={`flex items-center gap-1.5 px-2 py-1 border rounded-lg text-[12px] font-medium ${styles.bg} ${styles.text} ${styles.border}`}>
                    {tag}
                    <button onClick={() => onRemoveTag(tag)} className="hover:opacity-70 flex items-center">
                        <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                    </span>
                );
                })}
            </div>
        </div>
      )}

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {bookmarks.map(bookmark => (
            <div 
              key={bookmark.id} 
              onClick={(e) => handleCardClick(e, bookmark)}
              onDoubleClick={(e) => handleDoubleClick(e, bookmark.url)}
              onContextMenu={(e) => handleContextMenu(e, bookmark.id)}
              className="group glass-panel p-5 rounded-3xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 relative cursor-pointer select-none"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center border border-slate-100 dark:border-slate-800 overflow-hidden group-hover:opacity-80 transition-opacity">
                  {bookmark.favicon ? (
                    <img 
                      src={bookmark.favicon} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                      alt="" 
                    />
                  ) : (
                    <span className="material-symbols-outlined text-slate-400 transition-transform duration-300 group-hover:scale-110">language</span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                    {/* 笔记按钮 */}
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onOpenNotes(bookmark);
                        }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${bookmark.content ? 'bg-blue-50 dark:bg-blue-900/30 text-primary' : 'hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                        title={bookmark.content ? "查看笔记" : "添加笔记"}
                    >
                        <span className={`material-symbols-outlined ${bookmark.content ? 'filled' : ''} text-[18px]`}>article</span>
                    </button>
                    {/* 如果是热门书签，显示小火苗图标 */}
                    {bookmark.visitCount > 10 && (
                        <span className="material-symbols-outlined text-orange-400 text-[18px]" title="热门书签">local_fire_department</span>
                    )}
                </div>
              </div>
              <h3 className="block font-bold text-slate-800 dark:text-white text-base mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                {bookmark.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-3 h-[60px] leading-5">
                {bookmark.description || '暂无描述'}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {bookmark.tags.slice(0, 2).map(tag => {
                    const styles = getTagStyles(tag);
                    return (
                      <span key={tag} className={`px-1.5 py-0.5 rounded-md border text-[10px] font-bold ${styles.bg} ${styles.text} ${styles.border} transition-transform duration-300 group-hover:scale-110 origin-left`}>
                        {tag}
                      </span>
                    );
                  })}
                  {bookmark.tags.length > 2 && <span className="text-[10px] text-slate-400">+{bookmark.tags.length - 2}</span>}
                </div>
                <span className="text-[10px] text-slate-400 font-medium">{bookmark.createdAt}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-700/30 border-b border-slate-100 dark:border-slate-700">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest w-[40%]">标题与链接</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">标签</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">笔记</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">添加时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {bookmarks.map(bookmark => (
                <tr 
                  key={bookmark.id} 
                  onClick={(e) => handleCardClick(e, bookmark)}
                  onDoubleClick={(e) => handleDoubleClick(e, bookmark.url)}
                  onContextMenu={(e) => handleContextMenu(e, bookmark.id)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group cursor-pointer select-none"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center overflow-hidden shrink-0 group-hover:opacity-80 relative">
                        {bookmark.favicon ? (
                          <img 
                            src={bookmark.favicon} 
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                            alt="" 
                          />
                        ) : (
                          <span className="material-symbols-outlined text-slate-400 transition-transform duration-300 group-hover:scale-110">language</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                             <div className="font-bold text-slate-800 dark:text-white text-[13px] leading-tight truncate block group-hover:text-primary transition-colors">
                                {bookmark.title}
                             </div>
                             {bookmark.visitCount > 10 && <span className="material-symbols-outlined text-orange-400 text-[14px]" title="热门">local_fire_department</span>}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate max-w-xs">{bookmark.url}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1.5">
                      {bookmark.tags.map(tag => {
                         const styles = getTagStyles(tag);
                         return (
                          <span key={tag} className={`px-2 py-0.5 border text-[10px] font-medium rounded ${styles.bg} ${styles.text} ${styles.border} transition-transform duration-300 group-hover:scale-110`}>
                            {tag}
                          </span>
                         );
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onOpenNotes(bookmark);
                        }}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${bookmark.content ? 'bg-blue-50 dark:bg-blue-900/20 text-primary border border-blue-100 dark:border-blue-900/50' : 'hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-300 hover:text-slate-500'}`}
                        title={bookmark.content ? "查看笔记" : "添加笔记"}
                    >
                        <span className={`material-symbols-outlined text-[18px] ${bookmark.content ? 'filled' : ''}`}>article</span>
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[12px] text-slate-400">{bookmark.createdAt}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {contextMenu && (
        <div 
          className="fixed z-[9999] bg-white dark:bg-slate-800 rounded-xl shadow-menu border border-slate-100 dark:border-slate-700 w-40 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button 
            onClick={() => {
              const bm = bookmarks.find(b => b.id === contextMenu.id);
              if (bm) handleCopyLink(bm.url);
            }}
            className="w-full text-left px-4 py-2 text-[13px] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2.5"
          >
            <span className="material-symbols-outlined text-[18px] text-slate-400">content_copy</span> 
            复制链接
          </button>
          <button 
            onClick={() => {
              const bm = bookmarks.find(b => b.id === contextMenu.id);
              if (bm) {
                  setContextMenu(null);
                  onOpenNotes(bm);
              }
            }}
            className="w-full text-left px-4 py-2 text-[13px] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2.5"
          >
            <span className="material-symbols-outlined text-[18px] text-slate-400">article</span> 
            查看笔记
          </button>
           <button 
            onClick={() => {
              console.log('Edit', contextMenu.id);
              setContextMenu(null);
            }}
            className="w-full text-left px-4 py-2 text-[13px] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2.5"
          >
            <span className="material-symbols-outlined text-[18px] text-slate-400">edit</span> 
            编辑信息
          </button>
          <div className="h-px bg-slate-100 dark:bg-slate-700 my-1 mx-2"></div>
          <button 
            onClick={() => {
              onDeleteBookmark(contextMenu.id);
              setContextMenu(null);
            }}
            className="w-full text-left px-4 py-2 text-[13px] text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2.5"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span> 
            删除
          </button>
        </div>
      )}
    </div>
  );
};

export default BookmarkContent;

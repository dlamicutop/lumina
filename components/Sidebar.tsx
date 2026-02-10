
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Folder, Tag } from '../types';
import { TAG_COLORS } from '../constants';

interface SidebarProps {
  folders: Folder[];
  tags: Tag[];
  selectedFolderId: string;
  onSelectFolder: (id: string) => void;
  onOpenNewFolder: () => void;
  onAddSubFolder: (parentId: string) => void;
  onRenameFolder: (id: string, name: string) => void;
  onMoveFolder: (draggedId: string, targetId: string) => void;
  // Updated signature to accept optional folderId
  onOpenNewBookmark: (folderId?: string) => void; 
  onOpenNewTag: () => void;
  activeTags: string[];
  onToggleTag: (tagName: string) => void;
  onMoveTag: (draggedId: string, targetId: string) => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
  hasActiveFilters: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  folders, 
  tags, 
  selectedFolderId, 
  onSelectFolder,
  onOpenNewFolder,
  onAddSubFolder,
  onRenameFolder,
  onMoveFolder,
  onOpenNewBookmark,
  onOpenNewTag,
  activeTags,
  onToggleTag,
  onMoveTag,
  isCollapsed,
  toggleCollapse,
  hasActiveFilters
}) => {
  const [tagViewMode, setTagViewMode] = useState<'grid' | 'list'>('grid');
  
  // 拖拽相关状态 (内部高度)
  const [navHeight, setNavHeight] = useState(300);
  const containerRef = useRef<HTMLDivElement>(null);
  const isResizingRef = useRef(false);

  // 拖拽相关状态 (侧边栏宽度)
  const [sidebarWidth, setSidebarWidth] = useState(260); // 默认宽度
  const [isDraggingWidth, setIsDraggingWidth] = useState(false); // 用于控制过渡动画
  const isResizingWidthRef = useRef(false);

  // 文件夹拖拽状态
  const [draggedFolderId, setDraggedFolderId] = useState<string | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);

  // 标签拖拽状态
  const [draggedTagId, setDraggedTagId] = useState<string | null>(null);
  const [dragOverTagId, setDragOverTagId] = useState<string | null>(null);

  // 右键菜单状态
  const [contextMenu, setContextMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  
  // 重命名状态
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  // 文件夹展开状态 (Set of IDs)
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(new Set());

  // 过滤掉 'all'，只显示用户创建的文件夹
  const rootFolders = folders.filter(f => (!f.parentId || f.parentId === 'all') && f.id !== 'all');
  const getSubFolders = (parentId: string) => folders.filter(f => f.parentId === parentId);

  // 标签过滤逻辑：如果有任何激活的筛选条件，隐藏数量为0的标签
  const visibleTags = useMemo(() => {
    if (hasActiveFilters) {
      return tags.filter(t => t.count > 0);
    }
    return tags;
  }, [tags, hasActiveFilters]);

  // 当选中的文件夹改变时，自动展开其父文件夹
  useEffect(() => {
    const selectedFolder = folders.find(f => f.id === selectedFolderId);
    if (selectedFolder && selectedFolder.parentId && selectedFolder.parentId !== 'all') {
      setExpandedFolderIds(prev => {
        const next = new Set(prev);
        if (selectedFolder.parentId) next.add(selectedFolder.parentId);
        return next;
      });
    }
  }, [selectedFolderId, folders]);

  // 处理点击外部关闭菜单
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const getDotColor = (colorName: string) => {
      const colorMap: Record<string, string> = {
          blue: 'bg-blue-500',
          purple: 'bg-purple-500',
          green: 'bg-green-500',
          orange: 'bg-orange-500',
          red: 'bg-red-500',
          indigo: 'bg-indigo-500',
          pink: 'bg-pink-500',
          cyan: 'bg-cyan-500',
          amber: 'bg-amber-500',
          slate: 'bg-slate-500',
      };
      return colorMap[colorName] || 'bg-slate-500';
  };

  // 统一处理拖拽逻辑 (内部高度 & 侧边栏宽度)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // 1. 调整内部导航高度
      if (isResizingRef.current && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        let newHeight = e.clientY - containerRect.top;
        const minHeight = 100;
        const maxHeight = containerRect.height - 150;
        if (newHeight < minHeight) newHeight = minHeight;
        if (newHeight > maxHeight) newHeight = maxHeight;
        setNavHeight(newHeight);
      }

      // 2. 调整侧边栏宽度
      if (isResizingWidthRef.current) {
        // 假设侧边栏左侧有 padding (App.tsx p-4 = 16px)
        const newWidth = e.clientX - 16;
        const minWidth = 200;
        const maxWidth = 480;
        
        if (newWidth >= minWidth && newWidth <= maxWidth) {
          setSidebarWidth(newWidth);
        }
      }
    };

    const handleMouseUp = () => {
      // 停止高度调整
      if (isResizingRef.current) {
        isResizingRef.current = false;
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
      }
      
      // 停止宽度调整
      if (isResizingWidthRef.current) {
        isResizingWidthRef.current = false;
        setIsDraggingWidth(false); // 恢复过渡动画
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isCollapsed) return; // 折叠状态下禁止调整高度
    isResizingRef.current = true;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  };

  const startResizingWidth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCollapsed) return;
    isResizingWidthRef.current = true;
    setIsDraggingWidth(true); // 禁用过渡动画
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  // --- 文件夹拖拽逻辑 ---
  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (id === 'all') {
      e.preventDefault(); 
      return;
    }
    setDraggedFolderId(id);
    e.dataTransfer.effectAllowed = 'move';
    if (e.currentTarget instanceof HTMLElement) {
       e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedFolderId(null);
    setDragOverFolderId(null);
    if (e.currentTarget instanceof HTMLElement) {
       e.currentTarget.style.opacity = '1';
    }
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault(); 
    if (draggedFolderId === id) return;
    setDragOverFolderId(id);
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragLeave = () => {
    setDragOverFolderId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedFolderId && draggedFolderId !== targetId) {
      onMoveFolder(draggedFolderId, targetId);
    }
    setDraggedFolderId(null);
    setDragOverFolderId(null);
  };

  // --- 标签拖拽逻辑 ---
  const handleDragStartTag = (e: React.DragEvent, id: string) => {
    setDraggedTagId(id);
    e.dataTransfer.effectAllowed = 'move';
    if (e.currentTarget instanceof HTMLElement) {
       e.currentTarget.style.opacity = '0.4';
    }
  };

  const handleDragEndTag = (e: React.DragEvent) => {
    setDraggedTagId(null);
    setDragOverTagId(null);
    if (e.currentTarget instanceof HTMLElement) {
       e.currentTarget.style.opacity = '1';
    }
  };

  const handleDragOverTag = (e: React.DragEvent, id: string) => {
    e.preventDefault(); 
    if (draggedTagId === id) return;
    setDragOverTagId(id);
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropTag = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedTagId && draggedTagId !== targetId) {
      onMoveTag(draggedTagId, targetId);
    }
    setDraggedTagId(null);
    setDragOverTagId(null);
  };


  // 右键菜单处理
  const handleContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (id === 'all') return;
    setContextMenu({ id, x: e.clientX, y: e.clientY });
  };

  // 开始重命名
  const startEditing = (folder: Folder) => {
    if (folder.id === 'all' || isCollapsed) return;
    setEditingFolderId(folder.id);
    setEditName(folder.name);
    setContextMenu(null);
  };

  // 保存重命名
  const saveRename = () => {
    if (editingFolderId && editName.trim()) {
      onRenameFolder(editingFolderId, editName.trim());
    }
    setEditingFolderId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveRename();
    if (e.key === 'Escape') setEditingFolderId(null);
  };

  const toggleFolderExpand = (e: React.MouseEvent, folderId: string) => {
    e.stopPropagation();
    setExpandedFolderIds(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  // 一键折叠/展开所有逻辑
  const toggleExpandAll = () => {
    if (expandedFolderIds.size > 0) {
      // 如果有任何展开的，全部折叠
      setExpandedFolderIds(new Set());
    } else {
      // 如果全部折叠，展开所有有子文件夹的目录
      const parentIds = new Set<string>();
      folders.forEach(f => {
        // 检查这个文件夹是否是其他文件夹的 parent
        const hasChildren = folders.some(sub => sub.parentId === f.id);
        if (hasChildren && f.id !== 'all') {
          parentIds.add(f.id);
        }
      });
      setExpandedFolderIds(parentIds);
    }
  };

  const renderFolderItem = (folder: Folder, isSub: boolean = false) => {
    const isEditing = editingFolderId === folder.id;
    const isSelected = selectedFolderId === folder.id;
    const hasChildren = getSubFolders(folder.id).length > 0;
    const isExpanded = expandedFolderIds.has(folder.id);
    const isDragOver = dragOverFolderId === folder.id;

    return (
      <div 
        key={folder.id}
        draggable={!isEditing}
        onDragStart={(e) => handleDragStart(e, folder.id)}
        onDragEnd={handleDragEnd}
        onDragOver={(e) => handleDragOver(e, folder.id)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, folder.id)}
        onClick={() => !isEditing && onSelectFolder(folder.id)}
        onDoubleClick={() => startEditing(folder)}
        onContextMenu={(e) => handleContextMenu(e, folder.id)}
        className={`
          flex items-center justify-between cursor-pointer group transition-all relative
          ${isSub ? 'px-3 py-1.5 rounded-lg' : 'px-3 py-2 rounded-xl'}
          ${isDragOver ? 'ring-2 ring-primary bg-blue-50 dark:bg-blue-900/30' : ''}
          ${isSelected && !isEditing
            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
            : isSub 
              ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700/30'
              : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400'
          }
          ${isCollapsed ? 'justify-center px-0' : ''}
        `}
        title={isCollapsed ? folder.name : undefined}
      >
        <div className={`flex items-center gap-2 flex-1 min-w-0 ${isCollapsed ? 'justify-center' : ''}`}>
          {!isCollapsed && hasChildren && !isEditing && (
             <button 
              onClick={(e) => toggleFolderExpand(e, folder.id)}
              className="w-4 h-4 flex items-center justify-center rounded hover:bg-black/5 dark:hover:bg-white/10 text-slate-400 transition-colors"
             >
               <span className="material-symbols-outlined text-[14px]">
                 {isExpanded ? 'expand_more' : 'chevron_right'}
               </span>
             </button>
          )}
          {!isCollapsed && !hasChildren && !isSub && <div className="w-4" />}
          
          <span className={`material-symbols-outlined shrink-0 ${isSub ? 'text-[16px]' : 'text-[18px]'} ${isSelected && !isEditing ? 'text-blue-500' : 'text-slate-400'}`}>
            {folder.icon}
          </span>
          
          {!isCollapsed && (
            isEditing ? (
              <input 
                autoFocus
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={saveRename}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()} 
                className={`bg-white dark:bg-slate-800 border-2 border-primary/50 rounded-md px-1.5 py-0 text-sm w-full outline-none h-6 ${isSub ? 'text-[13px]' : 'text-sm'}`}
              />
            ) : (
              <span className={`truncate font-medium ${isSub ? 'text-[13px]' : 'text-sm'}`}>{folder.name}</span>
            )
          )}
        </div>
        
        {/* 右侧：Hover显示添加按钮 或 默认显示计数 */}
        {!isCollapsed && !isEditing && (
            <div className="flex items-center gap-1">
                {/* 悬停时出现的“新建书签”小按钮 */}
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onOpenNewBookmark(folder.id);
                    }}
                    className="w-5 h-5 rounded hover:bg-white dark:hover:bg-slate-600 shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-slate-400 hover:text-primary scale-90 group-hover:scale-100 hidden group-hover:flex"
                    title="在此新建书签"
                >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                </button>

                {/* 计数 */}
                <span className={`text-[10px] px-1.5 rounded-full font-bold transition-opacity group-hover:opacity-50 ${isSelected ? 'bg-blue-100 dark:bg-blue-800' : (isSub ? 'opacity-60' : 'bg-slate-100 dark:bg-slate-700')}`}>
                    {folder.count}
                </span>
            </div>
        )}
      </div>
    );
  };

  return (
    <aside 
      style={{ 
        width: isCollapsed ? '5rem' : `${sidebarWidth}px`,
        transitionProperty: 'width, transform',
        transitionDuration: isDraggingWidth ? '0s' : '300ms',
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      className={`
        flex flex-col glass-panel rounded-3xl shadow-soft flex-shrink-0 relative
        ${isCollapsed ? 'w-20' : ''}
      `}
    >
      {/* 宽度调整手柄 - 仅在非折叠模式下可用 */}
      {!isCollapsed && (
        <div 
          onMouseDown={startResizingWidth}
          className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-primary/10 active:bg-primary/20 transition-colors z-50 rounded-r-3xl"
          title="拖拽调整宽度"
        />
      )}

      {/* 顶部 Logo & Toggle */}
      <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center flex-col gap-4' : 'gap-2 justify-between'} flex-shrink-0`}>
        <div 
          onClick={() => onSelectFolder('all')}
          className={`flex items-center gap-2 cursor-pointer group ${isCollapsed ? 'justify-center' : ''}`}
          title="回到所有书签"
        >
           <div className="bg-primary text-white p-1.5 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[20px] filled">bookmark</span>
          </div>
          {!isCollapsed && <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white whitespace-nowrap overflow-hidden group-hover:text-primary transition-colors">Lumina</span>}
        </div>
        
        <button 
           onClick={toggleCollapse}
           className="text-slate-400 hover:text-primary transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50"
           title={isCollapsed ? "展开侧边栏" : "折叠侧边栏"}
        >
          <span className="material-symbols-outlined text-[20px]">
            {isCollapsed ? 'menu_open' : 'menu_open'} 
          </span>
        </button>
      </div>

      {/* 可变区域容器 */}
      <div className={`flex-1 flex flex-col min-h-0 relative ${isCollapsed ? 'px-2' : 'px-4'}`} ref={containerRef}>
        
        {/* 上部分：文件夹导航 */}
        <div style={{ height: isCollapsed ? 'auto' : navHeight }} className={`flex-col flex flex-shrink-0 ${isCollapsed ? 'flex-1' : ''}`}>
          {!isCollapsed && (
            <div className="flex items-center justify-between mb-2 px-2 flex-shrink-0 fade-in group h-6">
              <div className="flex items-center gap-2">
                <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">导航</h3>
              </div>
              <div className="flex items-center gap-1 opacity-100 transition-opacity">
                 <button 
                    onClick={onOpenNewFolder}
                    className="text-slate-400 hover:text-primary transition-colors p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="新建目录"
                 >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                 </button>
                <button 
                  onClick={toggleExpandAll}
                  className="text-slate-400 hover:text-primary transition-colors p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                  title={expandedFolderIds.size > 0 ? "全部折叠" : "全部展开"}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {expandedFolderIds.size > 0 ? 'unfold_less' : 'unfold_more'}
                  </span>
                </button>
              </div>
            </div>
          )}
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pb-2">
            <ul className="space-y-1">
              {rootFolders.map(folder => (
                <li key={folder.id}>
                  {renderFolderItem(folder)}
                  {!isCollapsed && getSubFolders(folder.id).length > 0 && expandedFolderIds.has(folder.id) && (
                    <ul className="ml-6 mt-1 space-y-1 border-l border-slate-100 dark:border-slate-800 pl-3 animate-in slide-in-from-top-2 duration-200">
                      {getSubFolders(folder.id).map(sub => (
                        <li key={sub.id}>
                          {renderFolderItem(sub, true)}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 拖拽手柄 */}
        {!isCollapsed && (
          <div 
            onMouseDown={startResizing}
            className="h-3 cursor-row-resize flex items-center justify-center group flex-shrink-0 hover:bg-slate-100 dark:hover:bg-slate-700/50 -mx-4 px-4 transition-colors"
            title="拖拽调整高度"
          >
            <div className="w-8 h-1 bg-slate-200 dark:bg-slate-700 rounded-full group-hover:bg-slate-300 dark:group-hover:bg-slate-600 transition-colors"></div>
          </div>
        )}

        {/* 下部分：标签 */}
        {!isCollapsed ? (
          <div className="flex-1 min-h-0 flex flex-col fade-in">
            <div className="flex items-center justify-between mb-3 px-2 flex-shrink-0 pt-2">
              <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                {hasActiveFilters ? "筛选标签" : "所有标签"}
              </h3>
              <div className="flex items-center gap-1">
                <div className="flex bg-slate-100/50 dark:bg-slate-800/50 p-0.5 rounded-lg border border-slate-100 dark:border-slate-700 mr-2">
                  <button 
                    onClick={() => setTagViewMode('grid')}
                    className={`p-1 rounded-md transition-all flex items-center justify-center ${tagViewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <span className="material-symbols-outlined text-[14px]">grid_view</span>
                  </button>
                  <button 
                    onClick={() => setTagViewMode('list')}
                    className={`p-1 rounded-md transition-all flex items-center justify-center ${tagViewMode === 'list' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <span className="material-symbols-outlined text-[14px]">view_list</span>
                  </button>
                </div>
                <button 
                  onClick={onOpenNewTag}
                  className="text-slate-400 hover:text-primary transition-colors flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-2">
              {tagViewMode === 'grid' ? (
                <div className="flex flex-wrap gap-2 px-1">
                  {visibleTags.map(tag => {
                    const color = TAG_COLORS[tag.color] || TAG_COLORS.slate;
                    const isActive = activeTags.includes(tag.name);
                    const isDragOver = dragOverTagId === tag.id;
                    
                    return (
                      <button 
                        key={tag.id}
                        draggable
                        onDragStart={(e) => handleDragStartTag(e, tag.id)}
                        onDragEnd={handleDragEndTag}
                        onDragOver={(e) => handleDragOverTag(e, tag.id)}
                        onDrop={(e) => handleDropTag(e, tag.id)}
                        onClick={() => onToggleTag(tag.name)}
                        className={`
                            px-3 py-1.5 rounded-xl text-[11px] font-medium border transition-all relative
                            ${isActive 
                                ? `${color.bg} ${color.text} border-current shadow-sm font-semibold opacity-100` 
                                : `${color.bg} ${color.text} border-transparent opacity-70 hover:opacity-100`
                            }
                            ${isDragOver ? 'ring-2 ring-primary scale-105 z-10' : ''}
                        `}
                      >
                        {tag.name} 
                        {tag.count > 0 && <span className="ml-1 opacity-60">({tag.count})</span>}
                      </button>
                    );
                  })}
                  {hasActiveFilters && visibleTags.length === 0 && (
                      <div className="text-center w-full mt-4 text-xs text-slate-400">无匹配标签</div>
                  )}
                </div>
              ) : (
                 <ul className="space-y-1">
                  {visibleTags.map(tag => {
                    const color = TAG_COLORS[tag.color] || TAG_COLORS.slate;
                    const isActive = activeTags.includes(tag.name);
                    const isDragOver = dragOverTagId === tag.id;
                    
                    return (
                      <li 
                         key={tag.id}
                         draggable
                         onDragStart={(e) => handleDragStartTag(e, tag.id)}
                         onDragEnd={handleDragEndTag}
                         onDragOver={(e) => handleDragOverTag(e, tag.id)}
                         onDrop={(e) => handleDropTag(e, tag.id)}
                      >
                        <button 
                          onClick={() => onToggleTag(tag.name)}
                          className={`
                            w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all group border
                            ${isActive 
                                ? 'bg-slate-100 dark:bg-slate-700/80 shadow-sm border-slate-200 dark:border-slate-600' 
                                : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'
                            }
                            ${isDragOver ? 'ring-2 ring-primary bg-blue-50 dark:bg-blue-900/20' : ''}
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full shadow-sm ${getDotColor(tag.color)}`}></div>
                            <span className={`text-[13px] font-bold transition-colors ${color.text}`}>{tag.name}</span>
                          </div>
                          
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg transition-all ${color.bg} ${color.text}`}>
                            {tag.count}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                  {hasActiveFilters && visibleTags.length === 0 && (
                      <li className="text-center w-full mt-4 text-xs text-slate-400">无匹配标签</li>
                  )}
                 </ul>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1"></div>
        )}
      </div>

      {/* 移除左下角按钮区域 */}
      <div className="h-4 flex-shrink-0" />

      {contextMenu && createPortal(
        <div 
          className="fixed z-[9999] bg-white dark:bg-slate-800 rounded-xl shadow-menu border border-slate-100 dark:border-slate-700 w-44 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            onClick={() => {
              setContextMenu(null);
              onOpenNewBookmark(contextMenu.id);
            }}
            className="w-full text-left px-4 py-2 text-[13px] text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-2.5 font-medium"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span> 
            在此新建书签
          </button>
          <div className="h-px bg-slate-100 dark:bg-slate-700 my-1 mx-2"></div>
          <button 
            onClick={() => {
              const folder = folders.find(f => f.id === contextMenu.id);
              if (folder) startEditing(folder);
            }}
            className="w-full text-left px-4 py-2 text-[13px] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2.5"
          >
            <span className="material-symbols-outlined text-[18px] text-slate-400">edit</span> 
            重命名
          </button>
          
          <button 
            onClick={() => {
              onAddSubFolder(contextMenu.id);
              setContextMenu(null);
            }}
            className="w-full text-left px-4 py-2 text-[13px] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2.5"
          >
            <span className="material-symbols-outlined text-[18px] text-slate-400">create_new_folder</span> 
            新建子目录
          </button>
        </div>,
        document.body
      )}
    </aside>
  );
};

export default Sidebar;

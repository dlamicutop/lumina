
import React, { useState, useEffect, useMemo } from 'react';
import { TAG_COLORS } from './constants';
import { Folder, Tag, Bookmark, ViewMode, SortOption, SortOrder, DateRange } from './types';
import { api } from './services/api';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import BookmarkContent from './components/BookmarkContent';
import NewBookmarkModal from './components/Modals/NewBookmarkModal';
import NewFolderModal from './components/Modals/NewFolderModal';
import NewTagModal from './components/Modals/NewTagModal';
import Login from './components/Login';
import NotePanel from './components/NotePanel';

const App: React.FC = () => {
  // 登录状态管理
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // 全局加载状态
  const [isLoadingData, setIsLoadingData] = useState(false);

  // 数据状态 (从 API 获取)
  const [folders, setFolders] = useState<Folder[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  // UI 状态
  const [selectedFolderId, setSelectedFolderId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortOption, setSortOption] = useState<SortOption>('created');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // 默认主题 (Light)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.theme === 'dark';
  });

  // 模态框状态
  const [modalOpen, setModalOpen] = useState<'bookmark' | 'folder' | 'tag' | null>(null);
  const [targetParentId, setTargetParentId] = useState<string | undefined>(undefined);
  const [targetFolderId, setTargetFolderId] = useState<string | undefined>(undefined);
  
  // 笔记面板状态
  const [activeNoteBookmark, setActiveNoteBookmark] = useState<Bookmark | null>(null);

  // === 初始化数据加载 ===
  useEffect(() => {
    if (isAuthenticated) {
      const fetchData = async () => {
        setIsLoadingData(true);
        try {
          const [foldersRes, tagsRes, bookmarksRes] = await Promise.all([
            api.folders.getAll(),
            api.tags.getAll(),
            api.bookmarks.getAll()
          ]);
          
          if (foldersRes.success) setFolders(foldersRes.data);
          if (tagsRes.success) setTags(tagsRes.data);
          if (bookmarksRes.success) setBookmarks(bookmarksRes.data);
        } catch (error) {
          console.error("Failed to load initial data", error);
        } finally {
          setIsLoadingData(false);
        }
      };
      fetchData();
    }
  }, [isAuthenticated]);

  // === 主题切换 ===
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  }, [isDarkMode]);

  // === 交互逻辑处理 ===

  const toggleTag = (tagName: string) => {
    setActiveTags(prev => prev.includes(tagName) ? prev.filter(t => t !== tagName) : [...prev, tagName]);
  };

  const handleClearTags = () => {
    setActiveTags([]);
  };

  // 前端过滤与排序 (配合后端 API 获取全量数据模式)
  const filteredBookmarks = useMemo(() => {
    let result = bookmarks.filter(b => {
      // 1. 文件夹匹配
      const matchesFolder = selectedFolderId === 'all' || b.folderId === selectedFolderId;
      // 2. 搜索匹配
      const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.url.toLowerCase().includes(searchQuery.toLowerCase());
      // 3. 标签匹配
      const matchesTags = activeTags.length === 0 || activeTags.every(t => b.tags.includes(t));
      
      // 4. 日期范围匹配
      let matchesDate = true;
      if (dateRange.start) {
        const bookmarkTime = b.createdAtTimestamp;
        const startTime = new Date(dateRange.start).setHours(0,0,0,0);
        
        if (bookmarkTime < startTime) {
            matchesDate = false;
        } else if (dateRange.end) {
            const endTime = dateRange.end.getTime(); 
            if (bookmarkTime > endTime) {
                matchesDate = false;
            }
        } else {
            const endOfDay = new Date(dateRange.start).setHours(23,59,59,999);
            if (bookmarkTime > endOfDay) matchesDate = false;
        }
      }

      return matchesFolder && matchesSearch && matchesTags && matchesDate;
    });

    // 排序逻辑
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortOption) {
        case 'frequent':
          comparison = a.visitCount - b.visitCount;
          break;
        case 'recent':
          comparison = a.lastVisited - b.lastVisited;
          break;
        case 'created':
        default:
          comparison = a.createdAtTimestamp - b.createdAtTimestamp;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [bookmarks, selectedFolderId, searchQuery, activeTags, sortOption, sortOrder, dateRange]);

  const hasActiveFilters = useMemo(() => {
    return selectedFolderId !== 'all' || 
           searchQuery.trim() !== '' || 
           activeTags.length > 0 || 
           dateRange.start !== null;
  }, [selectedFolderId, searchQuery, activeTags, dateRange]);

  // 动态计算侧边栏计数
  const dynamicTags = useMemo(() => {
    return tags.map(tag => {
      const count = filteredBookmarks.filter(b => b.tags.includes(tag.name)).length;
      return { ...tag, count };
    });
  }, [tags, filteredBookmarks]);

  const dynamicFolders = useMemo(() => {
    return folders.map(folder => {
      if (folder.id === 'all') {
        return { ...folder, count: bookmarks.length };
      }
      const count = bookmarks.filter(b => b.folderId === folder.id).length;
      return { ...folder, count };
    });
  }, [folders, bookmarks]);

  // === 增删改查 Actions ===

  const handleAddBookmark = async (newBookmark: Bookmark) => {
    // 1. 检查并创建新标签
    const existingTagNames = tags.map(t => t.name);
    const newTagNames = newBookmark.tags.filter(t => !existingTagNames.includes(t));
    
    if (newTagNames.length > 0) {
      const availableColors = Object.keys(TAG_COLORS).filter(c => c !== 'slate');
      
      // 并行创建新标签
      const newTagsPromises = newTagNames.map(name => {
        const tag: Tag = {
          id: Math.random().toString(36).substr(2, 9),
          name,
          color: availableColors[Math.floor(Math.random() * availableColors.length)],
          count: 0
        };
        return api.tags.create(tag);
      });

      const newTagsRes = await Promise.all(newTagsPromises);
      const createdTags = newTagsRes.filter(r => r.success).map(r => r.data);
      
      setTags(prev => [...prev, ...createdTags]);
    }

    // 2. 创建书签
    const res = await api.bookmarks.create(newBookmark);
    if (res.success) {
      setBookmarks(prev => [res.data, ...prev]);
      setModalOpen(null);
    }
  };

  const handleDeleteBookmark = async (id: string) => {
    const res = await api.bookmarks.delete(id);
    if (res.success) {
      setBookmarks(prev => prev.filter(b => b.id !== id));
    }
  };

  const handleUpdateBookmarkContent = async (id: string, content: string) => {
    const res = await api.bookmarks.update(id, { content });
    if (res.success) {
      setBookmarks(prev => prev.map(b => b.id === id ? { ...b, content } : b));
    }
  };

  const handleAddFolder = async (newFolder: Folder) => {
    const folderToAdd = { 
      ...newFolder, 
      parentId: targetParentId || 'all' 
    };
    const res = await api.folders.create(folderToAdd);
    if (res.success) {
      setFolders(prev => [...prev, res.data]);
      setModalOpen(null);
      setTargetParentId(undefined);
    }
  };

  const handleRenameFolder = async (id: string, newName: string) => {
    const res = await api.folders.update(id, { name: newName });
    if (res.success) {
      setFolders(prev => prev.map(f => f.id === id ? { ...f, name: newName } : f));
    }
  };

  const handleMoveFolder = async (draggedId: string, targetId: string) => {
    if (draggedId === targetId) return;

    // 检查循环引用
    let current = folders.find(f => f.id === targetId);
    while (current) {
      if (current.id === draggedId) return; 
      if (!current.parentId || current.parentId === 'all') break;
      current = folders.find(f => f.id === current?.parentId);
    }

    const res = await api.folders.move(draggedId, targetId);
    if (res.success) {
      setFolders(prev => prev.map(f => {
        if (f.id === draggedId) {
          return { ...f, parentId: targetId };
        }
        return f;
      }));
    }
  };

  const handleMoveTag = async (draggedId: string, targetId: string) => {
    if (draggedId === targetId) return;
    
    // 乐观更新
    const oldTags = [...tags];
    const draggedIndex = tags.findIndex(t => t.id === draggedId);
    const targetIndex = tags.findIndex(t => t.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;

    const newTags = [...tags];
    const [movedTag] = newTags.splice(draggedIndex, 1);
    newTags.splice(targetIndex, 0, movedTag);
    
    setTags(newTags); // 立即更新 UI

    // 后端同步
    const res = await api.tags.reorder(newTags);
    if (!res.success) {
      setTags(oldTags); // 失败回滚
    }
  };

  const handleBookmarkClick = async (bookmark: Bookmark) => {
    // 乐观更新
    setBookmarks(prev => prev.map(b => {
      if (b.id === bookmark.id) {
        return {
          ...b,
          visitCount: (b.visitCount || 0) + 1,
          lastVisited: Date.now()
        };
      }
      return b;
    }));
    
    // 异步通知后端
    await api.bookmarks.incrementVisit(bookmark.id);
  };

  const handleLogout = async () => {
    await api.auth.logout();
    setIsAuthenticated(false);
    // 清空敏感数据
    setBookmarks([]);
    setFolders([]);
    setTags([]);
  };

  const handleOpenNewBookmark = (folderId?: string) => {
    const preSelect = folderId || (selectedFolderId !== 'all' ? selectedFolderId : undefined);
    setTargetFolderId(preSelect);
    setModalOpen('bookmark');
  };

  // === 渲染 ===

  if (!isAuthenticated) {
    return (
      <Login 
        onLogin={() => setIsAuthenticated(true)} 
        isDarkMode={isDarkMode} 
        toggleTheme={() => setIsDarkMode(!isDarkMode)}
      />
    );
  }

  return (
    <div className="flex h-screen p-4 gap-4 overflow-hidden transition-all animate-in fade-in duration-500">
      <Sidebar 
        folders={dynamicFolders} 
        tags={dynamicTags} 
        selectedFolderId={selectedFolderId} 
        onSelectFolder={setSelectedFolderId}
        onOpenNewFolder={() => {
          setTargetParentId(undefined);
          setModalOpen('folder');
        }}
        onAddSubFolder={(parentId) => {
          setTargetParentId(parentId);
          setModalOpen('folder');
        }}
        onRenameFolder={handleRenameFolder}
        onMoveFolder={handleMoveFolder}
        onOpenNewBookmark={handleOpenNewBookmark}
        onOpenNewTag={() => setModalOpen('tag')}
        activeTags={activeTags}
        onToggleTag={toggleTag}
        onMoveTag={handleMoveTag}
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        hasActiveFilters={hasActiveFilters}
      />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden min-w-0 relative">
        <Header 
          searchQuery={searchQuery} 
          onSearchChange={setSearchQuery} 
          isDarkMode={isDarkMode} 
          toggleDarkMode={() => setIsDarkMode(!isDarkMode)} 
          onLogout={handleLogout}
          dateRange={dateRange}
          setDateRange={setDateRange}
          bookmarks={bookmarks}
        />
        
        {isLoadingData ? (
          <div className="flex-1 flex items-center justify-center">
             <div className="flex flex-col items-center gap-3">
               <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
               <p className="text-slate-400 text-sm">正在同步数据...</p>
             </div>
          </div>
        ) : (
          <BookmarkContent 
            bookmarks={filteredBookmarks}
            folders={folders}
            viewMode={viewMode}
            setViewMode={setViewMode}
            sortOption={sortOption}
            setSortOption={setSortOption}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            selectedFolderId={selectedFolderId}
            onFolderClick={setSelectedFolderId}
            activeTags={activeTags}
            onRemoveTag={toggleTag}
            onClearTags={handleClearTags}
            onDeleteBookmark={handleDeleteBookmark}
            onBookmarkClick={handleBookmarkClick}
            onOpenNotes={setActiveNoteBookmark}
            onOpenNewBookmark={handleOpenNewBookmark}
            allTags={tags} 
          />
        )}
      </main>

      <NotePanel 
        bookmark={activeNoteBookmark}
        onClose={() => setActiveNoteBookmark(null)}
        onSave={handleUpdateBookmarkContent}
      />

      {modalOpen === 'bookmark' && (
        <NewBookmarkModal 
          onClose={() => {
              setModalOpen(null);
              setTargetFolderId(undefined);
          }} 
          onAdd={handleAddBookmark}
          folders={folders.filter(f => f.id !== 'all')}
          allTags={tags}
          defaultFolderId={targetFolderId}
        />
      )}
      
      {modalOpen === 'folder' && (
        <NewFolderModal 
          onClose={() => {
            setModalOpen(null);
            setTargetParentId(undefined);
          }}
          onAdd={handleAddFolder}
        />
      )}

      {modalOpen === 'tag' && (
        <NewTagModal 
          onClose={() => setModalOpen(null)}
          onAdd={async (tag) => {
            const res = await api.tags.create(tag);
            if(res.success) {
                setTags([...tags, res.data]);
                setModalOpen(null);
            }
          }}
        />
      )}
    </div>
  );
};

export default App;

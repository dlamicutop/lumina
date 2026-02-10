
import React, { useState, useMemo } from 'react';
import { Bookmark, Folder, Tag } from '../../types';
import { TAG_COLORS } from '../../constants';

interface NewBookmarkModalProps {
  onClose: () => void;
  onAdd: (b: Bookmark) => void;
  folders: Folder[];
  allTags: Tag[];
  defaultFolderId?: string;
}

const NewBookmarkModal: React.FC<NewBookmarkModalProps> = ({ onClose, onAdd, folders, allTags, defaultFolderId }) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [folderId, setFolderId] = useState(defaultFolderId || folders[0]?.id || '');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagSearch, setTagSearch] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !title) return;

    onAdd({
      id: Math.random().toString(36).substr(2, 9),
      url,
      title,
      description,
      folderId,
      tags: selectedTags,
      createdAt: '刚刚',
      createdAtTimestamp: Date.now(),
      visitCount: 0,
      lastVisited: Date.now(),
      favicon: `https://www.google.com/s2/favicons?domain=${url}&sz=64`
    });
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    setTagSearch(''); // Clear search after selection
  };

  // 过滤出未选择且符合搜索条件的标签
  const filteredTags = useMemo(() => {
    const searchLower = tagSearch.toLowerCase().trim();
    // 首先排除已经选中的标签
    const unselected = allTags.filter(t => !selectedTags.includes(t.name));
    
    if (!searchLower) return unselected;
    
    return unselected.filter(t => t.name.toLowerCase().includes(searchLower));
  }, [allTags, tagSearch, selectedTags]);

  // 检查是否需要显示“创建新标签”
  const showCreateOption = useMemo(() => {
      const searchLower = tagSearch.trim().toLowerCase();
      if (!searchLower) return false;
      // 如果搜索词已经存在于 filteredTags（即有完全匹配），则不显示创建按钮
      // 注意：filteredTags 已经排除了 selectedTags。
      // 如果已经在 selectedTags 里，也不用创建。
      const isAlreadySelected = selectedTags.some(t => t.toLowerCase() === searchLower);
      if (isAlreadySelected) return false;

      const isExactMatch = filteredTags.some(t => t.name.toLowerCase() === searchLower);
      return !isExactMatch;
  }, [tagSearch, filteredTags, selectedTags]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-white/20">
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">新建书签</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row h-[500px]">
          <div className="w-full md:w-72 bg-slate-50 dark:bg-slate-900/50 p-6 flex flex-col gap-6 border-r border-slate-100 dark:border-slate-700">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">实时预览</p>
            <div className="aspect-video w-full rounded-2xl bg-white dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center p-4">
              <div className="size-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-primary">language</span>
              </div>
              <p className="text-[10px] text-slate-400 text-center">{title || '请输入标题'}</p>
            </div>
            <div className="space-y-3">
               <div className="h-2 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
               <div className="h-2 w-1/2 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
            </div>
          </div>

          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar space-y-5">
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wider ml-1">网址 (URL)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">link</span>
                <input 
                  type="text" 
                  autoFocus
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wider ml-1">标题</label>
              <input 
                type="text" 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="网站标题"
                className="w-full px-5 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wider ml-1">描述 (可选)</label>
              <textarea 
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="添加备注..."
                className="w-full px-5 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wider ml-1">存入目录</label>
                <select 
                  value={folderId}
                  onChange={(e) => setFolderId(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"
                >
                  {folders.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
              
              {/* 标签选择区域：输入框 -> 候选列表 -> 已选标签 */}
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wider ml-1">标签</label>
                
                {/* 1. 搜索输入框 */}
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px]">search</span>
                    <input 
                        type="text" 
                        value={tagSearch}
                        onChange={(e) => setTagSearch(e.target.value)}
                        placeholder="搜索或新建标签..."
                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                    />
                </div>

                {/* 2. 候选标签列表 (模糊匹配 + 自动新建) */}
                <div className="bg-slate-50/50 dark:bg-slate-900/30 rounded-xl p-2 max-h-32 overflow-y-auto custom-scrollbar border border-slate-100 dark:border-slate-800">
                    <div className="flex flex-wrap gap-2">
                        {/* 如果搜索词不存在，显示新建按钮 */}
                        {showCreateOption && (
                            <button
                                type="button"
                                onClick={() => toggleTag(tagSearch.trim())}
                                className="px-3 py-1.5 rounded-lg border text-xs font-bold transition-all bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 w-full text-left flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[16px]">add</span>
                                创建新标签: "{tagSearch.trim()}"
                            </button>
                        )}
                        
                        {filteredTags.map(tag => {
                            const styles = TAG_COLORS[tag.color] || TAG_COLORS.slate;
                            return (
                                <button
                                    key={tag.id}
                                    type="button"
                                    onClick={() => toggleTag(tag.name)}
                                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${styles.bg} ${styles.text} ${styles.border} opacity-60 hover:opacity-100 bg-opacity-30 border-opacity-30 hover:scale-105`}
                                >
                                    {tag.name}
                                </button>
                            );
                        })}
                        
                        {!showCreateOption && filteredTags.length === 0 && (
                             <div className="w-full text-center py-2">
                                <span className="text-xs text-slate-400">暂无更多标签</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. 已选标签展示区 (位于下方，符合书签展示样式) */}
                {selectedTags.length > 0 && (
                     <div className="flex flex-wrap gap-2 pt-1 animate-in slide-in-from-top-1">
                        {selectedTags.map(tagName => {
                            const tag = allTags.find(t => t.name === tagName);
                            // 如果是新创建的标签，给一个默认颜色 (blue)
                            const colorKey = tag?.color || 'blue';
                            const styles = TAG_COLORS[colorKey] || TAG_COLORS.slate;
                            
                            return (
                                <button 
                                    key={tagName} 
                                    type="button"
                                    onClick={() => toggleTag(tagName)}
                                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md border text-[11px] font-bold ${styles.bg} ${styles.text} ${styles.border} hover:opacity-70 transition-all shadow-sm`}
                                    title="点击移除"
                                >
                                    {tagName}
                                    <span className="material-symbols-outlined text-[12px]">close</span>
                                </button>
                            );
                        })}
                    </div>
                )}
              </div>
            </div>
          </div>
        </form>

        <div className="px-8 py-5 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-4">
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all"
          >
            取消
          </button>
          <button 
            onClick={handleSubmit}
            className="px-8 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary-light rounded-xl transition-all shadow-lg shadow-blue-500/20"
          >
            保存书签
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewBookmarkModal;

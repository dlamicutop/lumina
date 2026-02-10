
import React, { useState, useEffect, useRef } from 'react';
import { Bookmark } from '../types';

interface NotePanelProps {
  bookmark: Bookmark | null;
  onClose: () => void;
  onSave: (bookmarkId: string, content: string) => void;
}

const NotePanel: React.FC<NotePanelProps> = ({ bookmark, onClose, onSave }) => {
  const [content, setContent] = useState('');
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('preview');
  const [isVisible, setIsVisible] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (bookmark) {
      setContent(bookmark.content || '');
      setActiveTab('preview');
      setIsFullscreen(false);
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [bookmark]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleSave = () => {
    if (bookmark) {
      onSave(bookmark.id, content);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // --- 文本插入工具函数 ---
  const insertTextAtCursor = (textToInsert: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const previousContent = content;
    
    const newContent = previousContent.substring(0, start) + textToInsert + previousContent.substring(end);
    setContent(newContent);

    // 恢复焦点并更新光标位置
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
    }, 0);
  };

  const handleFormat = (type: 'bold' | 'italic' | 'h1' | 'h2' | 'list' | 'code') => {
    let syntax = '';
    switch(type) {
      case 'bold': syntax = '**加粗文字**'; break;
      case 'italic': syntax = '*斜体文字*'; break;
      case 'h1': syntax = '\n# 一级标题\n'; break;
      case 'h2': syntax = '\n## 二级标题\n'; break;
      case 'list': syntax = '\n- 列表项'; break;
      case 'code': syntax = '\n```\n代码块\n```\n'; break;
    }
    insertTextAtCursor(syntax);
  };

  // --- 文件处理逻辑 (核心) ---
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFiles(files);
    }
    // 重置 input 以便允许重复上传同一文件
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processFiles = async (files: FileList) => {
    setIsUploading(true);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const base64 = await fileToBase64(file);
        
        if (file.type.startsWith('image/')) {
          insertTextAtCursor(`\n![${file.name}](${base64})\n`);
        } else if (file.type === 'application/pdf') {
          // 使用 HTML embed 标签嵌入 PDF
          insertTextAtCursor(`\n<embed src="${base64}" type="application/pdf" width="100%" height="500px" class="rounded-xl border border-slate-200 dark:border-slate-700 my-4" />\n<span class="text-xs text-slate-400 block text-center mb-4">PDF: ${file.name}</span>\n`);
        } else {
          alert('仅支持图片和 PDF 文件');
        }
      } catch (error) {
        console.error('File read error', error);
      }
    }
    
    setIsUploading(false);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // --- 拖拽与粘贴支持 ---
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (activeTab !== 'write') return;
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processFiles(files);
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    if (activeTab !== 'write') return;
    
    const items = e.clipboardData.items;
    const files: File[] = [];
    
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === 'file') {
        const file = items[i].getAsFile();
        if (file) files.push(file);
      }
    }

    if (files.length > 0) {
      e.preventDefault();
      // 构造类似 FileList 的对象传给 processFiles
      const dt = new DataTransfer();
      files.forEach(f => dt.items.add(f));
      await processFiles(dt.files);
    }
  };

  // 极简 Markdown 解析器
  const renderMarkdown = (text: string) => {
    if (!text) return <p className="text-slate-400 italic">暂无内容...</p>;
    
    let html = text
      // Headers
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4 text-slate-800 dark:text-white border-b pb-2 border-slate-200 dark:border-slate-700">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mb-3 mt-6 text-slate-800 dark:text-white">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mb-2 mt-4 text-slate-800 dark:text-white">$1</h3>')
      // Style
      .replace(/\*\*(.*)\*\*/gim, '<strong class="font-bold text-slate-900 dark:text-slate-100">$1</strong>')
      .replace(/\*(.*)\*/gim, '<em class="italic">$1</em>')
      .replace(/`([^`\n]+)`/gim, '<code class="bg-slate-100 dark:bg-slate-700 text-pink-500 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
      // Block elements
      .replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-primary/50 pl-4 py-1 my-4 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 italic rounded-r">$1</blockquote>')
      .replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc marker:text-primary">$1</li>')
      // Images (Markdown syntax)
      .replace(/!\[(.*?)\]\((.*?)\)/gim, '<img src="$2" alt="$1" class="rounded-xl shadow-sm my-4 max-h-[500px] object-contain border border-slate-100 dark:border-slate-700" loading="lazy" />')
      // Links
      .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" class="text-primary hover:underline font-medium">$1</a>')
      // Code Blocks
      .replace(/```([\s\S]*?)```/gim, '<pre class="bg-slate-800 text-slate-200 p-4 rounded-xl my-4 overflow-x-auto text-sm font-mono"><code>$1</code></pre>')
      // Line breaks (handle safely to not break HTML tags we inserted like <embed>)
      .replace(/\n/gim, '<br />');

    // 这里的替换比较简单，为了让 <embed> 标签不被上面的 regex 破坏，
    // 我们主要依赖 dangerouslySetInnerHTML。
    // 注意：上面的 regex 可能并不完美，但足以应对基础需求。
    // <embed> 标签是直接作为字符串存入的，所以它会被渲染。
    
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  if (!bookmark) return null;
  const isSplitView = isFullscreen;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-[1px] z-[40] transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={handleClose}
      />

      {/* Panel */}
      <div 
        className={`fixed inset-y-0 right-0 z-[50] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl border-l border-white/20 dark:border-white/5 flex flex-col transition-all duration-300 ease-out transform 
        ${isVisible ? 'translate-x-0' : 'translate-x-full'}
        ${isFullscreen ? 'w-[95vw] max-w-6xl rounded-l-3xl my-4 mr-4 h-[calc(100vh-2rem)] border-y border-r border-white/20 dark:border-white/5' : 'w-full max-w-[500px] h-full'}
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-4 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
               <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center p-1.5 border border-slate-100 dark:border-slate-700 shrink-0">
                  {bookmark.favicon ? (
                    <img src={bookmark.favicon} className="w-full h-full object-cover rounded-lg" alt="" />
                  ) : (
                    <span className="material-symbols-outlined text-slate-400">language</span>
                  )}
               </div>
               <div className="min-w-0">
                  <h2 className="font-bold text-slate-800 dark:text-white truncate text-lg leading-tight">{bookmark.title}</h2>
                  <a href={bookmark.url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline truncate block opacity-80">{bookmark.url}</a>
               </div>
            </div>
            
            <div className="flex items-center gap-2">
                <button 
                  onClick={toggleFullscreen} 
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-primary transition-colors shrink-0"
                  title={isFullscreen ? "退出全屏" : "全屏模式"}
                >
                  <span className="material-symbols-outlined">{isFullscreen ? 'close_fullscreen' : 'open_in_full'}</span>
                </button>
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                <button onClick={handleClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-red-500 transition-colors shrink-0">
                  <span className="material-symbols-outlined">close</span>
                </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
             {isSplitView ? (
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 px-2">
                    <span className="material-symbols-outlined text-[18px]">vertical_split</span>
                    <span className="text-sm font-bold">双栏模式</span>
                </div>
             ) : (
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                    <button 
                    onClick={() => setActiveTab('preview')}
                    className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'preview' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                    >
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    预览
                    </button>
                    <button 
                    onClick={() => setActiveTab('write')}
                    className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'write' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                    >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                    编辑
                    </button>
                </div>
             )}

             <button 
                onClick={handleSave}
                className="flex items-center gap-1 px-4 py-2 bg-primary hover:bg-primary-light text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95"
             >
                <span className="material-symbols-outlined text-[18px]">save</span>
                保存
             </button>
          </div>
        </div>

        {/* Toolbar - Only visible in Write mode or Split View */}
        {(activeTab === 'write' || isSplitView) && (
          <div className="px-6 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1 overflow-x-auto no-scrollbar">
            <button onClick={() => handleFormat('bold')} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500" title="加粗">
              <span className="material-symbols-outlined text-[20px]">format_bold</span>
            </button>
            <button onClick={() => handleFormat('italic')} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500" title="斜体">
              <span className="material-symbols-outlined text-[20px]">format_italic</span>
            </button>
            <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1"></div>
            <button onClick={() => handleFormat('h1')} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500" title="一级标题">
              <span className="material-symbols-outlined text-[20px]">format_h1</span>
            </button>
            <button onClick={() => handleFormat('h2')} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500" title="二级标题">
              <span className="material-symbols-outlined text-[20px]">format_h2</span>
            </button>
             <button onClick={() => handleFormat('list')} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500" title="列表">
              <span className="material-symbols-outlined text-[20px]">format_list_bulleted</span>
            </button>
            <button onClick={() => handleFormat('code')} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500" title="代码块">
              <span className="material-symbols-outlined text-[20px]">code</span>
            </button>
            <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1"></div>
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="p-1.5 rounded hover:bg-blue-50 text-blue-500 hover:text-blue-600 flex items-center gap-1 px-2" 
              title="插入图片或PDF"
              disabled={isUploading}
            >
              <span className="material-symbols-outlined text-[20px]">upload_file</span>
              <span className="text-xs font-bold">{isUploading ? '处理中...' : '插入文件'}</span>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*,application/pdf" 
              multiple 
              onChange={handleFileSelect}
            />
          </div>
        )}

        {/* Content Area */}
        <div className={`flex-1 overflow-hidden relative ${isSplitView ? 'flex flex-row' : ''}`}>
            
            {/* Editor Pane */}
            <div className={`
                ${isSplitView ? 'w-1/2 h-full border-r border-slate-100 dark:border-slate-800 relative' : 'absolute inset-0 w-full h-full transition-opacity duration-200'}
                ${!isSplitView && activeTab === 'write' ? 'opacity-100 z-10' : (!isSplitView ? 'opacity-0 z-0 pointer-events-none' : '')}
            `}>
                <textarea
                  ref={textareaRef}
                  className="w-full h-full p-6 resize-none bg-transparent outline-none font-mono text-sm leading-relaxed text-slate-700 dark:text-slate-300"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onDrop={handleDrop}
                  onPaste={handlePaste}
                  placeholder={`# 记录你的想法...\n\n支持拖拽图片/PDF到此处，或直接粘贴截图。`}
                  spellCheck={false}
                />
                {isUploading && (
                  <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-20">
                    <div className="bg-white dark:bg-slate-800 px-6 py-3 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 flex items-center gap-3">
                      <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-300">正在处理文件...</span>
                    </div>
                  </div>
                )}
            </div>
            
            {/* Preview Pane */}
            <div className={`
                ${isSplitView ? 'w-1/2 h-full relative' : 'absolute inset-0 w-full h-full transition-opacity duration-200'}
                ${!isSplitView && activeTab === 'preview' ? 'opacity-100 z-10' : (!isSplitView ? 'opacity-0 z-0 pointer-events-none' : '')}
                bg-white/50 dark:bg-slate-900/50
            `}>
                <div className="w-full h-full p-6 overflow-y-auto custom-scrollbar">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                        {renderMarkdown(content)}
                    </div>
                </div>
            </div>
        </div>
        
        {/* Footer info */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex justify-between px-6 flex-shrink-0">
           <span>{isSplitView ? '支持拖拽上传文件' : '支持 Markdown 基础语法'}</span>
           <span>{content.length} 字</span>
        </div>
      </div>
    </>
  );
};

export default NotePanel;

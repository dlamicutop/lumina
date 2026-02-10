
import React, { useState } from 'react';
import { Folder } from '../../types';

interface NewFolderModalProps {
  onClose: () => void;
  onAdd: (f: Folder) => void;
}

const NewFolderModal: React.FC<NewFolderModalProps> = ({ onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('folder');
  
  const icons = ['folder', 'work', 'code', 'school', 'menu_book', 'star', 'favorite', 'public', 'cloud', 'album'];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-white/20">
        <div className="p-8 pb-4">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">新建目录</h3>
          <p className="text-sm text-slate-500 mb-6">创建一个新的目录来整理您的书签</p>
          
          <div className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest ml-1">目录名称</label>
              <input 
                type="text" 
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：设计灵感..."
                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest ml-1">图标选择</label>
              <div className="grid grid-cols-5 gap-3">
                {icons.map(i => (
                  <button 
                    key={i}
                    onClick={() => setIcon(i)}
                    className={`aspect-square rounded-xl flex items-center justify-center transition-all ${icon === i ? 'bg-primary text-white shadow-lg shadow-blue-500/30' : 'bg-slate-50 dark:bg-slate-900 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  >
                    <span className="material-symbols-outlined">{i}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 mt-4 flex justify-end gap-3">
           <button onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-all">取消</button>
           <button 
            disabled={!name}
            onClick={() => onAdd({ id: Math.random().toString(), name, icon, count: 0, parentId: 'all' })}
            className="px-8 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary-light rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            创建
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewFolderModal;

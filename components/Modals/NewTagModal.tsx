
import React, { useState } from 'react';
import { Tag } from '../../types';
import { TAG_COLORS } from '../../constants';

interface NewTagModalProps {
  onClose: () => void;
  onAdd: (t: Tag) => void;
}

const NewTagModal: React.FC<NewTagModalProps> = ({ onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('blue');
  
  const colors = Object.keys(TAG_COLORS).filter(c => c !== 'slate');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-white/20">
        <div className="p-8">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">新建标签</h3>
          
          <div className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest ml-1">标签名称</label>
              <input 
                type="text" 
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="标签名"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest ml-1">选择颜色</label>
              <div className="flex flex-wrap gap-3">
                {colors.map(c => (
                  <button 
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full transition-all ${TAG_COLORS[c].bg} border-2 ${color === c ? 'border-primary scale-125' : 'border-transparent'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button onClick={onClose} className="px-5 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-lg">取消</button>
            <button 
              disabled={!name}
              onClick={() => onAdd({ id: Math.random().toString(), name, color, count: 0 })}
              className="px-6 py-2 text-sm font-bold text-white bg-primary hover:bg-primary-light rounded-lg shadow-md disabled:opacity-50"
            >
              确定创建
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewTagModal;

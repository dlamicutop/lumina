
import React, { useState } from 'react';
import { api } from '../services/api';

interface LoginProps {
  onLogin: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, isDarkMode, toggleTheme }) => {
  const [email, setEmail] = useState('demo@lumina.app');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    
    try {
      const response = await api.auth.login({ email, password });
      if (response.success) {
        onLogin();
      } else {
        setErrorMsg(response.message || '登录失败，请检查账号密码');
      }
    } catch (err) {
      setErrorMsg('网络连接错误，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0B0E14] relative transition-colors duration-500">
      
      {/* 主题切换按钮 - 优化样式 */}
      <button 
        onClick={toggleTheme}
        className="absolute top-6 right-6 z-20 w-12 h-12 rounded-full bg-white dark:bg-slate-800 shadow-md flex items-center justify-center text-slate-500 dark:text-yellow-400 hover:text-primary dark:hover:text-yellow-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:scale-110 active:scale-95 group"
        title={isDarkMode ? "切换到亮色模式" : "切换到暗色模式"}
      >
        <span className="material-symbols-outlined filled group-hover:rotate-[360deg] transition-transform duration-500 text-[22px]">
            {isDarkMode ? 'light_mode' : 'dark_mode'}
        </span>
      </button>

      {/* 背景装饰光斑 */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-400/30 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-400/30 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-cyan-400/20 rounded-full blur-[100px] animate-bounce" style={{ animationDuration: '8s' }}></div>

      {/* 登录卡片 */}
      <div className="relative z-10 w-full max-w-md p-8 mx-4">
        <div className="glass-panel p-10 rounded-3xl shadow-2xl border border-white/50 dark:border-white/10 backdrop-blur-2xl transition-all duration-300">
          
          {/* Logo 区 */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4 transform rotate-3">
              <span className="material-symbols-outlined text-4xl text-white filled">bookmark</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight mb-1">Lumina</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">您的灵感书签管理助手</p>
          </div>

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">账号</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">mail</span>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary/30 focus:border-primary/50 outline-none transition-all font-medium text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">密码</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">lock</span>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary/30 focus:border-primary/50 outline-none transition-all font-medium text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="text-red-500 text-xs text-center bg-red-50 dark:bg-red-900/20 py-2 rounded-lg animate-in fade-in slide-in-from-top-1">
                {errorMsg}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span className="text-white/90">正在进入...</span>
                </>
              ) : (
                <>
                  <span>立即登录</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* 底部信息 */}
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400">
              点击登录即可体验 API Mock 数据
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Link, Copy, Download, Sparkles, X, Check, Clock, Trash2, ChevronRight, History } from 'lucide-react';

export default function App() {
  const [url, setUrl] = useState('');
  const [isGenerated, setIsGenerated] = useState(false);
  const [qrSrc, setQrSrc] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // 历史记录相关状态
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const cardRef = useRef(null);

  // 初始化加载历史记录
  useEffect(() => {
    const savedHistory = localStorage.getItem('qr-history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  // 保存历史记录到本地
  const saveHistoryToLocal = (newHistory) => {
    setHistory(newHistory);
    localStorage.setItem('qr-history', JSON.stringify(newHistory));
  };

  // 添加到历史记录
  const addToHistory = (link) => {
    const newItem = {
      id: Date.now(),
      url: link,
      timestamp: new Date().toISOString(),
    };

    // 移除重复项（如果已存在，将其移到最前）
    const filteredHistory = history.filter(item => item.url !== link);
    const newHistory = [newItem, ...filteredHistory].slice(0, 20); // 只保留最近20条
    saveHistoryToLocal(newHistory);
  };

  // 删除单条历史
  const deleteHistoryItem = (e, id) => {
    e.stopPropagation(); // 防止触发点击选中
    const newHistory = history.filter(item => item.id !== id);
    saveHistoryToLocal(newHistory);
  };

  // 清空历史
  const clearHistory = () => {
    saveHistoryToLocal([]);
  };

  // 从历史记录恢复
  const restoreFromHistory = (item) => {
    setUrl(item.url);
    setShowHistory(false);
    // 直接进入生成状态
    const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(item.url)}&bgcolor=ffffff&color=000000&qzone=1&margin=0`;
    setQrSrc(apiUrl);
    setIsGenerated(true);
  };

  // 处理生成逻辑
  const handleGenerate = () => {
    if (!url.trim()) return;
    
    setLoading(true);
    // 模拟一种流畅的加载感，同时收起键盘或输入框焦点
    setTimeout(() => {
      // 使用可靠的 API 生成二维码
      const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(url)}&bgcolor=ffffff&color=000000&qzone=1&margin=0`;
      setQrSrc(apiUrl);
      setLoading(false);
      setIsGenerated(true);
      addToHistory(url); // 添加到历史
    }, 600);
  };

  // 处理重置
  const handleReset = () => {
    setIsGenerated(false);
    setTimeout(() => {
      setUrl('');
      setQrSrc('');
    }, 300); 
  };

  // 处理下载
  const handleDownload = async () => {
    try {
      const response = await fetch(qrSrc);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `qrcode-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed', error);
    }
  };

  // 处理复制链接
  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 监听回车键
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleGenerate();
    }
  };

  // 格式化时间显示
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now - date;
    
    // 如果是今天
    if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    // 否则显示日期
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-indigo-100 selection:text-indigo-900 font-sans text-slate-800 relative overflow-hidden">
      
      {/* 背景装饰元素 */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[40%] h-[40%] bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* 主卡片 */}
      <div 
        ref={cardRef}
        className={`
          relative z-10 bg-white w-full max-w-md rounded-[2rem] shadow-2xl 
          border border-white/50 backdrop-blur-sm
          transition-all duration-[800ms] cubic-bezier(0.34, 1.56, 0.64, 1)
          ${isGenerated ? 'p-0 overflow-hidden' : 'p-8'}
        `}
        style={{
          transform: isGenerated ? 'translateY(0)' : 'translateY(0)',
        }}
      >
        
        {/* === 顶部控制栏 (仅在非结果页且非历史页显示，或根据需要调整) === */}
        {!isGenerated && (
          <div className="absolute top-6 right-6 z-20">
             <button
                onClick={() => setShowHistory(true)}
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                title="历史记录"
             >
                <History size={20} />
             </button>
          </div>
        )}

        {/* === 状态 1: 输入界面 === */}
        <div className={`
          flex flex-col gap-6 transition-all duration-500 ease-in-out
          ${isGenerated || showHistory ? 'opacity-0 translate-y-[-20px] pointer-events-none absolute w-full left-0 px-8' : 'opacity-100 translate-y-0 relative'}
        `}>
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl mx-auto flex items-center justify-center mb-4 text-indigo-600 shadow-sm transform transition-transform hover:scale-110 duration-300">
              <QrCode size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">链接转二维码</h1>
            <p className="text-slate-500 text-sm">输入任意网址，生成精美卡片</p>
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
              <Link size={20} />
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="https://example.com"
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)] transition-all duration-300 placeholder:text-slate-400 font-medium"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={!url || loading}
            className={`
              w-full py-4 rounded-2xl font-bold text-white shadow-lg shadow-indigo-200
              flex items-center justify-center gap-2
              transition-all duration-300 transform active:scale-95
              ${!url ? 'bg-slate-300 cursor-not-allowed shadow-none' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-300'}
            `}
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles size={20} />
                <span>立即生成</span>
              </>
            )}
          </button>
        </div>

        {/* === 状态 2: 结果卡片界面 === */}
        <div className={`
           flex flex-col w-full bg-white h-full
           transition-all duration-700 delay-100 ease-[cubic-bezier(0.34,1.56,0.64,1)]
           ${isGenerated ? 'opacity-100 translate-y-0 relative z-10' : 'opacity-0 translate-y-[40px] absolute pointer-events-none top-0 left-0'}
        `}>
          {/* 顶部深色区域 */}
          <div className="bg-slate-900 p-8 pb-12 text-center text-white relative">
             <button 
               onClick={handleReset}
               className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-md"
             >
               <X size={20} className="text-white/80" />
             </button>
             <h2 className="text-lg font-medium text-white/90 mb-1">扫码访问</h2>
             <p className="text-white/50 text-xs uppercase tracking-widest font-semibold">Scan to visit</p>
          </div>

          {/* 二维码容器 (浮动在交界处) */}
          <div className="relative -mt-10 px-8 flex justify-center">
            <div className="p-2 bg-white rounded-3xl shadow-xl shadow-slate-200/50 transform transition-transform hover:scale-[1.02] duration-500 cursor-pointer">
              <div className="bg-white rounded-2xl overflow-hidden relative group">
                <img 
                  key={qrSrc}
                  src={qrSrc} 
                  alt="QR Code" 
                  className="w-48 h-48 object-contain mix-blend-multiply"
                />
                <div className="absolute inset-0 bg-indigo-900/0 group-hover:bg-indigo-900/5 transition-colors duration-300" />
              </div>
            </div>
          </div>

          {/* 底部信息区域 */}
          <div className="p-8 pt-6 space-y-6">
            
            {/* 链接显示 */}
            <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between group hover:bg-indigo-50/50 transition-colors border border-slate-100 hover:border-indigo-100">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm shrink-0">
                   <Link size={14} />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-xs text-slate-400 font-medium">原始链接</span>
                  <span className="text-sm text-slate-700 font-medium truncate w-full max-w-[180px]">
                    {url}
                  </span>
                </div>
              </div>
              <button 
                onClick={handleCopyLink}
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
                title="复制链接"
              >
                {copied ? <Check size={18} className="text-green-500"/> : <Copy size={18} />}
              </button>
            </div>

            {/* 操作按钮组 */}
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={handleDownload}
                className="col-span-2 flex items-center justify-center gap-2 bg-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-200"
              >
                <Download size={18} />
                保存二维码图片
              </button>
            </div>
          </div>
        </div>

        {/* === 状态 3: 历史记录界面 (Overlay) === */}
        <div className={`
          absolute inset-0 z-30 bg-white flex flex-col
          transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)
          ${showHistory ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}
        `}>
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-2 text-slate-800">
               <History size={20} className="text-indigo-600" />
               <span className="font-bold text-lg">历史记录</span>
            </div>
            <div className="flex items-center gap-2">
               {history.length > 0 && (
                 <button 
                   onClick={clearHistory}
                   className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                   title="清空历史"
                 >
                   <Trash2 size={18} />
                 </button>
               )}
               <button 
                 onClick={() => setShowHistory(false)}
                 className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors"
               >
                 <X size={18} />
               </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
             {history.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 pb-12">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                    <Clock size={32} className="opacity-50" />
                  </div>
                  <p>暂无历史记录</p>
               </div>
             ) : (
               history.map((item) => (
                 <div 
                   key={item.id}
                   onClick={() => restoreFromHistory(item)}
                   className="group bg-slate-50 hover:bg-white border border-slate-100 hover:border-indigo-200 rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all hover:shadow-md"
                 >
                    <div className="flex items-center gap-3 overflow-hidden flex-1">
                       <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-indigo-500 shadow-sm shrink-0 border border-slate-100">
                          <QrCode size={18} />
                       </div>
                       <div className="flex flex-col overflow-hidden">
                          <span className="text-sm font-medium text-slate-700 truncate">{item.url}</span>
                          <span className="text-xs text-slate-400">{formatTime(item.timestamp)}</span>
                       </div>
                    </div>
                    
                    <div className="flex items-center pl-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button 
                         onClick={(e) => deleteHistoryItem(e, item.id)}
                         className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg mr-1"
                       >
                         <Trash2 size={16} />
                       </button>
                       <div className="text-indigo-400">
                          <ChevronRight size={18} />
                       </div>
                    </div>
                 </div>
               ))
             )}
          </div>
        </div>

      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

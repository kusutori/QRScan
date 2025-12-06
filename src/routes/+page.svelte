<script lang="ts">
  import { onMount } from 'svelte';
  import { QrCode, Link, Copy, Download, Sparkles, X, Check, Clock, Trash2, ChevronRight, History } from 'lucide-svelte';

  let url = $state('');
  let isGenerated = $state(false);
  let qrSrc = $state('');
  let loading = $state(false);
  let copied = $state(false);
  
  interface HistoryItem {
    id: number;
    url: string;
    timestamp: string;
  }

  let history = $state<HistoryItem[]>([]);
  let showHistory = $state(false);
  let cardElement: HTMLElement;

  onMount(() => {
    const savedHistory = localStorage.getItem('qr-history');
    if (savedHistory) {
      try {
        history = JSON.parse(savedHistory);
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  });

  function saveHistoryToLocal(newHistory: HistoryItem[]) {
    history = newHistory;
    localStorage.setItem('qr-history', JSON.stringify(newHistory));
  }

  function addToHistory(link: string) {
    const newItem: HistoryItem = {
      id: Date.now(),
      url: link,
      timestamp: new Date().toISOString(),
    };

    const filteredHistory = history.filter(item => item.url !== link);
    const newHistory = [newItem, ...filteredHistory].slice(0, 20);
    saveHistoryToLocal(newHistory);
  }

  function deleteHistoryItem(e: Event, id: number) {
    e.stopPropagation();
    const newHistory = history.filter(item => item.id !== id);
    saveHistoryToLocal(newHistory);
  }

  function clearHistory() {
    saveHistoryToLocal([]);
  }

  function restoreFromHistory(item: HistoryItem) {
    url = item.url;
    showHistory = false;
    const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(item.url)}&bgcolor=ffffff&color=000000&qzone=1&margin=0`;
    qrSrc = apiUrl;
    isGenerated = true;
  }

  function handleGenerate() {
    if (!url.trim()) return;
    
    loading = true;
    setTimeout(() => {
      const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(url)}&bgcolor=ffffff&color=000000&qzone=1&margin=0`;
      qrSrc = apiUrl;
      loading = false;
      isGenerated = true;
      addToHistory(url);
    }, 600);
  }

  function handleReset() {
    isGenerated = false;
    setTimeout(() => {
      url = '';
      qrSrc = '';
    }, 300); 
  }

  async function handleDownload() {
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
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(url);
    copied = true;
    setTimeout(() => copied = false, 2000);
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      handleGenerate();
    }
  }

  function formatTime(isoString: string) {
    const date = new Date(isoString);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
</script>

<div class="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-indigo-100 selection:text-indigo-900 font-sans text-slate-800 relative overflow-hidden">
  
  <!-- Background Decor -->
  <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
    <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
    <div class="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
    <div class="absolute bottom-[-20%] left-[20%] w-[40%] h-[40%] bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
  </div>

  <!-- Main Card -->
  <div 
    bind:this={cardElement}
    class="relative z-10 bg-white w-full max-w-md rounded-[2rem] shadow-2xl border border-white/50 backdrop-blur-sm transition-all duration-[800ms] cubic-bezier(0.34, 1.56, 0.64, 1) {isGenerated ? 'p-0 overflow-hidden' : 'p-8'}"
  >
    
    <!-- Control Bar -->
    {#if !isGenerated}
      <div class="absolute top-6 right-6 z-20">
         <button
            onclick={() => showHistory = true}
            class="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
            title="历史记录"
         >
            <History size={20} />
         </button>
      </div>
    {/if}

    <!-- State 1: Input -->
    <div class="flex flex-col gap-6 transition-all duration-500 ease-in-out {isGenerated || showHistory ? 'opacity-0 translate-y-[-20px] pointer-events-none absolute w-full left-0 px-8' : 'opacity-100 translate-y-0 relative'}">
      <div class="text-center space-y-2">
        <div class="w-16 h-16 bg-indigo-50 rounded-2xl mx-auto flex items-center justify-center mb-4 text-indigo-600 shadow-sm transform transition-transform hover:scale-110 duration-300">
          <QrCode size={32} />
        </div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">链接转二维码</h1>
        <p class="text-slate-500 text-sm">输入任意网址，生成精美卡片</p>
      </div>

      <div class="relative group">
        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
          <Link size={20} />
        </div>
        <input
          type="text"
          bind:value={url}
          onkeydown={handleKeyDown}
          placeholder="https://example.com"
          class="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)] transition-all duration-300 placeholder:text-slate-400 font-medium"
        />
      </div>

      <button
        onclick={handleGenerate}
        disabled={!url || loading}
        class="w-full py-4 rounded-2xl font-bold text-white shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-all duration-300 transform active:scale-95 {!url ? 'bg-slate-300 cursor-not-allowed shadow-none' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-300'}"
      >
        {#if loading}
          <div class="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        {:else}
            <Sparkles size={20} />
            <span>立即生成</span>
        {/if}
      </button>
    </div>

    <!-- State 2: Result -->
    <div class="flex flex-col w-full bg-white h-full transition-all duration-700 delay-100 ease-[cubic-bezier(0.34,1.56,0.64,1)] {isGenerated ? 'opacity-100 translate-y-0 relative z-10' : 'opacity-0 translate-y-[40px] absolute pointer-events-none top-0 left-0'}">
      <!-- Header -->
      <div class="bg-slate-900 p-8 pb-12 text-center text-white relative">
         <button 
           onclick={handleReset}
           class="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-md"
         >
           <X size={20} class="text-white/80" />
         </button>
         <h2 class="text-lg font-medium text-white/90 mb-1">扫码访问</h2>
         <p class="text-white/50 text-xs uppercase tracking-widest font-semibold">Scan to visit</p>
      </div>

      <!-- QR Container -->
      <div class="relative -mt-10 px-8 flex justify-center">
        <div class="p-2 bg-white rounded-3xl shadow-xl shadow-slate-200/50 transform transition-transform hover:scale-[1.02] duration-500 cursor-pointer">
          <div class="bg-white rounded-2xl overflow-hidden relative group">
            {#if qrSrc}
              <img 
                src={qrSrc} 
                alt="QR Code" 
                class="w-48 h-48 object-contain mix-blend-multiply"
              />
            {/if}
            <div class="absolute inset-0 bg-indigo-900/0 group-hover:bg-indigo-900/5 transition-colors duration-300"></div>
          </div>
        </div>
      </div>

      <!-- Bottom Info -->
      <div class="p-8 pt-6 space-y-6">
        <div class="bg-slate-50 rounded-xl p-4 flex items-center justify-between group hover:bg-indigo-50/50 transition-colors border border-slate-100 hover:border-indigo-100">
          <div class="flex items-center gap-3 overflow-hidden">
            <div class="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm shrink-0">
               <Link size={14} />
            </div>
            <div class="flex flex-col overflow-hidden">
              <span class="text-xs text-slate-400 font-medium">原始链接</span>
              <span class="text-sm text-slate-700 font-medium truncate w-full max-w-[180px]">
                {url}
              </span>
            </div>
          </div>
          <button 
            onclick={handleCopyLink}
            class="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
            title="复制链接"
          >
            {#if copied}
              <Check size={18} class="text-green-500"/>
            {:else}
              <Copy size={18} />
            {/if}
          </button>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <button 
            onclick={handleDownload}
            class="col-span-2 flex items-center justify-center gap-2 bg-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-200"
          >
            <Download size={18} />
            保存二维码图片
          </button>
        </div>
      </div>
    </div>

    <!-- State 3: History -->
    <div class="absolute inset-0 z-30 bg-white flex flex-col transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) {showHistory ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}">
      <!-- Header -->
      <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div class="flex items-center gap-2 text-slate-800">
           <History size={20} class="text-indigo-600" />
           <span class="font-bold text-lg">历史记录</span>
        </div>
        <div class="flex items-center gap-2">
           {#if history.length > 0}
             <button 
               onclick={clearHistory}
               class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
               title="清空历史"
             >
               <Trash2 size={18} />
             </button>
           {/if}
           <button 
             onclick={() => showHistory = false}
             class="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors"
           >
             <X size={18} />
           </button>
        </div>
      </div>

      <!-- List -->
      <div class="flex-1 overflow-y-auto p-4 space-y-3">
         {#if history.length === 0}
           <div class="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 pb-12">
              <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                <Clock size={32} class="opacity-50" />
              </div>
              <p>暂无历史记录</p>
           </div>
         {:else}
           {#each history as item (item.id)}
             <div 
               role="button"
               tabindex="0"
               onclick={() => restoreFromHistory(item)}
               onkeydown={(e) => e.key === 'Enter' && restoreFromHistory(item)}
               class="group bg-slate-50 hover:bg-white border border-slate-100 hover:border-indigo-200 rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all hover:shadow-md"
             >
                <div class="flex items-center gap-3 overflow-hidden flex-1">
                   <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-indigo-500 shadow-sm shrink-0 border border-slate-100">
                      <QrCode size={18} />
                   </div>
                   <div class="flex flex-col overflow-hidden">
                      <span class="text-sm font-medium text-slate-700 truncate">{item.url}</span>
                      <span class="text-xs text-slate-400">{formatTime(item.timestamp)}</span>
                   </div>
                </div>
                
                <div class="flex items-center pl-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button 
                     onclick={(e) => deleteHistoryItem(e, item.id)}
                     class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg mr-1"
                   >
                     <Trash2 size={16} />
                   </button>
                   <div class="text-indigo-400">
                      <ChevronRight size={18} />
                   </div>
                </div>
             </div>
           {/each}
         {/if}
      </div>
    </div>

  </div>
</div>

<style>
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  .animation-delay-4000 {
    animation-delay: 4s;
  }
</style>
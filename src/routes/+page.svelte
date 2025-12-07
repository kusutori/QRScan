<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { QrCode, Link, Copy, Download, Sparkles, Check, ArrowLeft } from 'lucide-svelte';
  import { writeText } from '@tauri-apps/plugin-clipboard-manager';

  let url = $state('');
  let isGenerated = $state(false);
  let qrSrc = $state('');
  let loading = $state(false);
  let copied = $state(false);
  let showResultMobile = $state(false);
  let headerGradientClass = $state('from-slate-900 to-slate-800');

  const gradients = [
    'from-indigo-900 to-slate-900',
    'from-purple-900 to-slate-900', 
    'from-blue-900 to-slate-900',
    'from-emerald-900 to-slate-900',
    'from-rose-900 to-slate-900',
    'from-cyan-900 to-slate-900'
  ];
  
  interface HistoryItem {
    id: number;
    url: string;
    timestamp: string;
  }
  
  function addToHistory(link: string) {
    const savedHistory = localStorage.getItem('qr-history');
    let history: HistoryItem[] = [];
    if (savedHistory) {
        try { history = JSON.parse(savedHistory); } catch(e) {}
    }
    
    const newItem: HistoryItem = {
      id: Date.now(),
      url: link,
      timestamp: new Date().toISOString(),
    };

    const filteredHistory = history.filter(item => item.url !== link);
    const newHistory = [newItem, ...filteredHistory].slice(0, 20);
    localStorage.setItem('qr-history', JSON.stringify(newHistory));
  }

  function handleGenerate() {
    if (!url.trim()) return;
    
    loading = true;
    setTimeout(() => {
      const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(url)}&bgcolor=ffffff&color=000000&qzone=1&margin=0`;
      qrSrc = apiUrl;
      loading = false;
      isGenerated = true;
      showResultMobile = true;
      // Pick random gradient
      const randomIdx = Math.floor(Math.random() * gradients.length);
      headerGradientClass = gradients[randomIdx];

      addToHistory(url);
    }, 600);
  }

  function handleMobileBack() {
    showResultMobile = false;
  }

  async function handleDownload() {
    if (!qrSrc) return;
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

  async function handleCopyLink() {
    try {
        await writeText(url);
        copied = true;
        setTimeout(() => copied = false, 2000);
    } catch (err) {
        console.error('Failed to copy: ', err);
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      handleGenerate();
    }
  }
</script>

<div class="p-6 max-w-5xl mx-auto w-full pt-12 md:pt-6 h-full flex flex-col">
  <div class="flex items-center gap-4 mb-8 shrink-0">
    <div class="p-3 bg-white/50 backdrop-blur-md text-indigo-600 rounded-xl shadow-sm border border-white/60">
      <QrCode size={24} />
    </div>
    <h1 class="text-2xl font-bold text-slate-800 tracking-tight">生成二维码</h1>
  </div>

  <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 min-h-0 items-start perspective-1000 relative transition-all duration-1000 ease-in-out">
    <!-- Left Column: Input (Front of Card on Mobile) -->
    <div class="
        flex flex-col gap-6 
        col-start-1 row-start-1 
        w-full
        transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform-style-3d backface-hidden
        md:col-start-1 md:row-start-1 md:transform-none md:opacity-100 md:relative md:pointer-events-auto
        {showResultMobile ? 'max-md:[transform:rotateX(-180deg)] max-md:opacity-0 max-md:absolute max-md:pointer-events-none' : 'max-md:[transform:rotateX(0deg)] max-md:opacity-100 max-md:relative'}
    ">
      <div class="bg-white/70 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-white/50 transition-all duration-500 hover:shadow-indigo-100/50 h-full">
        <label for="url-input" class="block text-sm font-bold text-slate-700 mb-4 ml-1">链接地址</label>
        <div class="relative group mb-8">
            <div class="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-300">
              <Link size={20} />
            </div>
            <input
              id="url-input"
              type="text"
              bind:value={url}
              onkeydown={handleKeyDown}
              placeholder="https://example.com"
              class="w-full pl-14 pr-6 py-5 bg-slate-50/50 border-2 border-slate-100/80 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)] transition-all duration-300 placeholder:text-slate-400 font-medium text-lg"
            />
        </div>
        
        <button
            onclick={handleGenerate}
            disabled={!url || loading}
            class="w-full py-5 rounded-2xl font-bold text-lg text-white shadow-xl shadow-indigo-200/80 flex items-center justify-center gap-2 transition-all duration-300 transform hover:-translate-y-1 active:scale-[0.98] active:translate-y-0 {!url ? 'bg-slate-300 cursor-not-allowed shadow-none' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-400/50'}"
        >
            {#if loading}
            <div class="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            {:else}
                <Sparkles size={20} />
                <span>立即生成</span>
            {/if}
        </button>
      </div>
    </div>

    <!-- Right Column: Preview (Back of Card on Mobile) -->
    <div class="
        relative perspective-1000
        col-start-1 row-start-1 
        w-full
        transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform-style-3d backface-hidden
        md:col-start-2 md:row-start-1 md:transform-none md:opacity-100 md:relative md:pointer-events-auto
        {showResultMobile ? 'max-md:[transform:rotateX(0deg)] max-md:opacity-100 max-md:relative' : 'max-md:[transform:rotateX(180deg)] max-md:opacity-0 max-md:absolute max-md:pointer-events-none'}
    ">
        <div 
            class="
                relative w-full bg-white/60 backdrop-blur-md border border-white/60 shadow-2xl flex flex-col overflow-hidden
                transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1)
                rounded-[2.5rem]
                {isGenerated ? 'shadow-indigo-200/40 bg-white/80 scale-100 opacity-100' : 'shadow-slate-200/40 bg-white/30 scale-[0.98] opacity-80 grayscale-[0.5]'}
            "
            style="min-height: {isGenerated ? '520px' : '400px'}"
        >
            <!-- Mobile Back Button -->
            <button 
                onclick={handleMobileBack}
                class="md:hidden absolute top-6 left-6 z-30 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors border border-white/20 shadow-lg"
            >
                <ArrowLeft size={24} />
            </button>
            
            <!-- Dark Header for Preview (Overlay) -->
            <div 
                class="absolute top-0 left-0 w-full z-0 transition-all duration-700 ease-out origin-top overflow-hidden"
                style="height: {isGenerated ? '140px' : '0px'}; opacity: {isGenerated ? 1 : 0}"
            >
                <div class="w-full h-full bg-gradient-to-br {headerGradientClass} relative transition-colors duration-1000">
                    <!-- Decorative Gradients (Subtle Overlay) -->
                    <div class="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl translate-x-10 -translate-y-10 mix-blend-overlay"></div>
                    <div class="absolute bottom-0 left-0 w-40 h-40 bg-black/20 rounded-full blur-3xl -translate-x-10 translate-y-10 mix-blend-overlay"></div>
                    
                    <!-- Header Content -->
                    <div class="absolute inset-0 flex flex-col items-center justify-center pb-6">
                         <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 shadow-lg mb-2">
                            <span class="text-lg animate-bounce">📱</span>
                            <span class="text-white/90 text-xs font-bold tracking-widest uppercase">Scan Me</span>
                         </div>
                         <div class="text-white/40 text-[10px] font-mono tracking-widest">{new Date().toLocaleDateString()}</div>
                    </div>
                </div>
            </div>

            <div class="flex-1 flex flex-col items-center justify-center p-8 relative z-10 mt-12">
                {#if isGenerated}
                    <div in:fly={{ y: 20, duration: 600, delay: 200, easing: cubicOut }} class="relative mt-4 mb-4 transition-all duration-500 transform hover:scale-[1.05] hover:-translate-y-2 cursor-pointer">
                         <div class="p-3 bg-white rounded-3xl shadow-2xl shadow-slate-900/20 ring-1 ring-white/50">
                            <div class="bg-white rounded-2xl overflow-hidden relative group-qr">
                                <img 
                                    src={qrSrc} 
                                    alt="QR Code" 
                                    class="w-56 h-56 object-contain mix-blend-multiply"
                                />
                                <div class="absolute inset-0 bg-indigo-900/0 group-qr-hover:bg-indigo-900/5 transition-colors duration-300"></div>
                            </div>
                         </div>
                    </div>
                {:else}
                    <div in:fade={{ duration: 300 }} class="text-slate-400 flex flex-col items-center gap-6 transition-all duration-500 absolute inset-0 flex items-center justify-center">
                        <div class="w-24 h-24 bg-white/50 rounded-3xl flex items-center justify-center shadow-inner border border-white/50">
                            <QrCode size={40} />
                        </div>
                        <p class="font-medium tracking-wide text-slate-500">输入链接生成预览</p>
                    </div>
                {/if}
            </div>

            {#if isGenerated}
                <div in:fly={{ y: 50, duration: 600, delay: 300, easing: cubicOut }} class="p-8 pt-0 z-10">
                    <div class="flex items-center gap-3 mb-6 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-white shadow-sm group-hover:border-indigo-100 transition-colors">
                        <div class="p-2 bg-indigo-50 rounded-lg text-indigo-500 shrink-0">
                            <Link size={16} />
                        </div>
                        <div class="flex-1 truncate text-sm text-slate-600 font-medium select-all">{url}</div>
                        <button 
                            onclick={handleCopyLink} 
                            class="relative group-btn p-2 rounded-xl transition-all duration-300 active:scale-90 {copied ? 'bg-green-50 text-green-600' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}" 
                            title="复制链接"
                        >
                            <div class="transition-all duration-300 transform {copied ? 'scale-100 rotate-0' : 'scale-100 rotate-0'}">
                                {#if copied} 
                                    <Check size={18} strokeWidth={3} /> 
                                {:else} 
                                    <Copy size={18} /> 
                                {/if}
                            </div>
                        </button>
                    </div>
                    <button 
                        onclick={handleDownload}
                        class="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-300 flex items-center justify-center gap-2 active:scale-95 hover:-translate-y-1"
                    >
                        <Download size={20} />
                        下载图片
                    </button>
                </div>
            {/if}
        </div>
    </div>
  </div>
</div>

<style>
    .perspective-1000 {
        perspective: 1000px;
    }
    .transform-style-3d {
        transform-style: preserve-3d;
    }
    .backface-hidden {
        backface-visibility: hidden;
    }
</style>

<script lang="ts">
  import { onMount } from 'svelte';
  import { History, QrCode, Trash2, ChevronRight, Clock, X } from 'lucide-svelte';

  interface HistoryItem {
    id: number;
    url: string;
    timestamp: string;
  }

  let history = $state<HistoryItem[]>([]);

  onMount(() => {
    loadHistory();
  });

  function loadHistory() {
    const savedHistory = localStorage.getItem('qr-history');
    if (savedHistory) {
      try {
        history = JSON.parse(savedHistory);
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }

  function deleteHistoryItem(e: Event, id: number) {
    e.stopPropagation();
    const newHistory = history.filter(item => item.id !== id);
    history = newHistory;
    localStorage.setItem('qr-history', JSON.stringify(newHistory));
  }

  function clearHistory() {
    if(confirm('确定要清空历史记录吗？')) {
        history = [];
        localStorage.setItem('qr-history', JSON.stringify([]));
    }
  }

  function formatTime(isoString: string) {
    const date = new Date(isoString);
    return date.toLocaleString();
  }
</script>

<div class="p-6 max-w-4xl mx-auto w-full pt-12 md:pt-6 h-full flex flex-col">
  <div class="flex items-center justify-between mb-8 shrink-0">
    <div class="flex items-center gap-4">
        <div class="p-3 bg-purple-100 text-purple-600 rounded-xl">
        <History size={24} />
        </div>
        <h1 class="text-2xl font-bold">历史记录</h1>
    </div>
    
    {#if history.length > 0}
        <button 
            onclick={clearHistory}
            class="flex items-center gap-2 px-4 py-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors text-sm font-medium"
        >
            <Trash2 size={16} />
            清空
        </button>
    {/if}
  </div>
  
  <div class="bg-white rounded-3xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col">
     {#if history.length === 0}
        <div class="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4">
            <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                <Clock size={32} class="opacity-50" />
            </div>
            <p>暂无历史记录</p>
        </div>
     {:else}
        <div class="overflow-y-auto p-4 space-y-2">
            {#each history as item (item.id)}
                <div class="group bg-slate-50 hover:bg-white border border-slate-100 hover:border-indigo-200 rounded-xl p-4 flex items-center justify-between transition-all hover:shadow-md">
                    <div class="flex items-center gap-4 overflow-hidden flex-1">
                        <div class="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-500 shadow-sm shrink-0 border border-slate-100">
                            <QrCode size={20} />
                        </div>
                        <div class="flex flex-col overflow-hidden">
                            <span class="font-medium text-slate-700 truncate">{item.url}</span>
                            <span class="text-xs text-slate-400 mt-1">{formatTime(item.timestamp)}</span>
                        </div>
                    </div>
                    
                    <button 
                        onclick={(e) => deleteHistoryItem(e, item.id)}
                        class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        title="删除"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            {/each}
        </div>
     {/if}
  </div>
</div>
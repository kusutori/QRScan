<script>
  import { Settings, Moon, Globe, Github, Monitor, Sun } from 'lucide-svelte';
  import { setMode, mode, userPrefersMode } from 'mode-watcher';
</script>

<div class="p-6 max-w-2xl mx-auto w-full pt-12 md:pt-6">
  <div class="flex items-center gap-4 mb-8">
    <div class="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl transition-colors">
      <Settings size={24} />
    </div>
    <h1 class="text-2xl font-bold dark:text-white transition-colors">设置</h1>
  </div>
  
  <div class="space-y-4">
    <!-- Theme Settings -->
    <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between transition-colors">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 transition-colors">
            {#if mode.current === 'dark'}
                <Moon size={20} />
            {:else if mode.current === 'light'}
                <Sun size={20} />
            {:else}
                <Monitor size={20} />
            {/if}
        </div>
        <span class="font-medium dark:text-slate-200 transition-colors">外观模式</span>
      </div>
      
      <div class="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl transition-colors">
        <button 
            onclick={() => setMode('light')}
            class="p-2 rounded-lg transition-all duration-200 {userPrefersMode.current === 'light' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}"
            title="浅色"
        >
            <Sun size={18} />
        </button>
        <button 
            onclick={() => setMode('system')}
            class="p-2 rounded-lg transition-all duration-200 {userPrefersMode.current === 'system' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}"
            title="跟随系统"
        >
            <Monitor size={18} />
        </button>
        <button 
            onclick={() => setMode('dark')}
            class="p-2 rounded-lg transition-all duration-200 {userPrefersMode.current === 'dark' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}"
            title="深色"
        >
            <Moon size={18} />
        </button>
      </div>
    </div>
    
    <!-- Language Settings (Placeholder) -->
    <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between transition-colors">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 transition-colors"><Globe size={20} /></div>
        <span class="font-medium dark:text-slate-200 transition-colors">语言</span>
      </div>
      <div class="text-sm text-slate-400">简体中文</div>
    </div>

    <!-- Github Link -->
    <a href="https://github.com" target="_blank" class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 group-hover:text-black dark:group-hover:text-white transition-colors"><Github size={20} /></div>
        <span class="font-medium dark:text-slate-200 transition-colors">开源地址</span>
      </div>
    </a>
  </div>
</div>

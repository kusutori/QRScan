<script lang="ts">
  import { page } from '$app/stores';
  import { navItems } from '$lib/nav-items';
</script>

<aside class="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 h-screen sticky top-0 shrink-0 overflow-y-auto border-r border-slate-800">
  <div class="p-6">
    <div class="flex items-center gap-3 text-white mb-8">
      <div class="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <path d="M3 14h1v1h-1z"></path>
          <path d="M5 14h1v1h-1z"></path>
          <path d="M3 16h1v1h-1z"></path>
          <path d="M5 16h1v1h-1z"></path>
          <path d="M3 18h1v1h-1z"></path>
          <path d="M5 18h1v1h-1z"></path>
          <path d="M7 14h1v1h-1z"></path>
          <path d="M7 16h1v1h-1z"></path>
          <path d="M7 18h1v1h-1z"></path>
        </svg>
      </div>
      <span class="text-xl font-bold tracking-tight">QRScan</span>
    </div>

    <nav class="space-y-2">
      {#each navItems as item}
        {@const isActive = $page.url.pathname === item.href}
        <a 
          href={item.href}
          class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group {isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'hover:bg-slate-800 hover:text-white'}"
        >
          <item.icon size={20} class={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white transition-colors'} />
          <span class="font-medium">{item.label}</span>
        </a>
      {/each}
    </nav>
  </div>

  <div class="mt-auto p-6 border-t border-slate-800">
    <div class="text-xs text-slate-500 text-center">
      v0.1.0
    </div>
  </div>
</aside>

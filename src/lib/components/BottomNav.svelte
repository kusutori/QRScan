<script lang="ts">
  import { page } from '$app/stores';
  import { navItems } from '$lib/nav-items';
</script>

<div class="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-[9999] safe-area-bottom">
  <nav class="flex items-center justify-around p-2">
    {#each navItems as item}
      {@const isActive = $page.url.pathname === item.href}
      {@const Icon = item.icon}
      <a 
        href={item.href}
        class="flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 w-16 {isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}"
      >
        <div class="relative">
           <!-- Svelte 5 component render -->
           <Icon size={24} strokeWidth={isActive ? 2.5 : 2} class="transition-all duration-300 {isActive ? '-translate-y-1' : ''}"/>
           {#if isActive}
             <span class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full"></span>
           {/if}
        </div>
        <span class="text-[10px] font-medium {isActive ? 'opacity-100 font-bold' : 'opacity-80'}">
          {item.label}
        </span>
      </a>
    {/each}
  </nav>
</div>

<script>
  import "../app.css";
  import Sidebar from "$lib/components/Sidebar.svelte";
  import BottomNav from "$lib/components/BottomNav.svelte";
  import { Toaster } from "svelte-sonner";
  import { ModeWatcher } from "mode-watcher";

  let { children } = $props();
</script>

<ModeWatcher />
<Toaster position="top-center" richColors />

<div class="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-300">
  <!-- Desktop Sidebar -->
  <Sidebar />
  
  <!-- Main Content Area -->
  <main class="flex-1 relative flex flex-col h-full overflow-y-auto overflow-x-hidden z-10">
    <!-- Background Decor -->
    <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 fixed">
        <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200 dark:bg-indigo-900/30 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-30 animate-blob"></div>
        <div class="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200 dark:bg-purple-900/30 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div class="absolute bottom-[-20%] left-[20%] w-[40%] h-[40%] bg-pink-200 dark:bg-pink-900/30 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
    </div>

    <div class="relative z-10 flex flex-col min-h-full">
        {@render children()}
    </div>
    
    <!-- Spacer for BottomNav on mobile to prevent content being hidden behind it -->
    <div class="h-24 md:hidden shrink-0 relative z-10"></div>
  </main>
  
  <!-- Mobile Bottom Nav -->
  <BottomNav />
</div>
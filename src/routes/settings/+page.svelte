<script>
  import { Settings, Moon, Globe, Github } from "lucide-svelte";
</script>

<div class="p-6 max-w-2xl mx-auto w-full pt-12 md:pt-6">
  <div class="flex items-center gap-4 mb-8">
    <div class="p-3 bg-slate-100 text-slate-600 rounded-xl">
      <Settings size={24} />
    </div>
    <h1 class="text-2xl font-bold">设置</h1>
  </div>

  <div class="space-y-4">
    <div
      class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between"
    >
      <div class="flex items-center gap-3">
        <div class="p-2 bg-slate-50 rounded-lg text-slate-600">
          <Moon size={20} />
        </div>
        <span class="font-medium">深色模式</span>
      </div>
      <div class="text-sm text-slate-400">跟随系统</div>
    </div>

    <div
      class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between"
    >
      <div class="flex items-center gap-3">
        <div class="p-2 bg-slate-50 rounded-lg text-slate-600">
          <Globe size={20} />
        </div>
        <span class="font-medium">语言</span>
      </div>
      <div class="text-sm text-slate-400">简体中文</div>
    </div>

    <a
      href="https://github.com/kusutori/QRScan/"
      target="_blank"
      class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:bg-slate-50 transition-colors"
    >
      <div class="flex items-center gap-3">
        <div class="p-2 bg-slate-50 rounded-lg text-slate-600">
          <Github size={20} />
        </div>
        <span class="font-medium">开源地址</span>
      </div>
    </a>
  </div>
</div>

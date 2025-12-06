<script>
  import { ScanLine } from 'lucide-svelte';
</script>

<div class="p-6 max-w-2xl mx-auto w-full pt-12 md:pt-6">
  <div class="flex items-center gap-4 mb-8">
    <div class="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
      <ScanLine size={24} />
    </div>
    <h1 class="text-2xl font-bold">扫描二维码</h1>
  </div>
  
  <div class="bg-white p-12 rounded-3xl border border-slate-200 text-center shadow-sm">
    <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
      <ScanLine size={40} />
    </div>
    <h3 class="text-lg font-semibold text-slate-900">功能开发中</h3>
    <p class="text-slate-500 mt-2">扫描功能即将来临，支持摄像头和图片识别。</p>
  </div>
</div>

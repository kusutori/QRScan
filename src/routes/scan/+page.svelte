<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { Html5Qrcode } from 'html5-qrcode';
  import { scan, Format, checkPermissions, requestPermissions } from '@tauri-apps/plugin-barcode-scanner';
  import { platform } from '@tauri-apps/plugin-os';
  import { ScanLine, Image as ImageIcon, X, Copy, ExternalLink, Camera } from 'lucide-svelte';
  import { toast } from 'svelte-sonner';
  import { writeText } from '@tauri-apps/plugin-clipboard-manager';
  import { open } from '@tauri-apps/plugin-shell';

  let scanning = $state(false);
  let result = $state('');
  let error = $state('');
  let showScanner = $state(false); 
  let html5QrCode = $state<Html5Qrcode | null>(null);
  let fileInput = $state<HTMLInputElement | undefined>(undefined);
  let cameraInput = $state<HTMLInputElement | undefined>(undefined);

  const isMobile = ['android', 'ios'].includes(platform());

  onMount(() => {
    return () => {
      stopDesktopScan();
    };
  });

  async function stopDesktopScan() {
    if (html5QrCode && html5QrCode.isScanning) {
      try {
        await html5QrCode.stop();
        html5QrCode.clear();
      } catch (e) {
        console.error('Failed to stop scanner', e);
      }
    }
    scanning = false;
    showScanner = false;
    html5QrCode = null;
  }

  async function handleCameraScan() {
    error = '';
    result = '';
    
    if (isMobile) {
      // Mobile: Use native camera intent via file input
      console.log('Triggering mobile camera', cameraInput);
      if (cameraInput) {
          cameraInput.click();
      } else {
          toast.error('无法启动相机组件');
      }
    } else {
      // Desktop
      if (scanning) {
        await stopDesktopScan();
        return;
      }
      
      // Explicitly request permission first
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          toast.error('当前环境不支持访问摄像头 (MediaDevices API missing)');
          return;
      }

      try {
          await navigator.mediaDevices.getUserMedia({ video: true });
      } catch (err: any) {
          console.error('Permission denied', err);
          toast.error(`无法访问摄像头: ${err.name} - ${err.message}`);
          return;
      }
      
      showScanner = true;
      scanning = true;
      
      await tick(); 

      try {
          const config = { fps: 10, qrbox: { width: 250, height: 250 } };
          // html5QrCode needs to be assigned to the state variable
          const scanner = new Html5Qrcode("reader");
          html5QrCode = scanner;
          
          const devices = await Html5Qrcode.getCameras();
          if (devices && devices.length) {
              const cameraId = devices[0].id;
              await scanner.start(
                cameraId, 
                config, 
                (decodedText, decodedResult) => {
                    result = decodedText;
                    stopDesktopScan();
                    toast.success('扫码成功');
                },
                (errorMessage) => {}
              );
          } else {
              throw new Error('未检测到摄像头');
          }
      } catch (err: any) {
          console.error(err);
          await stopDesktopScan();
          error = '无法启动摄像头: ' + (err?.message || '未知错误');
          toast.error(error);
      }
    }
  }

  function handleImageScan() {
    fileInput?.click();
  }

  async function onFileSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    try {
      const scanner = new Html5Qrcode("reader-hidden");
      const decoded = await scanner.scanFileV2(file, true);
      result = decoded.decodedText;
      toast.success("识别成功");
    } catch (err) {
      console.error(err);
      error = "无法识别图片中的二维码";
      toast.error("识别失败，请确保图片清晰");
    } finally {
      input.value = "";
    }
  }

  async function copyResult() {
    try {
      await writeText(result);
      toast.success("已复制");
    } catch (e) {
      toast.error("复制失败");
    }
  }

  async function openResult() {
    try {
      if (result.startsWith("http")) {
        await open(result);
      } else {
        await open(
          `https://www.google.com/search?q=${encodeURIComponent(result)}`,
        );
      }
    } catch (e) {
      toast.error("无法打开链接");
    }
  }
</script>

<div class="p-6 max-w-2xl mx-auto w-full pt-12 md:pt-6 min-h-full flex flex-col">
  <div class="flex items-center gap-4 mb-8 shrink-0">
    <div class="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl transition-colors">
      <ScanLine size={24} />
    </div>
    <h1 class="text-2xl font-bold dark:text-white transition-colors">
      扫描二维码
    </h1>
  </div>

  <!-- Result Card -->
  {#if result}
    <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg mb-8 animate-in slide-in-from-top-4 duration-500">
      <div class="flex justify-between items-start mb-4">
        <h3 class="font-bold text-lg dark:text-slate-200">识别结果</h3>
        <button
          onclick={() => (result = "")}
          class="p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
        >
          <X size={20} />
        </button>
      </div>
      <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl break-all text-slate-700 dark:text-slate-300 font-mono text-sm mb-6 border border-slate-100 dark:border-slate-700">
        {result}
      </div>
      <div class="grid grid-cols-2 gap-4">
        <button
          onclick={copyResult}
          class="flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <Copy size={18} />
          复制
        </button>
        <button
          onclick={openResult}
          class="flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 transition-colors"
        >
          <ExternalLink size={18} />
          打开
        </button>
      </div>
    </div>
  {/if}

  <!-- Scanner UI -->
  <div class="flex-1 flex flex-col items-center justify-center gap-8 relative">
    <!-- Desktop Scanner Container -->
    {#if showScanner}
      <div class="w-full max-w-md aspect-square bg-black rounded-3xl overflow-hidden relative shadow-2xl">
        <div id="reader" class="w-full h-full"></div>
        <button
          onclick={stopDesktopScan}
          class="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors z-10"
        >
          <X size={24} />
        </button>
      </div>
    {:else if !result}
      <div class="text-center space-y-2 mb-8">
        <div class="w-24 h-24 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 dark:text-slate-600 border border-slate-100 dark:border-slate-800">
          <ScanLine size={48} />
        </div>
        <p class="text-slate-500 dark:text-slate-400">选择扫描方式</p>
      </div>
    {/if}

    <!-- Action Buttons -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md">
      <button
        onclick={handleCameraScan}
        class="flex flex-col items-center gap-3 p-6 rounded-3xl border-2 border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 bg-white dark:bg-slate-900 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all group"
      >
        <div class="p-4 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl group-hover:scale-110 transition-transform">
          <Camera size={32} />
        </div>
        <span class="font-bold text-slate-700 dark:text-slate-200">摄像头扫描</span>
        <span class="text-xs text-slate-400 dark:text-slate-500">{isMobile ? "调用手机相机" : "使用电脑摄像头"}</span>
      </button>

      <button
        onclick={handleImageScan}
        class="flex flex-col items-center gap-3 p-6 rounded-3xl border-2 border-slate-100 dark:border-slate-800 hover:border-purple-200 dark:hover:border-purple-800 bg-white dark:bg-slate-900 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-all group"
      >
        <div class="p-4 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl group-hover:scale-110 transition-transform">
          <ImageIcon size={32} />
        </div>
        <span class="font-bold text-slate-700 dark:text-slate-200">图片识别</span>
        <span class="text-xs text-slate-400 dark:text-slate-500">从相册选择图片</span>
      </button>
    </div>

    <!-- Hidden inputs (Visually hidden but present in DOM) -->
    <input
      type="file"
      accept="image/*"
      class="opacity-0 absolute pointer-events-none w-0 h-0"
      bind:this={fileInput}
      onchange={onFileSelected}
    />
    
    <!-- Camera Capture Input (Mobile only) -->
    <input
      type="file"
      accept="image/*"
      capture="environment"
      class="opacity-0 absolute pointer-events-none w-0 h-0"
      bind:this={cameraInput}
      onchange={onFileSelected}
    />

    <!-- Hidden div for file scanning engine -->
    <div id="reader-hidden" class="hidden"></div>
  </div>
</div>

# Android 摄像头扫码功能开发总结报告

本文档记录了在 Tauri v2 + Svelte 5 环境下开发 Android 扫码功能时遇到的关键问题及其解决方案。

## 1. 技术选型变更

### 初始方案：Tauri 插件
起初我们尝试使用官方插件 `@tauri-apps/plugin-barcode-scanner`。
*   **问题**：
    *   插件初始化在部分设备上导致应用崩溃。
    *   权限请求逻辑（`requestPermissions`）在 Android WebView 中表现不稳定。
    *   与桌面端代码逻辑割裂严重，增加了维护成本。

### 最终方案：原生 HTML5 捕获 + html5-qrcode
我们转向了更轻量级的 Web 原生方案，即利用 `<input type="file" capture="environment">` 唤起系统相机，拍摄后获取图片文件，再通过 `html5-qrcode` 库进行本地解析。
*   **优势**：
    *   **稳定性高**：直接复用系统相机应用，无需处理复杂的相机预览流和硬件兼容性。
    *   **代码统一**：解析逻辑与“上传图片识别”完全共用。
    *   **权限管理**：系统自动处理权限，应用侧无需编写繁琐的权限请求代码。

---

## 2. 遇到的关键技术问题与修复

在实施最终方案时，我们遇到了三个主要障碍：

### 问题一：Svelte 5 组件绑定失效 (`ReferenceError`)
*   **现象**：点击“拍照识别”按钮时，控制台报错 `cameraInput is not defined`。
*   **原因**：
    1.  Svelte 5 的 Runes 语法要求严格。我们在 `<script>` 块中遗漏了 `let cameraInput = $state(...)` 的声明。
    2.  `bind:this={cameraInput}` 绑定在某些情况下未能正确初始化。
*   **解决**：
    *   在顶部显式声明变量：`let cameraInput = $state<HTMLInputElement | undefined>(undefined);`。
    *   确保绑定逻辑正确。

### 问题二：隐藏元素的点击交互失效
*   **现象**：调用 `cameraInput.click()` 没有任何反应，也没有报错。
*   **原因**：我们将 `input` 元素设置了 `class="hidden"` (即 `display: none`)。在某些 Android WebView 版本或安全策略中，浏览器会为了安全起见，**禁止程序触发不可见元素的点击事件**，或者 Safari/Chrome 优化机制认为该元素无需响应交互。
*   **解决**：
    *   放弃 `display: none`。
    *   改用“视觉隐藏”技术：`class="opacity-0 absolute pointer-events-none w-0 h-0"`。这样元素仍然存在于 DOM 树中且“可见”（透明度为0），从而绕过了浏览器的安全限制。

### 问题三：系统相机无法启动 (`FileProvider` 缺失)
*   **现象**：点击后能弹出“选择操作”菜单，但点击“相机”时直接闪退或报错：
    ```
    Unable to create temporary media capture file: Couldn't find meta-data for provider...
    ```
*   **原因 (核心难点)**：
    *   当 WebView 尝试启动相机并直接获取照片文件时（`capture="environment"`），它需要一个临时路径来存储这张照片。
    *   Android 7.0+ 强制实施严格的文件安全策略（Scoped Storage），禁止应用通过 `file://` URI 共享文件。
    *   WebView 需要通过 **ContentProvider (FileProvider)** 将文件路径映射为安全的 `content://` URI 传递给相机应用。
    *   由于我们之前移除了 `tauri-plugin-sharetarget`，连带移除了它自动配置的 `FileProvider`，导致 WebView 找不到合法的存储路径配置。
*   **解决**：
    1.  **配置 AndroidManifest.xml**：手动添加 `<provider>` 节点，注册 `androidx.core.content.FileProvider`。
    2.  **创建资源文件**：在 `src-tauri/gen/android/app/src/main/res/xml/` 下创建 `file_paths.xml`，定义允许 WebView 写入的缓存目录路径：
        ```xml
        <paths>
            <external-path name="my_images" path="." />
            <cache-path name="my_cache_images" path="." />
        </paths>
        ```

## 3. 总结

通过这次调试，我们确立了在 Tauri Android 开发中处理媒体交互的一个重要原则：**尽可能利用 Web 标准能力，但在涉及文件系统交互（如拍照存图）时，必须手动补全 Android 原生层面的配置（Manifest & Providers），因为 WebView 本身并不包含这些操作系统级别的基础设施。**

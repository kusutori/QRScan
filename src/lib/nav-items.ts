import { QrCode, ScanLine, History, Settings } from 'lucide-svelte';

export const navItems = [
    { href: '/', label: '生成', icon: QrCode },
    { href: '/scan', label: '扫描', icon: ScanLine },
    { href: '/history', label: '历史', icon: History },
    { href: '/settings', label: '设置', icon: Settings }
];

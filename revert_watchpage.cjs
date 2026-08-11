const fs = require('fs');
let code = fs.readFileSync('src/components/WatchPage.tsx', 'utf-8');
code = code.replace('const [isServerLoading, setIsServerLoading] = useState<boolean>(true);', 'const [isServerLoading, setIsServerLoading] = useState<boolean>(false);');
code = code.replace('const [isTheaterMode, setIsTheaterMode] = useState<boolean>(true);', 'const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);');
code = code.replace('const [isFullscreen, setIsFullscreen] = useState<boolean>(true);', 'const [isFullscreen, setIsFullscreen] = useState<boolean>(false);');
// isPlaying should be true
code = code.replace('const [isMuted, setIsMuted] = useState<boolean>(true);', 'const [isMuted, setIsMuted] = useState<boolean>(false);');
code = code.replace('const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(true);', 'const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(false);');
// useIframeEmbed should be true
code = code.replace('const [showSubSettingsOverlay, setShowSubSettingsOverlay] = useState<boolean>(true);', 'const [showSubSettingsOverlay, setShowSubSettingsOverlay] = useState<boolean>(false);');
code = code.replace('const [showAiGpuOverlay, setShowAiGpuOverlay] = useState<boolean>(true);', 'const [showAiGpuOverlay, setShowAiGpuOverlay] = useState<boolean>(false);');
code = code.replace('const [showGpuShaderDashboard, setShowGpuShaderDashboard] = useState<boolean>(true);', 'const [showGpuShaderDashboard, setShowGpuShaderDashboard] = useState<boolean>(false);');
fs.writeFileSync('src/components/WatchPage.tsx', code);

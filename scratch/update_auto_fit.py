import os

with open("src/App.jsx", "r", encoding="utf8") as f:
    code = f.read()

search_imports = "FileCode, GitMerge"
replace_imports = "FileCode, GitMerge, Maximize"
if search_imports in code:
    code = code.replace(search_imports, replace_imports)
    print("Replaced imports")
else:
    print("Failed to replace imports")

search_zoom_state = """  const [loadError, setLoadError] = useState(null);

  // 初回データ読み込み"""

replace_zoom_state = """  const [loadError, setLoadError] = useState(null);
  const [autoFit, setAutoFit] = useState(true);

  useEffect(() => {
    if (!autoFit) return;
    const calculateFit = () => {
      const W = window.innerWidth;
      // 基準幅1300pxに対してどれくらいか。actZoom = zoom * 0.9。
      // なので、W / 1300 を actZoom にしたい。
      // zoom = (W / 1300) / 0.9 = W / 1170
      let newZoom = W / 1170;
      if (newZoom > 1.5) newZoom = 1.5;
      if (newZoom < 0.4) newZoom = 0.4;
      setZoom(newZoom);
    };
    calculateFit();
    window.addEventListener('resize', calculateFit);
    return () => window.removeEventListener('resize', calculateFit);
  }, [autoFit, setZoom]);

  // 初回データ読み込み"""

if search_zoom_state in code:
    code = code.replace(search_zoom_state, replace_zoom_state)
    print("Replaced zoom state")
else:
    print("Failed to replace zoom state")


search_zoom_ui = """            <div className="flex items-center bg-white/10 border border-white/20 rounded overflow-hidden mr-1">
              <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-1.5 hover:bg-white/20 text-white transition-colors" title="縮小"><ZoomOut className="w-4 h-4"/></button>
              <span className="text-xs font-bold w-10 text-center text-white" title="現在の表示倍率">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(z => Math.min(1.5, z + 0.1))} className="p-1.5 hover:bg-white/20 text-white transition-colors" title="拡大"><ZoomIn className="w-4 h-4"/></button>
            </div>"""

replace_zoom_ui = """            <div className="flex items-center bg-white/10 border border-white/20 rounded overflow-hidden mr-1">
              <button onClick={() => { setAutoFit(!autoFit); }} className={cx("p-1.5 transition-colors border-r border-white/20", autoFit ? "text-amber-300 bg-white/10" : "text-white hover:bg-white/20")} title="画面幅に自動フィット"><Maximize className="w-4 h-4"/></button>
              <button onClick={() => { setAutoFit(false); setZoom(z => Math.max(0.4, z - 0.1)); }} className="p-1.5 hover:bg-white/20 text-white transition-colors" title="縮小"><ZoomOut className="w-4 h-4"/></button>
              <span className="text-xs font-bold w-10 text-center text-white" title="現在の表示倍率">{Math.round(zoom * 100)}%</span>
              <button onClick={() => { setAutoFit(false); setZoom(z => Math.min(1.5, z + 0.1)); }} className="p-1.5 hover:bg-white/20 text-white transition-colors" title="拡大"><ZoomIn className="w-4 h-4"/></button>
            </div>"""

if search_zoom_ui in code:
    code = code.replace(search_zoom_ui, replace_zoom_ui)
    print("Replaced zoom ui")
else:
    print("Failed to replace zoom ui")

with open("src/App.jsx", "w", encoding="utf8") as f:
    f.write(code)
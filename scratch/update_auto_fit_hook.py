import os

with open("src/App.jsx", "r", encoding="utf8") as f:
    code = f.read()

search = """  const [isDragging, setIsDragging] = useState(false);"""
replace = """  const [isDragging, setIsDragging] = useState(false);
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
  }, [autoFit, setZoom]);"""

if search in code:
    code = code.replace(search, replace)
    print("Replaced isDragging")
else:
    print("Failed to replace isDragging")

with open("src/App.jsx", "w", encoding="utf8") as f:
    f.write(code)
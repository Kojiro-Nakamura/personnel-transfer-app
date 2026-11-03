import re
with open("src/App.jsx", "r", encoding="utf8") as f:
    code = f.read()

t_search = """  const [isDragging, setIsDragging] = useState(false);"""

t_insert = """  const partialImportInputRef = useRef(null);

  const handlePartialImport = async (e) => {
    let file = null;
    if (e && e.target && e.target.files) {
      file = e.target.files[0];
    }
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (data.plans) {
        const planToLoad = data.plans.find(x => x.id === (data.activePlanId || data.plans[0].id)) || data.plans[0];
        const importedEmpsArray = planToLoad.employees || [];

        const updates = [];
        let matchCount = 0;
        importedEmpsArray.forEach(imp => {
           const match = employees.find(emp => emp.name === imp.name && emp.employeeNumber === imp.employeeNumber);
           if (match) {
             updates.push({
               id: match.id,
               note: imp.note !== undefined ? imp.note : match.note,
               desiredAssignment: imp.desiredAssignment !== undefined ? imp.desiredAssignment : match.desiredAssignment,
               specialCircumstances: imp.specialCircumstances !== undefined ? imp.specialCircumstances : match.specialCircumstances,
             });
             matchCount++;
           }
        });

        if (updates.length > 0) {
          mutations.bulkProcessEmployees(updates);
          alert(`${matchCount}件のデータを上書きしました。`);
        } else {
          alert('氏名と職員番号が一致する職員が見つかりませんでした。');
        }
      }
    } catch(err) {
      console.error('Error loading JSON for partial import:', err);
      alert('ファイルの読み込みに失敗しました。');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

"""

if t_search in code:
    code = code.replace(t_search, t_insert + t_search)
    with open("src/App.jsx", "w", encoding="utf8") as f:
        f.write(code)
    print("Function added.")
else:
    print("Could not find insertion point!")
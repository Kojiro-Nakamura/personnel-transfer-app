import sys

with open('src/components/modals/Modals.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

target = '''  const sortedEmps = useMemo(() => {
    let items = [...localEmps];
    if (sortConfig.key) {
      items.sort((a, b) => {
        let av = a[sortConfig.key] || ''; 
        let bv = b[sortConfig.key] || '';
        if (sortConfig.key.includes('Years')) { 
          av = Number(av); 
          bv = Number(bv); 
        }
        if (av < bv) return sortConfig.direction === 'asc' ? -1 : 1;
        if (av > bv) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });'''

repl = '''  const sortedEmps = useMemo(() => {
    let items = [...localEmps];
    if (sortConfig.key) {
      items.sort((a, b) => {
        let av = a[sortConfig.key] || ''; 
        let bv = b[sortConfig.key] || '';
        
        if (sortConfig.key === 'currentGrade' || sortConfig.key === 'nextGrade') {
          av = getGradeLevel(av);
          bv = getGradeLevel(bv);
        } else if (sortConfig.key.includes('Years') || ['promoYearChief', 'promoYearAssistant1', 'promoYearAssistant2', 'promoYearAssistant3', 'promoYearSecHead', 'promoYearDivHead', 'promoYearDeputyHead', 'promoYearDeptHead'].includes(sortConfig.key)) { 
          av = Number(av) || 0; 
          bv = Number(bv) || 0; 
        }

        if (av < bv) return sortConfig.direction === 'asc' ? -1 : 1;
        if (av > bv) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });'''

if target in text:
    text = text.replace(target, repl)
    with open('src/components/modals/Modals.jsx', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Patch applied to Modals.jsx")
else:
    print("Target not found")

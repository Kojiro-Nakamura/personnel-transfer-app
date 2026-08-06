import sys

with open('src/components/modals/Modals.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

target = 'link.setAttribute("download", `人事異動案_職員一括_${targetYear}年度.html`);'
repl = '''    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}${mm}${dd}`;
    const eraYear = getEraFormattedYear(targetYear);
    link.setAttribute("download", `${dateStr}_${eraYear}年度_職員一覧.html`);'''

if target in text:
    text = text.replace(target, repl)
    with open('src/components/modals/Modals.jsx', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Successfully replaced filename logic.")
else:
    print("Target string not found in Modals.jsx.")

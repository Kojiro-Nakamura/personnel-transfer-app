import sys

# 1. Update App.jsx
with open('src/App.jsx', 'r', encoding='utf-8') as f:
    app_text = f.read()

target_base_file_name = '''  const baseFileName = useMemo(() => { 
    const d = new Date(); 
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}_${getEraFormattedYear(targetYear + 1)}人事異動案_ver1`; 
  }, [targetYear]);'''

repl_base_file_name = '''  const baseFileName = useMemo(() => { 
    const d = new Date(); 
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}_${getEraFormattedYear(targetYear)}人事異動案_ver1`; 
  }, [targetYear]);'''

app_text = app_text.replace(target_base_file_name, repl_base_file_name)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(app_text)


# 2. Update exportHtml.js
with open('src/utils/exportHtml.js', 'r', encoding='utf-8') as f:
    html_text = f.read()

target_era = '''  const currentEraShort = getEraFormattedYear(targetYear).split('(')[1].replace(')', '');'''
repl_era = '''  const currentEraShort = getEraFormattedYear(targetYear - 1).split('(')[1].replace(')', '');'''

html_text = html_text.replace(target_era, repl_era)

with open('src/utils/exportHtml.js', 'w', encoding='utf-8') as f:
    f.write(html_text)

print("Both files updated")

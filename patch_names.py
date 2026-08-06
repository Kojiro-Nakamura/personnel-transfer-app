import sys
import re

# 1. Update App.jsx
with open('src/App.jsx', 'r', encoding='utf-8') as f:
    app_text = f.read()

# Add getEraFormattedYear to imports
app_text = app_text.replace('getPlacementName } from \'./utils/helpers.js\';', 'getPlacementName, getEraFormattedYear } from \'./utils/helpers.js\';')

# Update baseFileName
target_base_file_name = '''  const baseFileName = useMemo(() => { 
    const d = new Date(); 
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}_R${targetYear - 2018}人事異動案_ver1`; 
  }, [targetYear]);'''

repl_base_file_name = '''  const baseFileName = useMemo(() => { 
    const d = new Date(); 
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}_${getEraFormattedYear(targetYear + 1)}人事異動案_ver1`; 
  }, [targetYear]);'''

if target_base_file_name in app_text:
    app_text = app_text.replace(target_base_file_name, repl_base_file_name)
    print("App.jsx baseFileName updated.")
else:
    print("Could not find baseFileName definition in App.jsx.")

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(app_text)


# 2. Update exportHtml.js
with open('src/utils/exportHtml.js', 'r', encoding='utf-8') as f:
    html_text = f.read()

# Add currentEraShort
target_top = 'export const generateAndDownloadHTML = (employees, departments, targetYear) => {'
repl_top = '''export const generateAndDownloadHTML = (employees, departments, targetYear) => {
  const currentEraShort = getEraFormattedYear(targetYear).split('(')[1].replace(')', '');'''

html_text = html_text.replace(target_top, repl_top)

# Update 年齢 th
target_th = '<th onclick="sortTable(1)" class="sticky-age">年齢</th>'
repl_th = '<th onclick="sortTable(1)" class="sticky-age">${currentEraShort}年齢</th>'

html_text = html_text.replace(target_th, repl_th)

with open('src/utils/exportHtml.js', 'w', encoding='utf-8') as f:
    f.write(html_text)

print("exportHtml.js updated.")

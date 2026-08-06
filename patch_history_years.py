import sys

with open('src/utils/exportHtml.js', 'r', encoding='utf-8') as f:
    text = f.read()

target = 'export const generateAndDownloadHTML = (employees, departments, targetYear) => {'
repl = '''export const generateAndDownloadHTML = (employees, departments, targetYear) => {
  const yearsSet = new Set();
  employees.forEach(e => {
    if (e.history) e.history.forEach(h => yearsSet.add(h.year));
  });
  const historyYears = Array.from(yearsSet).sort((a, b) => b - a);
'''

if target in text:
    text = text.replace(target, repl)
    print("historyYears added successfully")
else:
    print("Could not find target")

with open('src/utils/exportHtml.js', 'w', encoding='utf-8') as f:
    f.write(text)

import sys

with open('src/components/modals/Modals.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

target = '''      <td class="bg-blue" data-val="${nDeptName}">${nDeptName}</td>
      <td class="bg-blue" data-val="${emp.nextTitle||''}">${emp.nextTitle||''}</td>
      <td class="bg-blue" data-val="${emp.nextGrade||''}">${emp.nextGrade||''}</td>
      <td class="bg-blue" data-val="${emp.nextYears||0}">${emp.nextYears||''}</td>'''

repl = '''      <td class="bg-blue" data-val="${nDeptName}">${nDeptName}</td>
      <td class="bg-blue" data-val="${emp.nextTitle||''}">${emp.nextTitle||''}</td>
      <td class="bg-blue" data-val="${emp.nextGrade||''}">${emp.nextGrade||''}</td>
      ${(() => {
        const isPromoted = getGradeLevelLocal(emp.nextGrade) > getGradeLevelLocal(emp.currentGrade);
        const displayYears = isPromoted ? 1 : (emp.nextYears || '');
        const valYears = isPromoted ? 1 : (emp.nextYears || 0);
        return `<td class="bg-blue" data-val="${valYears}">${displayYears}</td>`;
      })()}'''

if target in text:
    text = text.replace(target, repl)
    print("nextYears logic replaced")
else:
    print("nextYears target not found")

with open('src/components/modals/Modals.jsx', 'w', encoding='utf-8') as f:
    f.write(text)

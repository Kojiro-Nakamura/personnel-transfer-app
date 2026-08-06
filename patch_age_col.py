import sys
import re

with open('src/components/modals/Modals.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. CSS update
css_target = '''  /* Sticky left column */
  .sticky-col { position: sticky; left: 0; font-weight: bold; }
  tbody td.sticky-col { z-index: 10; background-color: #e2e8f0; }
  thead th.sticky-col { z-index: 30; background-color: #94a3b8; color: #fff; }'''

css_repl = '''  /* Sticky name column */
  .sticky-name { position: sticky; left: 0; font-weight: bold; min-width: 120px; width: 120px; box-sizing: border-box; }
  tbody td.sticky-name { z-index: 10; background-color: #e2e8f0; }
  thead th.sticky-name { z-index: 30; background-color: #94a3b8; color: #fff; }

  /* Sticky age column */
  .sticky-age { position: sticky; left: 120px; font-weight: bold; min-width: 50px; width: 50px; box-sizing: border-box; }
  tbody td.sticky-age { z-index: 10; background-color: #e2e8f0; }
  thead th.sticky-age { z-index: 30; background-color: #94a3b8; color: #fff; }'''

if css_target in text:
    text = text.replace(css_target, css_repl)
    print("CSS replaced")
else:
    print("CSS target not found")

# 2. Header row 1 update
hr1_target = '''      <th class="sticky-col bg-slate"></th>
      <th colspan="5" class="bg-slate">基本情報</th>'''
hr1_repl = '''      <th class="sticky-name bg-slate"></th>
      <th class="sticky-age bg-slate"></th>
      <th colspan="5" class="bg-slate">基本情報</th>'''

if hr1_target in text:
    text = text.replace(hr1_target, hr1_repl)
    print("Header row 1 replaced")
else:
    print("Header row 1 target not found")

# 3. Header row 2 update (shifting sortTable indices and adding Age)
def shift_sort(match):
    idx = int(match.group(1))
    return f'onclick="sortTable({idx + 1})"'

hr2_start = text.find('      <th onclick="sortTable(0)" class="sticky-col text-left" style="min-width: 100px;">氏名</th>')
hr2_end = text.find('</tr>', hr2_start)
if hr2_start > -1 and hr2_end > -1:
    hr2_block = text[hr2_start:hr2_end]
    # Replace the sticky-col Name th
    hr2_block = hr2_block.replace(
        '<th onclick="sortTable(0)" class="sticky-col text-left" style="min-width: 100px;">氏名</th>',
        '<th onclick="sortTable(0)" class="sticky-name text-left">氏名</th>\n      <th onclick="sortTable(1)" class="sticky-age">年齢</th>'
    )
    # Shift indices for all other sortTable calls in this block
    hr2_block = re.sub(r'onclick="sortTable\((\d+)\)"', lambda m: m.group(0) if m.group(1) in ['0','1'] else f'onclick="sortTable({int(m.group(1))+1})"', hr2_block)
    # Also update historyYears map sortTable
    hr2_block = re.sub(r'\$\{30 \+ idx\}', '${31 + idx}', hr2_block)
    
    text = text[:hr2_start] + hr2_block + text[hr2_end:]
    print("Header row 2 replaced")
else:
    print("Header row 2 block not found")

# 4. Data row generation
td_target = '''      let ageStr = '';
      if (emp.birthDate) {
        const age = calculateAge(emp.birthDate, targetYear - 1);
        if (age !== null && !isNaN(age)) {
          ageStr = '(' + age + ')';
        }
      }
      const nameVal = emp.name || '';
      const ageStrFormatted = ageStr ? ageStr.replace(')', '歳)') : '';
      const nameWithAge = nameVal + (ageStrFormatted ? ' ' + ageStrFormatted : '');

      html += `
    <tr>
      <td class="sticky-col text-left" data-val="${nameVal}">${nameWithAge}</td>'''

td_repl = '''      let ageNum = '';
      if (emp.birthDate) {
        const age = calculateAge(emp.birthDate, targetYear - 1);
        if (age !== null && !isNaN(age)) {
          ageNum = age;
        }
      }
      const nameVal = emp.name || '';

      html += `
    <tr>
      <td class="sticky-name text-left" data-val="${nameVal}">${nameVal}</td>
      <td class="sticky-age" data-val="${ageNum}">${ageNum !== '' ? ageNum + '歳' : ''}</td>'''

if td_target in text:
    text = text.replace(td_target, td_repl)
    print("TD replaced")
else:
    print("TD target not found")

with open('src/components/modals/Modals.jsx', 'w', encoding='utf-8') as f:
    f.write(text)

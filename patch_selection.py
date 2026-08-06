import sys

with open('src/components/modals/Modals.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace CSS
text = text.replace(
    '  .highlight > td { background-color: #fef08a !important; }',
    '  .highlight > td { background-color: #fef08a !important; }\n  .promo-highlight { background-color: #fed7aa !important; }\n  .highlight > td.promo-highlight { background-color: #fdba74 !important; }'
)

# Replace renderPromo inline style
target_promo = '''        let styleStr = isNextPromo ? ' style="background-color: #fed7aa;"' : '';
        return `<td class="bg-fuchsia"${styleStr} data-val="${cellVal||''}"><div style="display:flex;align-items:center;justify-content:center;">${cellHtml}</div></td>`;'''

repl_promo = '''        let extraCls = isNextPromo ? ' promo-highlight' : '';
        return `<td class="bg-fuchsia${extraCls}" data-val="${cellVal||''}"><div style="display:flex;align-items:center;justify-content:center;">${cellHtml}</div></td>`;'''

if target_promo in text:
    text = text.replace(target_promo, repl_promo)
    print("renderPromo logic updated")
else:
    print("target_promo not found")

# Replace histHtml inline style
target_hist = '''      let histHtml = '';
      historyYears.forEach(year => {
        let hStr = '';
        let histStyle = '';
        if (year === targetYear) {
          hStr = nDeptName;
          if (getGradeLevelLocal(emp.nextGrade) > getGradeLevelLocal(emp.currentGrade)) {
            histStyle = ' style="background-color: #fed7aa;"';
          }
        } else {
          const hist = (emp.history || []).find(h => h.year === year);
          hStr = hist ? hist.department : '';
        }
        histHtml += `<td class="bg-emerald"${histStyle} data-val="${hStr}">${hStr}</td>`;
      });'''

repl_hist = '''      let histHtml = '';
      historyYears.forEach(year => {
        let hStr = '';
        let extraCls = '';
        if (year === targetYear) {
          hStr = nDeptName;
          if (getGradeLevelLocal(emp.nextGrade) > getGradeLevelLocal(emp.currentGrade)) {
            extraCls = ' promo-highlight';
          }
        } else {
          const hist = (emp.history || []).find(h => h.year === year);
          hStr = hist ? hist.department : '';
        }
        histHtml += `<td class="bg-emerald${extraCls}" data-val="${hStr}">${hStr}</td>`;
      });'''

if target_hist in text:
    text = text.replace(target_hist, repl_hist)
    print("histHtml logic updated")
else:
    print("target_hist not found")

with open('src/components/modals/Modals.jsx', 'w', encoding='utf-8') as f:
    f.write(text)

import sys

with open('src/components/modals/Modals.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

target_promo = '''        if (emp[key]) {
          const suffix = getEraSuffixLocal(emp[key]);
          if (suffix) cellHtml += `<span style="font-size: 9px; color: #64748b; font-weight: bold; margin-left: 1px;">(${suffix})</span>`;
        }
        return `<td class="bg-fuchsia" data-val="${emp[key]||''}"><div style="display:flex;align-items:center;justify-content:center;">${cellHtml}</div></td>`;'''

repl_promo = '''        if (emp[key]) {
          const suffix = getEraSuffixLocal(emp[key]);
          if (suffix) cellHtml += `<span style="font-size: 9px; color: #64748b; font-weight: bold; margin-left: 1px;">(${suffix})</span>`;
          if (emp.birthDate && !isNaN(currentY)) {
             const promoAge = calculateAge(emp.birthDate, currentY);
             if (promoAge !== null && !isNaN(promoAge)) {
                cellHtml += `<span style="font-size: 10px; color: #334155; margin-left: 2px;">${promoAge}歳</span>`;
             }
          }
        }
        return `<td class="bg-fuchsia" data-val="${emp[key]||''}"><div style="display:flex;align-items:center;justify-content:center;">${cellHtml}</div></td>`;'''

if target_promo in text:
    text = text.replace(target_promo, repl_promo)
    with open('src/components/modals/Modals.jsx', 'w', encoding='utf-8') as f:
        f.write(text)
    print("renderPromo replaced successfully")
else:
    print("renderPromo target not found")

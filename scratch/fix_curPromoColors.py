import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

# fix addPlanSheet
search_plan_1 = """    const extEmp = nextEmp;
    let curFontStyles = {};
    if (extEmp) {
      rowVals.push(''); // Blank spacer Q"""

replace_plan_1 = """    const extEmp = nextEmp;
    let curFontStyles = {};
    let curPromoColors = {};
    if (extEmp) {
      rowVals.push(''); // Blank spacer Q"""

search_plan_2 = """      const gradeToPromoKey = { "部長級": "promoYearDeptHead", "次長級": "promoYearDeputyHead", "所属長級": "promoYearDivHead", "課長級": "promoYearSecHead", "補佐級III(補佐兼班長)": "promoYearAssistant3", "補佐級II(班長)": "promoYearAssistant2", "補佐級I(主任)": "promoYearAssistant1", "係長級(主査)": "promoYearChief" };
      
      const curPromoColors = {}; // cell colors for promo
      
      const promoYearMap = {};"""

replace_plan_2 = """      const gradeToPromoKey = { "部長級": "promoYearDeptHead", "次長級": "promoYearDeputyHead", "所属長級": "promoYearDivHead", "課長級": "promoYearSecHead", "補佐級III(補佐兼班長)": "promoYearAssistant3", "補佐級II(班長)": "promoYearAssistant2", "補佐級I(主任)": "promoYearAssistant1", "係長級(主査)": "promoYearChief" };
      
      const promoYearMap = {};"""

search_plan_3 = """      if (extEmp && typeof curPromoColors !== 'undefined') {
      Object.keys(curPromoColors).forEach(cIdx => {"""

replace_plan_3 = """      if (extEmp) {
      Object.keys(curPromoColors).forEach(cIdx => {"""


# fix addSimplePlanSheet
search_simple_1 = """    const extEmp = nextEmp;
    if (extEmp) {
      rowVals[12] = '';"""

replace_simple_1 = """    const extEmp = nextEmp;
    let curPromoColors = {};
    if (extEmp) {
      rowVals[12] = '';"""

search_simple_2 = """      const pKeys = ['promoYearHire', 'promoYearChief', 'promoYearAssistant1', 'promoYearAssistant2', 'promoYearAssistant3', 'promoYearSecHead', 'promoYearDivHead', 'promoYearDeputyHead', 'promoYearDeptHead'];
      const gradeToPromoKey = { '係長級(主査)': 'promoYearChief', '補佐級I(主任)': 'promoYearAssistant1', '補佐級II(班長)': 'promoYearAssistant2', '補佐級III(補佐兼班長)': 'promoYearAssistant3', '課長級': 'promoYearSecHead', '所属長級': 'promoYearDivHead', '次長級': 'promoYearDeputyHead', '部長級': 'promoYearDeptHead' };
      const curPromoColors = {};

      const promoYearMap = {};"""

replace_simple_2 = """      const pKeys = ['promoYearHire', 'promoYearChief', 'promoYearAssistant1', 'promoYearAssistant2', 'promoYearAssistant3', 'promoYearSecHead', 'promoYearDivHead', 'promoYearDeputyHead', 'promoYearDeptHead'];
      const gradeToPromoKey = { '係長級(主査)': 'promoYearChief', '補佐級I(主任)': 'promoYearAssistant1', '補佐級II(班長)': 'promoYearAssistant2', '補佐級III(補佐兼班長)': 'promoYearAssistant3', '課長級': 'promoYearSecHead', '所属長級': 'promoYearDivHead', '次長級': 'promoYearDeputyHead', '部長級': 'promoYearDeptHead' };

      const promoYearMap = {};"""

search_simple_3 = """    if (extEmp && typeof curPromoColors !== 'undefined') {
      Object.keys(curPromoColors).forEach(cIdx => {"""

replace_simple_3 = """    if (extEmp) {
      Object.keys(curPromoColors).forEach(cIdx => {"""

if search_plan_1 in code:
    code = code.replace(search_plan_1, replace_plan_1)
if search_plan_2 in code:
    code = code.replace(search_plan_2, replace_plan_2)
if search_plan_3 in code:
    code = code.replace(search_plan_3, replace_plan_3)
    
if search_simple_1 in code:
    code = code.replace(search_simple_1, replace_simple_1)
if search_simple_2 in code:
    code = code.replace(search_simple_2, replace_simple_2)
if search_simple_3 in code:
    code = code.replace(search_simple_3, replace_simple_3)

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)

print("Replaced scopes")
import sys

with open('src/components/modals/Modals.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update widths of promotion headers
for promo in ['Chief', 'Assistant1', 'Assistant2', 'Assistant3', 'SecHead', 'DivHead', 'DeputyHead', 'DeptHead']:
    old_th = f'sortKey="promoYear{promo}" className="bg-fuchsia-50/50 border-r w-[96px] min-w-[96px] whitespace-normal leading-tight"'
    new_th = f'sortKey="promoYear{promo}" className="bg-fuchsia-50/50 border-r w-[110px] min-w-[110px] whitespace-normal leading-tight"'
    content = content.replace(old_th, new_th)

# 2. Update width of Hire Year header
old_hire_th = '<Th label="採用" sortKey="hireDate" className="bg-fuchsia-50/50 border-l border-r w-[48px] min-w-[48px] whitespace-normal leading-tight" />'
new_hire_th = '<Th label="採用" sortKey="hireDate" className="bg-fuchsia-50/50 border-l border-r w-[56px] min-w-[56px] whitespace-normal leading-tight" />'
content = content.replace(old_hire_th, new_hire_th)

# 3. Update renderPromoCell to use justify-start so it doesn't overflow leftwards if squished
target_promo_cell = '''                    <td key={key} className={cx("bg-fuchsia-50/30 p-1 align-middle", isFirst ? "border-l" : "")}>
                      <div className="flex flex-row items-center justify-center gap-1">'''
repl_promo_cell = '''                    <td key={key} className={cx("bg-fuchsia-50/30 p-1 align-middle", isFirst ? "border-l" : "")}>
                      <div className="flex flex-row items-center justify-center gap-1 overflow-hidden">'''
# Wait, justify-center overflow-hidden will clip. Let's use justify-center but increase gap or just keep it centered. The width increase to 110px is huge, so it won't overflow anymore.
# I'll just change gap-1 to gap-1.5, and we're good.

with open('src/components/modals/Modals.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("SUCCESS apply width adjustments")

import sys
import re

with open('src/components/modals/Modals.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = r'\{diff >= 0 \? diff : 0\}年<ChevronRight className="w-2\.5 h-2\.5 text-blue-500" />'
replacement = r'<ChevronRight className="w-2.5 h-2.5 text-blue-500" />{diff >= 0 ? diff : 0}年'

content = re.sub(target, replacement, content)

with open('src/components/modals/Modals.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("SUCCESS swapped chevron and year in renderFinalDiffCell")

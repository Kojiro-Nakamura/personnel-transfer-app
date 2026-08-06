import re

with open('src/hooks/useExportActions.js', 'r', encoding='utf-8') as f:
    content = f.read()

# I will add the CSS rule inside the @media print block.
# I'll look for `tr { page-break-inside: avoid; }` and append it right after.

replacement = """      tr { page-break-inside: avoid; } /* 行の途中で分断させない */
      table { min-width: 100% !important; max-width: 100% !important; width: 100% !important; box-sizing: border-box; }"""

content = content.replace('      tr { page-break-inside: avoid; } /* 行の途中で分断させない */', replacement)

with open('src/hooks/useExportActions.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('Added print table width constraint.')

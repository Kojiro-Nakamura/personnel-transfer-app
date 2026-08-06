import sys

with open('src/components/modals/Modals.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

target = '''  /* Sticky name column */
  .sticky-name { position: sticky; left: 0; font-weight: bold; min-width: 120px; width: 120px; box-sizing: border-box; }
  tbody td.sticky-name { z-index: 10; background-color: #e2e8f0; }
  thead th.sticky-name { z-index: 30; background-color: #94a3b8; color: #fff; }

  /* Sticky age column */
  .sticky-age { position: sticky; left: 120px; font-weight: bold; min-width: 50px; width: 50px; box-sizing: border-box; }'''

repl = '''  /* Sticky name column */
  .sticky-name { position: sticky; left: 0; font-weight: bold; min-width: 90px; width: 90px; box-sizing: border-box; }
  tbody td.sticky-name { z-index: 10; background-color: #e2e8f0; }
  thead th.sticky-name { z-index: 30; background-color: #94a3b8; color: #fff; }

  /* Sticky age column */
  .sticky-age { position: sticky; left: 90px; font-weight: bold; min-width: 50px; width: 50px; box-sizing: border-box; }'''

if target in text:
    text = text.replace(target, repl)
    with open('src/components/modals/Modals.jsx', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Width replaced successfully")
else:
    print("Target not found")

import sys

with open('src/components/modals/Modals.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace the yellow color for promotion cells
text = text.replace(
    'let styleStr = isNextPromo ? \' style="background-color: #fef08a;"\' : \'\';',
    'let styleStr = isNextPromo ? \' style="background-color: #fed7aa;"\' : \'\';'
)

text = text.replace(
    'histStyle = \' style="background-color: #fef08a;"\';',
    'histStyle = \' style="background-color: #fed7aa;"\';'
)

# Replace the title color
text = text.replace(
    '<th onclick="sortTable(30)" class="bg-fuchsia" style="width: 56px;">来年度</th>',
    '<th onclick="sortTable(30)" class="bg-fuchsia" style="width: 56px; color: #dc2626; font-weight: bold;">来年度</th>'
)

with open('src/components/modals/Modals.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
print("Changes applied successfully.")

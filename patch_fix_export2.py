import sys

with open('src/components/modals/Modals.jsx', 'r', encoding='utf-8') as f:
    modals = f.read()

insert_target = 'export const BulkEditModal = ({ isOpen, onClose, onSave, employees, departments, targetYear }) => {'
new_func = '''const getEraSuffixLocal = (year) => {
  const y = parseInt(year);
  if (isNaN(y)) return '';
  if (y >= 2019) return `R${y - 2018}`;
  if (y >= 1989) return `H${y - 1988}`;
  if (y >= 1926) return `S${y - 1925}`;
  return '';
};

'''

if insert_target in modals and 'const getEraSuffixLocal = (year) => {' not in modals:
    modals = modals.replace(insert_target, new_func + insert_target)
    with open('src/components/modals/Modals.jsx', 'w', encoding='utf-8') as f:
        f.write(modals)
    print("SUCCESS: Inserted getEraSuffixLocal")
elif 'const getEraSuffixLocal = (year) => {' in modals:
    print("SUCCESS: Already there")
else:
    print("ERROR: insert_target not found")

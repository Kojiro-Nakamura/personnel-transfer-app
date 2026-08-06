import sys

with open('src/components/modals/Modals.jsx', 'r', encoding='utf-8') as f:
    modals = f.read()

func_def = '''                const getEraSuffixLocal = (year) => {
    const y = parseInt(year);
    if (isNaN(y)) return '';
    if (y >= 2019) return `R${y - 2018}`;
    if (y >= 1989) return `H${y - 1988}`;
    if (y >= 1926) return `S${y - 1925}`;
    return '';
  };'''

if func_def in modals:
    # Remove it from inside the map loop
    modals = modals.replace(func_def, '')
    
    # Define it outside the component (e.g. before export const BulkEditModal = ...)
    insert_target = 'export const BulkEditModal = ({ isOpen, onClose, onSave, employees, departments, historyYears, getEraFormattedYear }) => {'
    
    new_func = '''const getEraSuffixLocal = (year) => {
  const y = parseInt(year);
  if (isNaN(y)) return '';
  if (y >= 2019) return `R${y - 2018}`;
  if (y >= 1989) return `H${y - 1988}`;
  if (y >= 1926) return `S${y - 1925}`;
  return '';
};

'''
    modals = modals.replace(insert_target, new_func + insert_target)
    
    with open('src/components/modals/Modals.jsx', 'w', encoding='utf-8') as f:
        f.write(modals)
    print("SUCCESS: Moved getEraSuffixLocal out of map loop")
else:
    print("ERROR: Could not find getEraSuffixLocal in Modals.jsx")

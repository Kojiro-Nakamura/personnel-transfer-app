import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

# We need to insert the explicit border assignments after the header styling loop
# The loop ends at:
#     } else if (c !== 10) {
#       c4.fill = headerFill;
#       c5.fill = headerFill;
#     }
#   }

insertion = """  }

  // Fix borders for merged cells
  ws.getCell('A4').border = { top: { style: 'medium' }, bottom: { style: 'medium' }, left: { style: 'medium' }, right: { style: 'thin' } };
  ws.getCell('B4').border = { top: { style: 'medium' }, bottom: { style: 'medium' }, left: { style: 'thin' }, right: { style: 'thin' } };
  ws.getCell('C4').border = { top: { style: 'medium' }, bottom: { style: 'medium' }, left: { style: 'thin' }, right: { style: 'medium' } };
  ws.getCell('J4').border = { top: { style: 'medium' }, bottom: { style: 'medium' }, left: { style: 'thin' }, right: { style: 'thin' } };
  ws.getCell('D4').border = { top: { style: 'medium' }, bottom: { style: 'thin' }, left: { style: 'medium' }, right: { style: 'medium' } };
  ws.getCell('K4').border = { top: { style: 'medium' }, bottom: { style: 'thin' }, left: { style: 'medium' }, right: { style: 'medium' } };
"""

# Replace the closing brace of the loop
target = """    } else if (c !== 10) {
      c4.fill = headerFill;
      c5.fill = headerFill;
    }
  }"""

replacement = """    } else if (c !== 10) {
      c4.fill = headerFill;
      c5.fill = headerFill;
    }
""" + insertion

code = code.replace(target, replacement)

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)
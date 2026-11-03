with open("src/components/modals/Modals.jsx", "r", encoding="utf8") as f:
    code = f.read()

t = """        nextSkills: ps(e.nextSkillsStr)
      };"""
r = """        nextSkills: ps(e.nextSkillsStr)
      };
      if (copy.history) {
        copy.history = copy.history.filter(h => h.department && h.department.trim() !== '');
      }"""

code = code.replace(t, r)

with open("src/components/modals/Modals.jsx", "w", encoding="utf8") as f:
    f.write(code)
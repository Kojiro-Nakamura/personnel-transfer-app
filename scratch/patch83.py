import re

with open('src/hooks/useExportActions.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace <table> with <table border="1">
content = content.replace('  <table>', '  <table border="1">')

with open('src/hooks/useExportActions.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('Added border="1" to table.')

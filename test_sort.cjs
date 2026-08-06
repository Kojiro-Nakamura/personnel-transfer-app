const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = `
<html>
<body>
<table id='empTable'>
  <thead>
    <tr><th colspan="2">Info</th></tr>
    <tr><th onclick='sortTable(0)'>Col 1</th><th onclick='sortTable(1)'>Col 2</th></tr>
  </thead>
  <tbody>
    <tr><td>B</td><td>2</td></tr>
    <tr><td>A</td><td>1</td></tr>
    <tr><td>C</td><td>3</td></tr>
  </tbody>
</table>
<script>
      function sortTable(n) {
        var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
        table = document.getElementById('empTable');
        switching = true;
        dir = 'asc';
        while (switching) {
          switching = false;
          rows = table.rows;
          for (i = 2; i < (rows.length - 1); i++) {
            shouldSwitch = false;
            x = rows[i].getElementsByTagName('TD')[n];
            y = rows[i + 1].getElementsByTagName('TD')[n];
            var valX = x ? (x.getAttribute('data-val') || x.textContent).toLowerCase() : '';
            var valY = y ? (y.getAttribute('data-val') || y.textContent).toLowerCase() : '';
            var numX = Number(valX);
            var numY = Number(valY);
            if (!isNaN(numX) && !isNaN(numY) && valX !== '' && valY !== '') {
               valX = numX; valY = numY;
            }
            if (dir == 'asc') {
              if (valX > valY) { shouldSwitch = true; break; }
            } else if (dir == 'desc') {
              if (valX < valY) { shouldSwitch = true; break; }
            }
          }
          if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            switchcount ++;
          } else {
            if (switchcount == 0 && dir == 'asc') {
              dir = 'desc';
              switching = true;
            }
          }
        }
      }
</script>
</body>
</html>
`;
const dom = new JSDOM(html, { runScripts: 'dangerously' });
const window = dom.window;
window.sortTable(0);
const rows = window.document.querySelectorAll('#empTable tbody tr');
rows.forEach(r => console.log(r.innerHTML));

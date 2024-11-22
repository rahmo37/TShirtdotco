export function sortTableBySelection(table) {
  const tbody = table.tBodies[0];
  let rows = Array.from(tbody.rows); // Static array of rows
  const selectedRows = []; // To store selected rows

  rows.forEach((eachRow) => {
    if (Array.from(eachRow.cells)[0].textContent.includes("✅")) {
      selectedRows.push(eachRow); // Add the row to the selectedRows array
      eachRow.remove(); // Remove the row from the DOM
    }
  });

  // Concatenate selected rows first, then the remaining rows
  rows = [...selectedRows, ...Array.from(tbody.rows)];

  // Append the rows back into the table in sorted order
  rows.forEach((row) => tbody.appendChild(row));
}

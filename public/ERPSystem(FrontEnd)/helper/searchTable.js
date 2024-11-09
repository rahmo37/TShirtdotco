// This function helps in searching the table
export function filterTable() {
  const input = document.getElementById("searchInput");
  const filter = input.value.toLowerCase();
  const table = document.getElementById("dataTable");
  const rows = table.getElementsByTagName("tr");

  for (let i = 1; i < rows.length; i++) {
    // Start from 1 to skip the header row
    let row = rows[i];
    let textContent = row.textContent.toLowerCase();
    if (textContent.includes(filter)) {
      row.style.display = ""; // Show matching row
      highlightText(row, filter); // Highlight matches
    } else {
      row.style.display = "none"; // Hide non-matching row
    }
  }
}

function highlightText(row, keyword) {
  // Remove existing highlights
  const cells = row.getElementsByTagName("td");
  for (let cell of cells) {
    const originalText = cell.textContent;
    cell.innerHTML = originalText; // Reset to plain text
  }

  if (!keyword) return; // Exit if no keyword is entered

  // Apply highlight
  for (let cell of cells) {
    const originalText = cell.textContent;
    const regex = new RegExp(`(${keyword})`, "gi"); // Case-insensitive matching
    const highlightedText = originalText.replace(
      regex,
      `<span class="highlight">$1</span>`
    );
    cell.innerHTML = highlightedText;
  }
}

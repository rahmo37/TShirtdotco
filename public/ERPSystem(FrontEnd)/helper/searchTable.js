export function filterTable() {
  const input = document.getElementById("searchInput");
  const filter = input.value.toLowerCase();
  const table = document.getElementById("dataTable");
  const rows = table.getElementsByTagName("tr");

  for (let i = 1; i < rows.length; i++) {
    // Start from 1 to skip the header row
    let row = rows[i];
    let textContent = row.textContent.toLowerCase();
    textContent = textContent
      .split("\n")
      .map((data) => {
        return data.trim();
      })
      .join("");
    if (textContent.includes(filter)) {
      row.style.display = ""; // Show matching row
      highlightText(row, filter); // Highlight matches
    } else {
      row.style.display = "none"; // Hide non-matching row
    }
  }
}

function highlightText(row, keyword) {
  const cells = row.getElementsByTagName("td");

  // Remove existing highlights
  for (let cell of cells) {
    removeHighlights(cell);
  }

  if (!keyword) return; // Exit if no keyword is entered

  // Apply highlight
  for (let cell of cells) {
    highlightCellText(cell, keyword);
  }
}

function removeHighlights(element) {
  const highlightSpans = element.querySelectorAll("span");
  // console.log(highlightSpans);
  highlightSpans.forEach((span) => {
    // Replace the span with its text content
    span.outerHTML = span.textContent;
  });
}

function highlightCellText(cell, keyword) {
  const regex = new RegExp(`(${keyword})`, "gi");
  cell.childNodes.forEach((node) => {
    
    if (node.nodeType === Node.TEXT_NODE) {
      console.log("Hi");
      const matches = node.textContent.match(regex);
      if (matches) {
        const newHTML = node.textContent.replace(
          regex,
          `<span class="highlight">$1</span>`
        );
        const tempElement = document.createElement("span");
        tempElement.innerHTML = newHTML;
        node.parentNode.replaceChild(tempElement, node);
      }
    }
  });
}

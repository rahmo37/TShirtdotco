// This module loads all the inventory reports

// Importing modules
import { fetchHandler } from "../../helper/fetchHandler.js";
import { urlObject } from "../../helper/urls.js";
import { errorPopUp } from "../../helper/errorPopUpHandler.js";
import { confirmPopUp } from "../../helper/confirmPopUpHandler.js";
import { successPopUp } from "../../helper/successPopupHandler.js";
import { geSalesReport } from "./salesReport.js";
import { sessionObject } from "../../helper/sessionStorage.js";

// Calling the functions
await getInventoryReport();
if (sessionObject.getData("isAdmin")) {
  await geSalesReport();
}

// Get the inventory reports and call the corresponding function
async function getInventoryReport() {
  try {
    const outerContainer = document.querySelector(".inventory-tab");

    // making the container empty of any other content, that means all the content must be added through JS
    outerContainer.innerHTML = "";

    let requestInformation = {
      method: fetchHandler.methods.get,
      url: urlObject.inventoryReport,
    };
    const report = await fetchHandler.sendRequest(requestInformation);
    const inventoryReport = report.data.inventoryReport;

    //Loading content
    appendGeneratedContainer(outerContainer, getNavBarHtml());
    viewTopSellingProduct(inventoryReport.topSellingProducts);
    viewCurrentInventory(inventoryReport.currentQuantityOfProducts);
    viewThisYearSoldProducts(inventoryReport.inventoryUpToCurrentMonth);
    viewLowStockProducts(inventoryReport.lowStockProducts);
  } catch (error) {
    errorPopUp.showErrorModal(error.message);
  }
}

function viewThisYearSoldProducts(report) {
  const soldProducts = report.products;
  const startMonth = report.startMonth.split(",")[0].trim();
  const endMonth = report.endMonth.split(",")[0].trim();
  const totalProductsSold = report.totalProductsSold;
  const outerContainer = document.querySelector(".inventory-tab");
  const containerInfo = {
    section: "sectionC",
    header: "This Year's Sold Products Up To Current Date",
    canvasId: "sold-products-canvas",
    swiperId: "sold-products-container",
    swiperWrapperClass: "sold-products-swiper-wrapper",
    paginationClass: "sold-products-pagination",
    prevButtonClass: "sold-products-prev",
    nextButtonClass: "sold-products-next",
    footer: "Total products sold: " + totalProductsSold,
    includeDateInputs: true, // Include date inputs and submit button
  };

  // Append the generated container and get a reference to it
  const containerHTML = generateContainer(containerInfo);
  const containerDiv = appendGeneratedContainer(outerContainer, containerHTML);

  createCollapsible(containerInfo.section);

  // Local variables to store chart and swiper instances
  let soldProductsChart;
  let soldProductsSwiper;

  // Add event listener for the submit button
  const submitButton = containerDiv.querySelector("#date-submit-button");
  submitButton.addEventListener("click", async function (event) {
    event.preventDefault();
    const updatedInstances = await handleDateSubmit(
      containerDiv,
      soldProductsChart,
      soldProductsSwiper
    );
    soldProductsChart = updatedInstances.chart;
    soldProductsSwiper = updatedInstances.swiper;
    return;
  });

  const soldProductsCanvas = containerDiv.querySelector(
    `#${containerInfo.canvasId}`
  );

  // Function to populate the Swiper carousel
  const swiperWrapper = containerDiv.querySelector(
    `.swiper-wrapper.${containerInfo.swiperWrapperClass}`
  );

  if (soldProducts.length === 0) {
    swiperWrapper.innerHTML = `
      <div class="col-md-12 text-center my-5">
        <h2>Currently there are no reports for sold products</h2>
      </div>`;
    return; // Return early if there are no products
  }

  for (const product of soldProducts) {
    const slide = document.createElement("div");
    slide.classList.add("swiper-slide");
    let discontinuedImageHtml = "";
    if (product.currentAvailabilityStatus === "Unavailable") {
      discontinuedImageHtml = `
    <!-- Image for "Discontinued" -->
      <div class="discontinued-image">
          <img src="../../img/Discontinued.png">
      </div>    
    `;
    }

    slide.innerHTML = `
    <div class="card position-relative">
       <img src="../../shirtImg/${product.imageUrl}" class="card-img-top" alt="${product.productName}" 
       onerror="this.onerror=null;this.src='../../shirtImg/no-photo.png';">
       ${discontinuedImageHtml}
        <div class="card-body">
        <h6 class="card-title">${product.productName}</h6>
        <p class="card-text">Total Sold: ${product.totalQuantitySold}</p>
      </div>
    </div>
      `;

    // Append each slide to swiperWrapper
    swiperWrapper.appendChild(slide);
  }

  const navigationSelectors = {
    pagination: `.swiper-pagination.${containerInfo.paginationClass}`,
    nextEl: `.custom-swiper-button-next.${containerInfo.nextButtonClass}`,
    prevEl: `.custom-swiper-button-prev.${containerInfo.prevButtonClass}`,
  };

  // Generate Swiper and store the instance locally
  soldProductsSwiper = generateSlide(
    `.${containerInfo.swiperId}`,
    navigationSelectors
  );

  // Grabbing the product labels and total quantity sold
  const productLabels = soldProducts.map((product) => product.productName);
  const productSales = soldProducts.map((product) => product.totalQuantitySold);

  // Setting the chart type
  if (productLabels.length !== 0) {
    let chartType = "";
    if (productLabels.length >= 80) {
      chartType = "line";
    } else {
      chartType = "bar";
    }

    const chartInfo = {
      canvasElement: soldProductsCanvas,
      chartType,
      heading: "Sold",
      reportLabels: productLabels,
      colorsArray: generateHSLColor(productLabels.length),
      report: productSales,
      pluginText: [`Product Sold From`, `${startMonth} - ${endMonth}`],
    };

    // Generate Chart and store the instance locally
    soldProductsChart = generateChart(chartInfo);
  }
}

function viewCurrentInventory(report) {
  // Reassigning the report
  const currentInventory = report;

  // This will calculate the total product
  let totalProducts = 0;

  // Adding the total product for each category
  currentInventory.forEach((category) => {
    const totalQuantity = category.products.reduce(
      (sum, product) => sum + 1,
      0
    );
    totalProducts += totalQuantity;
    category.categoryTotal = totalQuantity;
    category.categoryName = category.categoryName
      .split("_")
      .map((word) => {
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(" ");
  });

  // Grabbing the inventory tab
  const outerContainer = document.querySelector(".inventory-tab");

  // Information for the container
  const containerInfo = {
    section: "sectionB",
    header: "Current Inventory",
    canvasId: "current-inventory-canvas",
    swiperId: "current-inventory-swiper",
    swiperWrapperClass: "current-inventory-swiper-wrapper",
    paginationClass: "current-inventory-pagination",
    prevButtonClass: "current-inventory-prev",
    nextButtonClass: "current-inventory-next",
    footer: "Total product in all categories: " + totalProducts,
  };

  // Append the generated container and get a reference to it
  const containerHTML = generateContainer(containerInfo);
  const containerDiv = appendGeneratedContainer(outerContainer, containerHTML);

  createCollapsible(containerInfo.section);

  // Grabbing the current inventory canvas
  const currentInventoryCanvas = containerDiv.querySelector(
    `#${containerInfo.canvasId}`
  );

  // Grabbing the swiper wrapper
  const swiperWrapper = containerDiv.querySelector(
    `.swiper-wrapper.${containerInfo.swiperWrapperClass}`
  );

  // Checking if there are any products
  if (currentInventory.length === 0) {
    swiperWrapper.innerHTML = `
      <div class="col-md-12 text-center my-5">
        <h2>Currently there are no reports for current products</h2>
      </div>`;
    return; // Return early if there are no products
  }

  // Setting the slides
  for (const category of currentInventory) {
    for (const product of category.products) {
      const slide = document.createElement("div");
      slide.classList.add("swiper-slide");

      slide.innerHTML = `
      <div class="card">
        <img src="../../shirtImg/${product.imageUrl}" class="card-img-top" alt="${product.productName}" 
         onerror="this.onerror=null;this.src='../../shirtImg/no-photo.png';">
        <div class="card-body">
          <h6 class="card-title">${product.productName}</h6>
        </div>
        <div class="card-footer">
          <p class="card-text">Category: ${category.categoryName}</p>
          <p class="card-text">Current Quantity: ${product.currentQuantity}</p>
          <p class="card-text">Total Sold: ${product.totalSold}</p>
        </div>
      </div>`;

      swiperWrapper.appendChild(slide); // Append each slide to the swiperWrapper
    }
  }

  // Accumulating the accessories of the swiper
  const navigationSelectors = {
    pagination: `.swiper-pagination.${containerInfo.paginationClass}`,
    nextEl: `.custom-swiper-button-next.${containerInfo.nextButtonClass}`,
    prevEl: `.custom-swiper-button-prev.${containerInfo.prevButtonClass}`,
  };

  // Generating the swiper
  const swiper = generateSlide(
    `.${containerInfo.swiperId}`,
    navigationSelectors
  );

  // Grabbing the category labels and category total
  const categoryLabels = currentInventory.map(
    (category) => category.categoryName
  );
  const categoryTotals = currentInventory.map(
    (category) => category.categoryTotal
  );

  // Setting the chart type
  let chartType = "pie";
  const chartInfo = {
    canvasElement: currentInventoryCanvas,
    chartType,
    heading: "At Hand",
    reportLabels: categoryLabels,
    colorsArray: generateHSLColor(categoryLabels.length),
    report: categoryTotals,
    pluginText: [`Current Inventory`, ``],
  };

  const chart = generateChart(chartInfo);
}

function viewTopSellingProduct(report) {
  const topSellingProducts = report;
  // Sort the result based on greater sold quantity
  topSellingProducts.sort((a, b) => b.totalQuantitySold - a.totalQuantitySold);
  const outerContainer = document.querySelector(".inventory-tab");
  const containerInfo = {
    section: "sectionA",
    header: "Top Selling Products",
    canvasId: "top-sold-products-canvas",
    swiperId: "top-sold-products-container",
    swiperWrapperClass: "top-sold-products-swiper-wrapper",
    paginationClass: "top-sold-products-pagination",
    prevButtonClass: "top-sold-products-prev",
    nextButtonClass: "top-sold-products-next",
    footer: "",
    includeDateInputs: false, // Include date inputs and submit button
  };

  // Append the generated container and get a reference to it
  const containerHTML = generateContainer(containerInfo);
  const containerDiv = appendGeneratedContainer(outerContainer, containerHTML);

  createCollapsible(containerInfo.section);

  const topSoldProductsCanvas = containerDiv.querySelector(
    `#${containerInfo.canvasId}`
  );

  // Function to populate the Swiper carousel
  const swiperWrapper = containerDiv.querySelector(
    `.swiper-wrapper.${containerInfo.swiperWrapperClass}`
  );

  if (topSellingProducts.length === 0) {
    swiperWrapper.innerHTML = `
        <div class="col-md-12 text-center my-5">
          <h2>Currently there are no reports for top selling products</h2>
        </div>`;
    return; // Return early if there are no products
  }

  for (const product of topSellingProducts) {
    const slide = document.createElement("div");
    slide.classList.add("swiper-slide");
    let rankingImageHtml = "";
    if (topSellingProducts.indexOf(product) === 0) {
      rankingImageHtml = `
    <!-- Image for "ranking" -->
      <div class="ranking-image">
          <img src="../../img/tag1.png">
      </div>    
    `;
    } else if (topSellingProducts.indexOf(product) === 1) {
      rankingImageHtml = `
    <!-- Image for "ranking" -->
      <div class="ranking-image">
          <img src="../../img/tag2.png">
      </div>    
    `;
    } else if (topSellingProducts.indexOf(product) === 2) {
      rankingImageHtml = `
      <!-- Image for "ranking" -->
        <div class="ranking-image">
            <img src="../../img/tag3.png">
        </div>    
      `;
    }

    slide.innerHTML = `
    <div class="card position-relative">
       <img src="../../shirtImg/${
         product.imageUrl
       }" class="card-img-top" alt="${product.productName}" 
       onerror="this.onerror=null;this.src='../../shirtImg/no-photo.png';">
       ${rankingImageHtml}
        <div class="card-body">
        <h6 class="card-title">${product.productName}</h6>
        <p class="card-text">Total Sold: ${product.totalQuantitySold}</p>
      </div>
        <div class="card-footer">
          <p class="card-text">Category: ${product.categoryName
            .split("_")
            .map((word) => {
              return word.charAt(0).toUpperCase() + word.slice(1);
            })
            .join(" ")}</p>
        </div>
    </div>
      `;

    // Append each slide to swiperWrapper
    swiperWrapper.appendChild(slide);
  }

  const navigationSelectors = {
    pagination: `.swiper-pagination.${containerInfo.paginationClass}`,
    nextEl: `.custom-swiper-button-next.${containerInfo.nextButtonClass}`,
    prevEl: `.custom-swiper-button-prev.${containerInfo.prevButtonClass}`,
  };

  // Generate Swiper and store the instance
  const topSellingSwiper = generateSlide(
    `.${containerInfo.swiperId}`,
    navigationSelectors
  );

  const productLabels = topSellingProducts.map(
    (product) => product.productName
  );
  const productSales = topSellingProducts.map(
    (product) => product.totalQuantitySold
  );
  const chartType = "doughnut";
  const chartInfo = {
    canvasElement: topSoldProductsCanvas,
    chartType,
    heading: "Sold",
    reportLabels: productLabels,
    colorsArray: generateHSLColor(productLabels.length),
    report: productSales,
    pluginText: [`Top Selling Products`],
  };

  // Generate Chart and store the instance
  const topSellingChart = generateChart(chartInfo);
}

function viewLowStockProducts(report) {
  const lowStockProducts = report;
  // Sort the result based on lowest current quantity
  lowStockProducts.sort((a, b) => a.currentQuantity - b.currentQuantity);
  const outerContainer = document.querySelector(".inventory-tab");
  const containerInfo = {
    section: "sectionD",
    header: "Low Stock Products",
    canvasId: "low-stock-products-canvas",
    swiperId: "low-stock-products-container",
    swiperWrapperClass: "low-stock-products-swiper-wrapper",
    paginationClass: "low-stock-products-pagination",
    prevButtonClass: "low-stock-products-prev",
    nextButtonClass: "low-stock-products-next",
    footer: "",
    includeDateInputs: false, // Include date inputs and submit button
  };

  // Append the generated container and get a reference to it
  const containerHTML = generateContainer(containerInfo);
  const containerDiv = appendGeneratedContainer(
    outerContainer,
    containerHTML,
    "low-stock-container"
  );

  createCollapsible(containerInfo.section);

  const lowStockProductsCanvas = containerDiv.querySelector(
    `#${containerInfo.canvasId}`
  );

  // Function to populate the Swiper carousel
  const swiperWrapper = containerDiv.querySelector(
    `.swiper-wrapper.${containerInfo.swiperWrapperClass}`
  );

  if (lowStockProducts.length === 0) {
    if (swiperWrapper) {
      swiperWrapper.innerHTML = `
        <div class="col-md-12 text-center my-5">
          <h2>Currently there are no low-stock products</h2>
        </div>`;
    } else {
      errorPopUp.showErrorModal("swiperWrapper element not found.");
    }

    const emptyChart = document.getElementById("low-stock-products-canvas");
    if (emptyChart) {
      emptyChart.remove();
    } else {
      errorPopUp.showErrorModal(
        "Element with ID 'top-sold-products-canvas' not found."
      );
    }

    return; // Return early if there are no products
  }

  for (const product of lowStockProducts) {
    const slide = document.createElement("div");
    slide.classList.add("swiper-slide");

    slide.innerHTML = `
    <div class="card position-relative">
       <img src="../../shirtImg/${
         product.imageUrl
       }" class="card-img-top" alt="${product.productName}" 
       onerror="this.onerror=null;this.src='../../shirtImg/no-photo.png';">
        <div class="card-body">
        <h6 class="card-title">${product.productName}</h6>
        <p class="card-text text-bg-danger">Current Quantity: ${
          product.currentQuantity
        }</p>
      </div>
        <div class="card-footer">
        <p  class="card-text">Restock Threshold: ${product.restockThreshold}</p>
          <p class="card-text">Category: ${product.categoryName
            .split("_")
            .map((word) => {
              return word.charAt(0).toUpperCase() + word.slice(1);
            })
            .join(" ")}</p>
            <p  class="card-text">Last Restocked: ${product.lastRestock}</p>
            <button class="restock-button my-2">Restock</button>
        </div>
      </div>
      `;

    // Append each slide to swiperWrapper
    swiperWrapper.appendChild(slide);

    let confirmMessage = `Restock ${product.productName} with <span style="color: green;">${product.restockQuantity}</span> new items?`;
    const restockButton = slide.querySelector(".restock-button");
    restockButton.addEventListener("click", () => {
      confirmPopUp.showConfirmModal(confirmMessage, () => {
        handleRestock(product.categoryID, product.productID);
      });
    });
  }

  const navigationSelectors = {
    pagination: `.swiper-pagination.${containerInfo.paginationClass}`,
    nextEl: `.custom-swiper-button-next.${containerInfo.nextButtonClass}`,
    prevEl: `.custom-swiper-button-prev.${containerInfo.prevButtonClass}`,
  };

  // Generate Swiper and store the instance
  const lowStockSwiper = generateSlide(
    `.${containerInfo.swiperId}`,
    navigationSelectors
  );

  const productLabels = lowStockProducts.map((product) => product.productName);
  const currentQuantity = lowStockProducts.map(
    (product) => product.currentQuantity
  );

  const chartType = "bar";
  const chartInfo = {
    canvasElement: lowStockProductsCanvas,
    chartType,
    heading: "At hand",
    reportLabels: productLabels,
    colorsArray: generateHSLColor(productLabels.length),
    report: currentQuantity,
    pluginText: [`Low Stock Products`],
  };

  // Generate Chart and store the instance
  const lowStockChart = generateChart(chartInfo);
}

// ! -------------------------Helpers---------------------------------

function getNavBarHtml() {
  return `
      <nav class="navbar navbar-light bg-light inventory-navbar">
        <div class="container-fluid">
          <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto">
              <li class="nav-item">
                <a class="nav-link nav-bar-link" aria-current="page" href="#sectionA">Top Selling Products</a>
              </li>
              <li class="nav-item nav-bar-link">
                <a class="nav-link nav-bar-link" href="#sectionB">Current Inventory</a>
              </li>
              <li class="nav-item nav-bar-link">
                <a class="nav-link nav-bar-link" href="#sectionC">Sold reports</a>
              </li>
              <li class="nav-item nav-bar-link">
                <a class="nav-link nav-bar-link" href="#sectionD">Low Stock Products</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
  `;
}

function generateContainer(containerInfo) {
  // Date input HTML

  const dateHTML = containerInfo.includeDateInputs
    ? `
      <div class="row justify-content-center align-items-center date-container mb-4">
        <h5 class="text-center mb-3" style="color: #3648be;">Change Report Range</h5>
        <div class="col-auto">
          <label for="startDate" class="visually-hidden">Start Date</label>
          <input type="date" class="form-control" id="startDate" name="startDate">
        </div>
        <div class="col-auto">
        <h1>-</h1>
        </div>
        <div class="col-auto">
          <label for="endDate" class="visually-hidden">End Date</label>
          <input type="date" class="form-control" id="endDate" name="endDate">
        </div>
        <div class="col-auto">
          <button type="submit" id="date-submit-button">Submit</button>
        </div>
      </div>
    `
    : "";

  const containerHTML = `
      <div class="row d-flex justify-content-center "id="${containerInfo.section}">
        <div class="col-md-12 text-center header" tabindex="-1">
          <h2>${containerInfo.header}</h2>
        </div>
        <button class="collapse-btn"><i class="fa-solid fa-minus"></i></button>
        <!-- Carousel Column -->
        <div class="col-md-12">
          <!-- Swiper -->
          <div class="swiper-container ${containerInfo.swiperId}">
            <div class="swiper-wrapper ${containerInfo.swiperWrapperClass}">
              <!-- Slides will be dynamically added here -->
            </div>
            <!-- Add Pagination -->
            <div class="swiper-pagination ${containerInfo.paginationClass}"></div>
            <!-- Add Navigation -->
            <div class="custom-swiper-button-prev ${containerInfo.prevButtonClass}">
              <i class="lni lni-chevron-left"></i>
            </div>
            <div class="custom-swiper-button-next ${containerInfo.nextButtonClass}">
              <i class="lni lni-chevron-right"></i>
            </div>
          </div>
        </div>

        <!-- Chart Column -->
        <div class="col-md-6 chart-container">
          <canvas class="report-chart" id="${containerInfo.canvasId}" width="400"></canvas>
        </div>
        <div class="col-md-12 text-center footer my-5">
          <h2>${containerInfo.footer}</h2>
        </div>
        ${dateHTML}
      </div>
  `;

  return containerHTML;
}

function appendGeneratedContainer(outerContainer, containerHTML, containerId) {
  const containerDiv = document.createElement("div");
  if (containerId) {
    containerDiv.classList.add(containerId);
  }
  containerDiv.innerHTML = containerHTML;
  outerContainer.appendChild(containerDiv);
  return containerDiv;
}

async function handleDateSubmit(
  containerDiv,
  soldProductsChart,
  soldProductsSwiper
) {
  try {
    // Get the start and end dates from the input fields
    const startDateInput = containerDiv.querySelector("#startDate");
    const endDateInput = containerDiv.querySelector("#endDate");

    const startDateValue = startDateInput.value;
    const endDateValue = endDateInput.value;

    if (!startDateValue || !endDateValue) {
      errorPopUp.showErrorModal("Enter values in the date fields");
      return { chart: soldProductsChart, swiper: soldProductsSwiper };
    }

    if (startDateValue >= endDateValue) {
      errorPopUp.showErrorModal(
        "Please select a start date that is earlier than the end date."
      );
      return { chart: soldProductsChart, swiper: soldProductsSwiper };
    }

    // Prepare the request payload
    const requestBody = {
      startDate: {
        day: parseInt(startDateValue.split("-")[2]),
        month: parseInt(startDateValue.split("-")[1]),
        year: parseInt(startDateValue.split("-")[0]),
      },
      endDate: {
        day: parseInt(endDateValue.split("-")[2]),
        month: parseInt(endDateValue.split("-")[1]),
        year: parseInt(endDateValue.split("-")[0]),
      },
    };

    // Prepare the request information
    const requestInformation = {
      method: fetchHandler.methods.post,
      url: urlObject.customInventoryReport,
      data: requestBody,
    };

    // Fetch the new report data
    const response = await fetchHandler.sendRequest(requestInformation);

    // Get the new report data
    const newReport = response.data.customSoldProductReport;

    // Update the content in the container
    const updatedInstances = updateSoldProducts(
      containerDiv,
      newReport,
      soldProductsChart,
      soldProductsSwiper
    );

    if (updatedInstances) {
      startDateInput.value = "";
      endDateInput.value = "";
    }

    return updatedInstances;
  } catch (error) {
    errorPopUp.showErrorModal(error.message);
    return { chart: soldProductsChart, swiper: soldProductsSwiper };
  }
}

async function handleRestock(categoryId, productId) {
  try {
    // Send restock request
    const requestInfo = {
      url: urlObject.restockProduct + categoryId + "/" + productId,
      method: fetchHandler.methods.patch,
    };
    const result = await fetchHandler.sendRequest(requestInfo);

    // Show success message
    successPopUp.showSuccessModal(result.message);

    // Refetch updated inventory report
    const requestInformation = {
      method: fetchHandler.methods.get,
      url: urlObject.inventoryReport,
    };
    const newReport = await fetchHandler.sendRequest(requestInformation);
    const newLowStockProducts = newReport.data.inventoryReport.lowStockProducts;

    // Remove the current low-stock container if it exists
    const lowStockContainer = document.querySelector(".low-stock-container");
    if (lowStockContainer) {
      lowStockContainer.remove();
      // Refresh the view with updated low-stock products
      viewLowStockProducts(newLowStockProducts);
    } else {
      // Fallback: Refresh the entire inventory report if low-stock container doesn't exist
      getInventoryReport();
    }
  } catch (error) {
    // Show error message in case of failure
    errorPopUp.showErrorModal(error.message);
  }
}

function updateSoldProducts(
  containerDiv,
  newReport,
  soldProductsChart,
  soldProductsSwiper
) {
  const soldProducts = newReport.products;
  const totalProductsSold = newReport.totalProductsSold;
  const startDateValue = newReport.startMonth;
  const endDateValue = newReport.endMonth;

  // Update the header and footer with the new date range
  const headerElement = containerDiv.querySelector(".header h2");
  headerElement.innerHTML = `Sold Products from <br>${startDateValue} - ${endDateValue}`;
  headerElement.setAttribute("tabindex", "0");
  headerElement.focus();

  const footerElement = containerDiv.querySelector(".footer.my-5 h2");
  console.log(footerElement);
  footerElement.textContent = "Total products sold: " + totalProductsSold;

  // Update the swiper slides
  const swiperWrapper = containerDiv.querySelector(
    `.swiper-wrapper.sold-products-swiper-wrapper`
  );
  swiperWrapper.innerHTML = ""; // Clear existing slides

  if (soldProducts.length === 0) {
    swiperWrapper.innerHTML = `
      <div class="col-md-12 text-center my-5">
        <h2>No products sold in the selected date range.</h2>
      </div>`;
    // Destroy the old chart if it exists
    if (soldProductsChart) {
      soldProductsChart.destroy();
    }
    return { chart: soldProductsChart, swiper: soldProductsSwiper };
  }

  soldProducts.forEach((product) => {
    const slide = document.createElement("div");
    slide.classList.add("swiper-slide");

    let discontinuedImageHtml = "";
    if (product.currentAvailabilityStatus === "Unavailable") {
      discontinuedImageHtml = `
    <!-- Image for "Discontinued" -->
      <div class="discontinued-image">
          <img src="../../img/Discontinued.png">
      </div>    
    `;
    }

    slide.innerHTML = `
    <div class="card position-relative">
       <img src="../../shirtImg/${product.imageUrl}" class="card-img-top" alt="${product.productName}" 
       onerror="this.onerror=null;this.src='../../shirtImg/no-photo.png';">
       ${discontinuedImageHtml}
        <div class="card-body">
        <h6 class="card-title">${product.productName}</h6>
        <p class="card-text">Total Sold: ${product.totalQuantitySold}</p>
      </div>
    </div>`;

    swiperWrapper.appendChild(slide);
  });

  // Reinitialize Swiper
  const swiperContainerClass = `.sold-products-container`;
  const navigationSelectors = {
    pagination: `.swiper-pagination.sold-products-pagination`,
    nextEl: `.custom-swiper-button-next.sold-products-next`,
    prevEl: `.custom-swiper-button-prev.sold-products-prev`,
  };

  // Destroy the old swiper instance if it exists
  if (soldProductsSwiper) {
    soldProductsSwiper.destroy(true, true);
  }

  soldProductsSwiper = generateSlide(swiperContainerClass, navigationSelectors);

  // Update the chart
  const soldProductsCanvas = containerDiv.querySelector(
    `#sold-products-canvas`
  );

  // Destroy the old chart instance if it exists
  if (soldProductsChart) {
    soldProductsChart.destroy();
  }

  const productLabels = soldProducts.map((product) => product.productName);
  const productSales = soldProducts.map((product) => product.totalQuantitySold);

  if (productLabels.length !== 0) {
    let chartType = "";
    if (productLabels.length >= 80) {
      chartType = "line";
    } else {
      chartType = "bar";
    }

    const chartInfo = {
      canvasElement: soldProductsCanvas,
      chartType,
      heading: "Sold",
      reportLabels: productLabels,
      colorsArray: generateHSLColor(productLabels.length),
      report: productSales,
      pluginText: [`Product Sold From`, `${startDateValue} to ${endDateValue}`],
    };

    soldProductsChart = generateChart(chartInfo);
  }

  return { chart: soldProductsChart, swiper: soldProductsSwiper };
}

function generateSlide(slideContainer, navigationSelectors) {
  const swiperContainer = document.querySelector(slideContainer);
  const slides = swiperContainer.querySelectorAll(".swiper-slide");
  const swiper = new Swiper(slideContainer, {
    slidesPerView: slides.length === 1 ? 1 : 3,
    slidesPerGroup: 1,
    spaceBetween: 20,
    loop: false,
    centeredSlides: slides.length === 1, // Center if only one slide
    pagination: {
      el: navigationSelectors.pagination,
      clickable: true,
    },
    navigation: {
      nextEl: navigationSelectors.nextEl,
      prevEl: navigationSelectors.prevEl,
    },
    breakpoints: {
      1200: {
        slidesPerView: 3,
        slidesPerGroup: 2,
      },
      992: {
        slidesPerView: 2,
        slidesPerGroup: 2,
      },
      768: {
        slidesPerView: 1,
        slidesPerGroup: 1,
      },
      576: {
        slidesPerView: 1,
        slidesPerGroup: 1,
      },
    },
  });

  return swiper;
}

function generateChart(chartInfo) {
  // Creating chart
  const chart = new Chart(chartInfo.canvasElement, {
    type: chartInfo.chartType,
    data: {
      labels: chartInfo.reportLabels,
      datasets: [
        {
          label: chartInfo.heading,
          data: chartInfo.report,
          backgroundColor: chartInfo.colorsArray[0],
          borderColor: chartInfo.colorsArray[1],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {},
      plugins: {
        title: {
          display: true,
          text: chartInfo.pluginText,
          font: {
            size: 20,
          },
        },
        legend: {
          position: "bottom",
          align: "center",
          labels: {
            boxWidth: 20,
            padding: 25,
            font: {
              size: 16,
            },
          },
        },
        tooltip: {
          titleFont: {
            size: 20, // Header font size
          },
          bodyFont: {
            size: 18, // Increase tooltip font size
          },
        },
      },
    },
  });
  return chart;
}

// Generate dynamic colors
function generateHSLColor(length) {
  // Generate colors for each product
  const totalProducts = length;
  const backgroundColors = [];
  const borderColors = [];

  for (let i = 0; i < totalProducts; i++) {
    const hue = (i * 360) / length;
    const color = `hsl(${hue}, 70%, 50%)`;
    backgroundColors.push(color.replace("50%", "70%"));
    borderColors.push(color);
  }

  return [backgroundColors, borderColors];
}

function createCollapsible(section) {
  const containerElement = document.getElementById(section);
  const collapseBtn = containerElement.querySelector(".collapse-btn");

  collapseBtn.addEventListener("click", () => {
    containerElement.classList.toggle("report-box");
    if (containerElement.classList.contains("report-box")) {
      collapseBtn.innerHTML = `<i class="fa-solid fa-plus"></i></i>`;
    } else {
      collapseBtn.innerHTML = `<i class="fa-solid fa-minus"></i>`;
    }
  });
}

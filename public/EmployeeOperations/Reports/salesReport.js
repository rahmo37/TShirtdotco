// This module loads all the sales reports

// Importing modules
import { fetchHandler } from "../../helper/fetchHandler.js";
import { urlObject } from "../../helper/urls.js";
import { errorPopUp } from "../../helper/errorPopUpHandler.js";
import { confirmPopUp } from "../../helper/confirmPopUpHandler.js";
import { successPopUp } from "../../helper/successPopupHandler.js";

// Get the sales reports and call the corresponding functions
export async function geSalesReport() {
  try {
    const outerContainer = document.querySelector(".sales-tab");

    // Making the container empty of any other content
    outerContainer.innerHTML = "";

    let requestInformation = {
      method: fetchHandler.methods.get,
      url: urlObject.salesReport,
    };
    const report = await fetchHandler.sendRequest(requestInformation);
    const salesReport = report.data.salesReport;

    // Loading content
    appendGeneratedContainer(outerContainer, getNavBarHtml());
    viewThisYearSalesReport(salesReport.salesUptoCurrentMonth);
    viewRevenueByCustomer(salesReport.saleByEachCustomer.totalSalesPerCustomer);
    viewRevenueByProductAndCategory(salesReport.salesOfEachProduct);
  } catch (error) {
    errorPopUp.showErrorModal(error.message);
  }
}

function viewThisYearSalesReport(report) {
  const monthlySales = report.monthlySales;
  const ordersInTheSales = report.orders.sort(
    (a, b) => b.grandTotal - a.grandTotal
  );
  const totalRevenue = report.totalRevenue;
  const startMonth = report.startMonth.trim();
  const endMonth = report.endMonth.trim();
  const outerContainer = document.querySelector(".sales-tab");

  const containerInfo = {
    section: "sectionE",
    header: "All-Time Revenue Up To Current Day",
    canvasId: "monthly-sales-canvas",
    swiperId: "each-order-container",
    swiperWrapperClass: "each-order-swiper-wrapper",
    paginationClass: "each-order-pagination",
    prevButtonClass: "each-order-prev",
    nextButtonClass: "each-order-next",
    footer: "Total Revenue: $" + totalRevenue,
    includeDateInputs: true, // Include date inputs and submit button
  };

  // Append the generated container and get a reference to it
  const containerHTML = generateContainer(containerInfo);
  const containerDiv = appendGeneratedContainer(outerContainer, containerHTML);

  createCollapsible(containerInfo.section);

  // Local variables to store chart and swiper instances
  let monthlySalesChart;
  let eachOrderSwiper;

  const submitButton = containerDiv.querySelector("#date-submit-button");
  submitButton.addEventListener("click", async function (event) {
    event.preventDefault();
    const updatedInstances = await handleDateSubmit(
      containerDiv,
      monthlySalesChart,
      eachOrderSwiper
    );
    // Correctly assign the updated instances
    monthlySalesChart = updatedInstances.chart;
    eachOrderSwiper = updatedInstances.swiper;
    return;
  });

  const monthlySalesCanvas = containerDiv.querySelector(
    `#${containerInfo.canvasId}`
  );

  // Function to populate the Swiper carousel
  const swiperWrapper = containerDiv.querySelector(
    `.swiper-wrapper.${containerInfo.swiperWrapperClass}`
  );

  if (ordersInTheSales.length === 0) {
    swiperWrapper.innerHTML = `
      <div class="col-md-12 text-center my-5">
        <h2>Currently there are no reports for Total Revenue</h2>
      </div>`;
    return; // Return early if there are no products
  }

  for (const order of ordersInTheSales) {
    const slide = document.createElement("div");
    slide.classList.add("swiper-slide");

    slide.innerHTML = `
    <div class="card position-relative">
       <img src="../../img/order.png" class="card-img-top" alt="order image" 
       onerror="this.onerror=null;this.src='../../shirtImg/no-photo.png';">
        <div class="card-body">
        <h6 class="card-title">${order.orderID}</h6>
        <h4 class="card-text">Revenue: $${order.grandTotal}</h4>
        
      </div>
        <div class="card-footer">
          <h5 class="card-text my-2">${order.orderDate}</h5>
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
  eachOrderSwiper = generateSlide(
    `.${containerInfo.swiperId}`,
    navigationSelectors
  );

  const allMonths = monthlySales.map((months) => months.month);
  const allRevenues = monthlySales.map((months) => months.revenue);

  // Setting the chart type
  if (allMonths.length !== 0) {
    let chartType = "";
    if (allMonths.length >= 80) {
      chartType = "line";
    } else {
      chartType = "bar";
    }

    const chartInfo = {
      canvasElement: monthlySalesCanvas,
      chartType,
      heading: "Revenue",
      reportLabels: allMonths,
      colorsArray: generateHSLColor(allMonths.length),
      report: allRevenues,
      pluginText: [`Each Revenue From: `, `${startMonth} - ${endMonth}`],
    };

    // Generate Chart and store the instance locally
    monthlySalesChart = generateChart(chartInfo);
  }
}

function viewRevenueByProductAndCategory(report) {
  const revenueOfEachProduct = report.productRevenueByCategory
    .flatMap((category) =>
      category.products.map((product) => ({
        ...product,
        categoryName: category.categoryName, // Add categoryName to each product
      }))
    )
    .sort((a, b) => b.productRevenue - a.productRevenue);

  const revenueOfEachCategory = report.productRevenueByCategory
    .map((category) => {
      const categoryRevenue = category.products.reduce((acc, product) => {
        return acc + +product.productRevenue;
      }, 0);
      return {
        categoryName: category.categoryName,
        categoryRevenue: +categoryRevenue.toFixed(2),
      };
    })
    .sort((a, b) => b.categoryRevenue - a.categoryRevenue);
  const outerContainer = document.querySelector(".sales-tab");

  const containerInfo = {
    section: "sectionG",
    header: "Revenue Of Current Products And Categories",
    canvasId: "each-product-revenue-canvas",
    additionalCanvasId: "each-category-revenue-canvas",
    swiperId: "each-product-container",
    swiperWrapperClass: "each-product-swiper-wrapper",
    paginationClass: "each-product-pagination",
    prevButtonClass: "each-product-products-prev",
    nextButtonClass: "each-product-products-next",
    footer: "",
    includeDateInputs: false, // Include date inputs and submit button
  };

  const containerHTML = generateContainer(containerInfo);
  const containerDiv = appendGeneratedContainer(outerContainer, containerHTML);

  createCollapsible(containerInfo.section);

  const eachProductRevenueCanvas = containerDiv.querySelector(
    `#${containerInfo.canvasId}`
  );
  const eachCategoryRevenueCanvas = containerDiv.querySelector(
    `#${containerInfo.additionalCanvasId}`
  );

  const swiperWrapper = containerDiv.querySelector(
    `.swiper-wrapper.${containerInfo.swiperWrapperClass}`
  );

  if (revenueOfEachCategory.length === 0) {
    swiperWrapper.innerHTML = `
        <div class="col-md-12 text-center my-5">
          <h2>Currently there are no revenue reports for product and category</h2>
        </div>`;
    return; // Return early if there are no products
  }

  for (const product of revenueOfEachProduct) {
    const slide = document.createElement("div");
    slide.classList.add("swiper-slide");
    slide.innerHTML = `
    <div class="card position-relative">
       <img src="../../shirtImg/${
         product.imageUrl
       }" class="card-img-top" alt="${product.productName}" 
       onerror="this.onerror=null;this.src='../../shirtImg/no-photo.png';">
        <div class="card-body">
        <p class="card-title">${product.productName}</p>
        <h4 class="card-title">Revenue: $${product.productRevenue}</h4>
      </div>
      <div class="card-footer">
          <p class="card-text my-1">Category: ${product.categoryName
            .split("_")
            .map((word) => {
              return word.charAt(0).toUpperCase() + word.slice(1);
            })
            .join(" ")}
            </p>
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

  // Chart 1
  const eachProductRevenueSwiper = generateSlide(
    `.${containerInfo.swiperId}`,
    navigationSelectors
  );

  const productLabels = revenueOfEachProduct.map((product) => {
    return product.productName;
  });

  const productRevenues = revenueOfEachProduct.map((product) => {
    return product.productRevenue;
  });

  const chartTypeLeft = "bar";
  const chartInfoLeft = {
    canvasElement: eachProductRevenueCanvas,
    chartType: chartTypeLeft,
    heading: "Revenue",
    reportLabels: productLabels,
    colorsArray: generateHSLColor(productLabels.length),
    report: productRevenues,
    pluginText: [`Revenue by Products`],
  };

  const eachProductRevenueChart = generateChart(chartInfoLeft);

  // Chart 2
  const categoryName = revenueOfEachCategory.map((category) => {
    return category.categoryName;
  });

  const categoryRevenues = revenueOfEachCategory.map((category) => {
    return category.categoryRevenue;
  });

  const chartTypeRight = "pie";
  const chartInfoRight = {
    canvasElement: eachCategoryRevenueCanvas,
    chartType: chartTypeRight,
    heading: "Revenue",
    reportLabels: categoryName,
    colorsArray: generateHSLColor(categoryName.length),
    report: categoryRevenues,
    pluginText: [`Revenue by Category`],
  };

  const eachCategoryRevenueChart = generateChart(chartInfoRight);
}

function viewRevenueByCustomer(report) {
  const revenuePerCustomerReport = report.sort((a, b) => {
    return b.totalSales - a.totalSales;
  });

  const outerContainer = document.querySelector(".sales-tab");

  const containerInfo = {
    section: "sectionF",
    header: "Revenue Per Customer",
    canvasId: "revenue-per-customer-canvas",
    swiperId: "revenue-per-customer-container",
    swiperWrapperClass: "revenue-per-customer-swiper-wrapper",
    paginationClass: "revenue-per-customer-pagination",
    prevButtonClass: "revenue-per-customer-prev",
    nextButtonClass: "revenue-per-customer-next",
    footer: "",
    includeDateInputs: false, // Include date inputs and submit button
  };

  // Append the generated container and get a reference to it
  const containerHTML = generateContainer(containerInfo);
  const containerDiv = appendGeneratedContainer(outerContainer, containerHTML);

  createCollapsible(containerInfo.section);

  const revenuePerCustomerCanvas = containerDiv.querySelector(
    `#${containerInfo.canvasId}`
  );

  // Function to populate the Swiper carousel
  const swiperWrapper = containerDiv.querySelector(
    `.swiper-wrapper.${containerInfo.swiperWrapperClass}`
  );

  if (revenuePerCustomerReport.length === 0) {
    swiperWrapper.innerHTML = `
        <div class="col-md-12 text-center my-5">
          <h2>Currently there are no reports for revenue per customer</h2>
        </div>`;
    return; // Return early if there are no products
  }

  for (const customer of revenuePerCustomerReport) {
    const slide = document.createElement("div");
    slide.classList.add("swiper-slide");
    const customerImage =
      customer.gender.toLowerCase() === "male"
        ? "../../img/Male.png"
        : "../../img/Female.png";
    slide.innerHTML = `
    <div class="card position-relative">
       <img src="${customerImage}" class="card-img-top" alt="${customer.firstName}" 
       onerror="this.onerror=null;this.src='../../shirtImg/no-photo.png';">
        <div class="card-body">
        <p class="card-title">${customer.firstName} ${customer.lastName}</p>
        <h4 class="card-title">Revenue: $${customer.totalSales}</h4>
      </div>
       <div class="card-footer">
          <h5 class="card-text my-2">Total Orders: ${customer.orderCount}</h5>
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

  const revenuePerCustomerSwiper = generateSlide(
    `.${containerInfo.swiperId}`,
    navigationSelectors
  );

  const customerNames = revenuePerCustomerReport.map(
    (customer) => customer.firstName + " " + customer.lastName
  );
  const customerRevenues = revenuePerCustomerReport.map(
    (customer) => customer.totalSales
  );

  const chartType = "line";
  const chartInfo = {
    canvasElement: revenuePerCustomerCanvas,
    chartType,
    heading: "Revenue",
    reportLabels: customerNames,
    colorsArray: generateHSLColor(customerNames.length),
    report: customerRevenues,
    pluginText: [`Revenue Per Customer`],
  };

  // Generate Chart and store the instance
  const revenuePerCustomerChart = generateChart(chartInfo);
}

// ! -------------------------Helpers---------------------------------

async function handleDateSubmit(
  containerDiv,
  monthlySalesChart,
  eachOrderSwiper
) {
  try {
    // Get the start and end dates from the input fields
    const startDateInput = containerDiv.querySelector("#startSaleDate");
    const endDateInput = containerDiv.querySelector("#endSaleDate");

    const startDateValue = startDateInput.value;
    const endDateValue = endDateInput.value;

    if (!startDateValue || !endDateValue) {
      errorPopUp.showErrorModal("Enter values in the date fields");
      return { chart: monthlySalesChart, swiper: eachOrderSwiper };
    }

    if (startDateValue >= endDateValue) {
      errorPopUp.showErrorModal(
        "Please select a start date that is earlier than the end date."
      );
      return { chart: monthlySalesChart, swiper: eachOrderSwiper };
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
      url: urlObject.customSalesReport,
      data: requestBody,
    };

    // Fetch the new report data
    const response = await fetchHandler.sendRequest(requestInformation);

    // Get the new report data
    const newReport = response.data.customSaleReport;

    // Update the content in the container and get updated instances
    const updatedInstances = updateTotalRevenue(
      containerDiv,
      newReport,
      monthlySalesChart,
      eachOrderSwiper
    );

    if (updatedInstances) {
      startDateInput.value = "";
      endDateInput.value = "";
    }

    // Return the updated instances
    return updatedInstances;
  } catch (error) {
    errorPopUp.showErrorModal(error.message);
    return { chart: monthlySalesChart, swiper: eachOrderSwiper };
  }
}

function updateTotalRevenue(
  containerDiv,
  newReport,
  monthlySalesChart,
  eachOrderSwiper
) {
  const monthlySales = newReport.monthlySales;
  const ordersInTheSales = newReport.orders.sort(
    (a, b) => b.grandTotal - a.grandTotal
  );
  const totalRevenue = newReport.totalRevenue;
  const startMonth = newReport.startMonth.trim();
  const endMonth = newReport.endMonth.trim();

  const headerElement = containerDiv.querySelector(".header h2");
  headerElement.innerHTML = `Revenue From <br>${startMonth} - ${endMonth}`;
  headerElement.setAttribute("tabindex", "0");
  headerElement.focus();

  const footerElement = containerDiv.querySelector(".footer.my-5 h2");
  footerElement.textContent = "Total Revenue: $" + totalRevenue;

  // Update the swiper slides
  const swiperWrapper = containerDiv.querySelector(
    `.swiper-wrapper.each-order-swiper-wrapper`
  );

  swiperWrapper.innerHTML = "";

  if (ordersInTheSales.length === 0) {
    swiperWrapper.innerHTML = `
      <div class="col-md-12 text-center my-5">
        <h2>No sales occurred during this date range</h2>
      </div>`;

    if (monthlySalesChart) {
      monthlySalesChart.destroy();
    }
    return { chart: null, swiper: null };
  }

  for (const order of ordersInTheSales) {
    const slide = document.createElement("div");
    slide.classList.add("swiper-slide");

    slide.innerHTML = `
    <div class="card position-relative">
       <img src="../../img/Order.png" class="card-img-top" alt="order image" 
       onerror="this.onerror=null;this.src='../../shirtImg/no-photo.png';">
        <div class="card-body">
        <h6 class="card-title">${order.orderID}</h6>
        <h4 class="card-text">Revenue: $${order.grandTotal}</h4>
        
      </div>
        <div class="card-footer">
          <p class="card-text">${order.orderDate}</p>
        </div>
      </div>
      `;

    // Append each slide to swiperWrapper
    swiperWrapper.appendChild(slide);
  }

  // Reinitialize Swiper
  const swiperContainerClass = `.each-order-container`;
  const navigationSelectors = {
    pagination: `.swiper-pagination.each-order-pagination`,
    nextEl: `.custom-swiper-button-next.each-order-next`,
    prevEl: `.custom-swiper-button-prev.each-order-prev`,
  };

  // Destroy the old swiper instance if it exists
  if (eachOrderSwiper) {
    eachOrderSwiper.destroy(true, true);
  }

  eachOrderSwiper = generateSlide(swiperContainerClass, navigationSelectors);

  // Update the chart
  const monthlySalesCanvas = containerDiv.querySelector(
    `#monthly-sales-canvas`
  );

  if (monthlySalesChart) {
    monthlySalesChart.destroy();
  }

  const allMonths = monthlySales.map((months) => months.month);
  const allRevenues = monthlySales.map((months) => months.revenue);

  // Setting the chart type
  if (allMonths.length !== 0) {
    let chartType = "";
    if (allMonths.length >= 80) {
      chartType = "line";
    } else {
      chartType = "bar";
    }

    const chartInfo = {
      canvasElement: monthlySalesCanvas,
      chartType,
      heading: "Revenue",
      reportLabels: allMonths,
      colorsArray: generateHSLColor(allMonths.length),
      report: allRevenues,
      pluginText: [
        `Each Month's Revenue From: `,
        `${startMonth} - ${endMonth}`,
      ],
    };

    monthlySalesChart = generateChart(chartInfo);

    return { chart: monthlySalesChart, swiper: eachOrderSwiper };
  } else {
    // If there is no data, destroy the chart if it exists
    if (monthlySalesChart) {
      monthlySalesChart.destroy();
    }
    return { chart: null, swiper: eachOrderSwiper };
  }
}

function generateContainer(containerInfo) {
  // Date input HTML
  const dateHTML = containerInfo.includeDateInputs
    ? `
      <div class="row justify-content-center align-items-center date-container mb-4">
        <h5 class="text-center mb-3" style="color: #3648be;">Change Report Range</h5>
        <div class="col-auto">
          <label for="startDate" class="visually-hidden">Start Date</label>
          <input type="date" class="form-control" id="startSaleDate" name="startSaleDate">
        </div>
        <div class="col-auto">
        <h1>-</h1>
        </div>
        <div class="col-auto">
          <label for="endDate" class="visually-hidden">End Date</label>
          <input type="date" class="form-control" id="endSaleDate" name="endSaleDate">
        </div>
        <div class="col-auto">
          <button type="submit" id="date-submit-button">Submit</button>
        </div>
      </div>
    `
    : "";

  const canvasHTML = containerInfo.additionalCanvasId
    ? `
     <canvas class="report-chart ms-5" id="${containerInfo.additionalCanvasId}" width="400"></canvas>
    `
    : "";

  return `
      <div class="row d-flex justify-content-center" id="${containerInfo.section}">
        <div class="col-md-12 text-center header tabindex="-1"">
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
          <div class="col-md-6 chart-container d-flex justify-content-center">
            <canvas class="report-chart me-5" id="${containerInfo.canvasId}" width="400"></canvas>
            ${canvasHTML}
            </div>
          <div class="col-md-12 text-center footer my-5">
            <h2>${containerInfo.footer}</h2>
          </div>
        ${dateHTML}
      </div>
  `;
}

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
                <a class="nav-link nav-bar-link" aria-current="page" href="#sectionE">This Year Revenue</a>
              </li>
              <li class="nav-item nav-bar-link">
                <a class="nav-link nav-bar-link" href="#sectionF">Customer Revenue</a>
              </li>
              <li class="nav-item nav-bar-link">
                <a class="nav-link nav-bar-link" href="#sectionG">Product Revenue</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
  `;
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
          pointRadius: 8, // Set point size here
          pointHoverRadius: 16, // Optional: make point larger on hover
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
            size: 20,
            position: "average",
            mode: "index",
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

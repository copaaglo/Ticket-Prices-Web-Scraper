import React from "react";
import ApexCharts from "react-apexcharts";

const ProductDetailsPage = ({ product }) => {
  // Safe defaults so the component doesn't crash when product is empty
  const {
    name = "Unknown",
    url: productUrl = "",
    img = "",
    source = "",
    created_at: createdAt = "",
    priceHistory = [],
  } = product || {};

  function formatDate(date) {
    const aaaa = date.getFullYear();
    let gg = date.getDate();
    let mm = date.getMonth() + 1;

    if (gg < 10) gg = "0" + gg;
    if (mm < 10) mm = "0" + mm;

    const cur_day = aaaa + "-" + mm + "-" + gg;

    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();

    if (hours < 10) hours = "0" + hours;
    if (minutes < 10) minutes = "0" + minutes;
    if (seconds < 10) seconds = "0" + seconds;

    return cur_day + " " + hours + ":" + minutes + ":" + seconds;
  }

  // If no history, show a clean message instead of crashing
  if (!Array.isArray(priceHistory) || priceHistory.length === 0) {
    return (
      <div>
        <h2>{name}</h2>
        {img && <img src={img} alt="Product" />}
        {productUrl && (
          <p>
            URL:{" "}
            <a href={productUrl} target="_blank" rel="noreferrer">
              View product
            </a>
          </p>
        )}
        {source && (
          <p>
            Source:{" "}
            <a target="_blank" rel="noreferrer" href={source}>
              {source}
            </a>
          </p>
        )}
        <p>Newest Price At: {createdAt}</p>
        <h3>No price history available yet.</h3>
      </div>
    );
  }

  const dates = priceHistory
    .map((history) => formatDate(new Date(history.date)))
    .reverse();

  const prices = priceHistory.map((history) => history.price).reverse();

  const chartData = {
    options: {
      chart: { id: "price-chart" },
      xaxis: { categories: dates },
    },
    series: [
      {
        name: "Price",
        data: prices,
      },
    ],
  };

  return (
    <div>
      <h2>{name}</h2>

      {img && <img src={img} alt="Product" />}

      {productUrl && (
        <p>
          URL:{" "}
          <a href={productUrl} target="_blank" rel="noreferrer">
            View product
          </a>
        </p>
      )}

      {source && (
        <p>
          Source:{" "}
          <a target="_blank" rel="noreferrer" href={source}>
            {source}
          </a>
        </p>
      )}

      <p>Newest Price At: {createdAt}</p>

      <h2>Price History</h2>
      <h3>Current Price: ${prices[prices.length - 1]}</h3>

      <ApexCharts
        options={chartData.options}
        series={chartData.series}
        type="line"
        height={300}
      />
    </div>
  );
};

export default ProductDetailsPage;


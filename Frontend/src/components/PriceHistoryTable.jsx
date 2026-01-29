import React, { useState } from "react";
import ModalComponent from "./Modal";
import ProductDetailsPage from "./ProductDetailsPage";

function PriceHistoryTable({ priceHistory = [], onClose }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  const openModal = (product) => {
    setCurrentProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const getPriceData = (product) => {
    const history = product?.priceHistory;
    if (!Array.isArray(history) || history.length === 0) return null;
    return history[0];
  };

  const getPriceChange = (product) => {
    const history = product?.priceHistory;
    if (!Array.isArray(history) || history.length < 2) return 0;

    const currentPrice = history[0].price;
    const lastPrice = history[1].price;

    if (!lastPrice || lastPrice === 0) return 0;

    const change = 100 - (currentPrice / lastPrice) * 100;
    return Math.round(change * 100) / 100;
  };

  return (
    <div>
      <h2>Price History</h2>

      <table>
        <thead>
          <tr className="row">
            <th>Updated At</th>
            <th>Name</th>
            <th>Price</th>
            <th>Price Change</th>
          </tr>
        </thead>

        <tbody>
          {priceHistory.map((product) => {
            const priceData = getPriceData(product);
            const change = getPriceChange(product);

            // If no price data, show safe row instead of crashing
            if (!priceData) {
              return (
                <tr key={product.url || product.name} className="row">
                  <td>N/A</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => openModal(product)}
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        color: "blue",
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                    >
                      {product.name}
                    </button>
                  </td>
                  <td>N/A</td>
                  <td>N/A</td>
                </tr>
              );
            }

            return (
              <tr key={product.url} className="row">
                <td>{priceData.date}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => openModal(product)}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      color: "blue",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    {product.name}
                  </button>
                </td>
                <td>${priceData.price}</td>
                <td style={change > 0 ? { color: "red" } : { color: "green" }}>
                  {change >= 0 && "+"}
                  {change}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <button onClick={onClose}>Close</button>

      <ModalComponent
        isOpen={isModalOpen}
        closeModal={closeModal}
        content={<ProductDetailsPage product={currentProduct} />}
      />
    </div>
  );
}

export default PriceHistoryTable;

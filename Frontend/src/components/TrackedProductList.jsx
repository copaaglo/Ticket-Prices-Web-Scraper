import React, { useState, useEffect } from "react";
import axios from "axios";

const TrackedProductList = () => {
  const [trackedProducts, setTrackedProducts] = useState([]);
  const [newTrackedProduct, setNewTrackedProduct] = useState("");

  useEffect(() => {
    fetchTrackedProducts();
  }, []);

  const fetchTrackedProducts = async () => {
    try {
      const response = await axios.get("/api/tracked");
      if (response.data.ok) {
        setTrackedProducts(response.data.tracked || []);
      }
    } catch (error) {
      console.error("Error fetching tracked products:", error);
    }
  };

  const handleNewTrackedProductChange = (event) => {
    setNewTrackedProduct(event.target.value);
  };

  const handleAddTrackedProduct = async () => {
    try {
      const response = await axios.post("/api/tracked", {
        name: newTrackedProduct,
      });
      if (response.data.ok) {
        setTrackedProducts((prevProducts) => [
          ...prevProducts,
          response.data.tracked,
        ]);
        setNewTrackedProduct("");
      }
    } catch (error) {
      console.error("Error adding tracked product:", error);
    }
  };

  const handleDeleteTrackedProduct = async (productId) => {
    try {
      await axios.delete(`/api/tracked/${productId}`);
      setTrackedProducts((prevProducts) =>
        prevProducts.filter((product) => product.id !== productId)
      );
    } catch (error) {
      console.error("Error deleting tracked product:", error);
    }
  };

  return (
    <div>
      <h2>Tracked Products</h2>
      <ul>
        {trackedProducts.map((product) => (
          <li key={product.id}>
            {product.name}{" "}
            <button onClick={() => handleDeleteTrackedProduct(product.id)}>
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div>
        <h3>Add Tracked Product</h3>
        <input
          type="text"
          value={newTrackedProduct}
          onChange={handleNewTrackedProductChange}
        />
        <button onClick={handleAddTrackedProduct}>Add</button>
      </div>
    </div>
  );
};

export default TrackedProductList;

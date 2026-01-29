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
    if (!newTrackedProduct.trim()) return;
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

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleAddTrackedProduct();
    }
  };

  return (
    <div className="tracked-section">
      <h2>Tracked Artists</h2>
      
      <div className="tracked-form">
        <input
          type="text"
          className="tracked-input"
          value={newTrackedProduct}
          onChange={handleNewTrackedProductChange}
          onKeyPress={handleKeyPress}
          placeholder="Add an artist to track..."
        />
        <button className="add-button" onClick={handleAddTrackedProduct}>
          Add
        </button>
      </div>
      
      {trackedProducts.length > 0 ? (
        <div className="tracked-list">
          {trackedProducts.map((product) => (
            <div key={product.id} className="tracked-item">
              <span>{product.name}</span>
              <button 
                className="delete-button"
                onClick={() => handleDeleteTrackedProduct(product.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>
          No artists tracked yet. Add one above to get started.
        </p>
      )}
    </div>
  );
};

export default TrackedProductList;

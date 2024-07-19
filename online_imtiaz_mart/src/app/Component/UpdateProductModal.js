"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const UpdateProductModal = ({ isOpen, closeModal, product }) => {
  const [isModalOpen, setIsModalOpen] = useState(isOpen);
  const [productName, setProductName] = useState(product.name);
  const [productDescription, setProductDescription] = useState(product.description);
  const [price, setPrice] = useState(product.price);
  const [quantity, setQuantity] = useState(product.quantity);
  const [image, setImage] = useState(product.url);
  const [error, setError] = useState(""); // Added error state

  const router = useRouter();

  useEffect(() => {
    setIsModalOpen(isOpen);
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    try {
      const formData = new FormData();
      formData.append("name", productName);
      formData.append("description", productDescription);
      formData.append("price", parseFloat(price));
      formData.append("quantity", parseInt(quantity));
      if (image) formData.append("file", image);
      const token = localStorage.getItem("token");


      const response = await axios.put(`http://localhost:8000/products_update/${product.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`, // Attach token to headers
        },
      });

      if (response.status === 200) {
        alert("Product updated successfully!");
        setIsModalOpen(false);
      } else {
        alert("Unauthorized: You do not have permission to update this product."); 
      }
    } catch (error) {
      if (error.response ) {
        alert("Error updating product.");
      } 
    }
    router.refresh();
  };

  return (
    <>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Update Product</h2>
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-4 p-2 bg-red-100 text-red-700 border border-red-300 rounded">
                  {error}
                </div>
              )}
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  className="border border-gray-300 p-2 rounded w-full"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">
                  Product Description
                </label>
                <textarea
                  className="border border-gray-300 p-2 rounded w-full"
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  rows={3}
                  cols={6}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">
                  Price
                </label>
                <input
                  type="number"
                  className="border border-gray-300 p-2 rounded w-full"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  className="border border-gray-300 p-2 rounded w-full"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2">
                  Image
                </label>
                <input
                  type="file"
                  className="border border-gray-300 p-2 rounded w-full"
                  onChange={(e) => setImage(e.target.files[0])}
                  required
                />
              </div>
              <div className="flex justify-center">
                <button
                  type="button"
                  className="mr-4 py-2 px-4 rounded bg-gray-500 text-white"
                  onClick={closeModal}
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 rounded bg-teal-500 text-white"
                >
                  Update Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default UpdateProductModal;

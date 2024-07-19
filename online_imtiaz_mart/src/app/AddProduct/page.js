"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const AddProductModal = () => {
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      alert("Please upload an image.");
      return;
    }

    const formData = new FormData();
    formData.append("name", productName);
    formData.append("description", productDescription);
    formData.append("price", parseFloat(price));
    formData.append("quantity", parseInt(quantity));
    formData.append("file", image);

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://127.0.0.1:8000/products_create/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`, // Attach token to headers
          },
        }
      );
      if (response.status === 200) {
        alert("Product added successfully!");
        router.push("/Products"); // Redirect to Products page
      } else {
        alert("Unexpected error occurred.");
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          alert("Unauthorized: You do not have permission to add this product.");
        } else if (error.response.status === 422) {
          alert("Failed to add product. Unprocessable Entity");
        }
      } else {
        alert("Network error.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inset-0 m-5 items-center justify-center bg-gray-800">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Add New Product</h2>
        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Product Name</label>
            <input
              type="text"
              className="border border-gray-300 p-2 rounded w-full"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Product Description</label>
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
            <label className="block text-gray-700 font-bold mb-2">Price</label>
            <input
              type="number"
              step="0.01" 
              className="border border-gray-300 p-2 rounded w-full"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Quantity</label>
            <input
              type="number"
              className="border border-gray-300 p-2 rounded w-full"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Image</label>
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
              onClick={() => router.push("/Products")} 
            >
              Close
            </button>
            <button
              type="submit"
              className="py-2 px-4 rounded bg-teal-500 text-white"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;

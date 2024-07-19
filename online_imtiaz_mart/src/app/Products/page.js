"use client";
import React, { useEffect, useState } from "react";
import ProductCart from "../Component/ProductCart";
import Link from "next/link";
import { useRouter } from "next/navigation";
import UpdateProductModal from "../Component/UpdateProductModal";
import axios from "axios";


const Page = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(""); // Optional: Use for additional error handling
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:8000/products/");
        setProducts(response.data);
      } catch (error) {
        alert("Error fetching products:", error);
        console.error("Error")
      }
    };
    fetchProducts();
  }, []);

  const openModal = (product) => {
    setSelectedProduct(product);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedProduct(null);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this item?"
    );
    if (!confirmDelete) {
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(`http://localhost:8000/products_delete/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Attach token to headers
          },
        }
      );
      setProducts(products.filter((product) => product.id !== id));
      if (response.status === 200 && token) {
        alert("Product Deleted successfully!"); // Success alert
        window.location.reload();
      } else {
        alert("Unauthorized: You do not have permission to add this product."); // 401 Unauthorized
      }
      router.refresh();

    } catch (error) {
      if (error.response ) {
       alert("Error deleting product");
      } 
    }
  };

  const handleUpdate = (product) => {
    openModal(product);
  };

  return (
    <div>
      <div>
        <h1 className="text-center items-center bg-black text-4xl text-white font-bold p-3">
          Products
        </h1>
        {error && (
          <div className="p-4 mb-4 bg-red-100 text-red-700 border border-red-300 rounded">
            {error}
          </div>
        )}
        <div className="flex flex-wrap justify-center">
          {products.map((product) => (
            <div
              key={product.id}
              className="m-4 p-4 max-w-xs border border-gray-300 rounded-lg shadow-lg"
            >
              <ProductCart Prod={product} />
              <div className="flex flex-wrap justify-center p-6">
                <button className="mt-4 py-2 px-4 rounded-lg font-bold text-white bg-teal-500 hover:text-black hover:bg-teal-400 hover:shadow-inner">
                  Quick View
                </button>
                <button
                  className="mt-4 py-2 px-4 rounded-lg font-bold text-white bg-teal-500 hover:text-black hover:bg-teal-400 hover:shadow-inner"
                  onClick={() => handleUpdate(product)}
                >
                  Update Product
                </button>
                <button
                  className="mt-4 py-2 px-4 rounded-lg font-bold text-white bg-teal-500 hover:text-black hover:bg-teal-400 hover:shadow-inner"
                  onClick={() => handleDelete(product.id)}
                >
                  Delete Product
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex text-center justify-center mb-4">
        <button className="mt-4 py-2 px-4 rounded-lg font-bold text-white bg-teal-500 hover:text-black hover:bg-teal-400 hover:shadow-inner">
          <Link href={"/AddProduct"}>Add Product</Link>
        </button>
      </div>
      {selectedProduct && (
        <UpdateProductModal
          isOpen={isOpen}
          closeModal={closeModal}
          product={selectedProduct}
        />
      )}
    </div>
  );
};

export default Page;

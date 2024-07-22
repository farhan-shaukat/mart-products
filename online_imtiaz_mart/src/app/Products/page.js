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
  const [token, setToken] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:8000/products/");
        setProducts(response.data);
      } catch (error) {
        alert("Error fetching products:", error);
        console.error("Error");
      }
    };
    fetchProducts();

    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
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
      const response = await axios.delete(
        `http://localhost:8000/products_delete/${id}`,
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
        alert(
          "Unauthorized: You do not have permission to delete this product."
        ); // 401 Unauthorized
      }
      router.refresh();
    } catch (error) {
      if (error.response) {
        alert("Error deleting product");
      }
    }
  };

  const handleUpdate = (product) => {
    openModal(product);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    router.push("/");
  };

  return (
    <div>
      <div>
        <div className="flex items-center bg-black text-white p-3">
          <div className="flex-grow text-center font-bold">
            <h1 className="text-4xl">Products</h1>
          </div>
          {token && (
            <button
              className="text-black bg-white rounded ml-auto p-2 text-center font-medium"
              type="button"
              onClick={handleLogout}
            >
              Log out
            </button>
          )}
          {!token && (
            <button
              className="text-black bg-white rounded ml-auto p-2 text-center font-medium"
              type="button"
            >
              <Link href={"/SignUpForm"}> Sign Up</Link>
            </button>
          )}
        </div>
        <div className="flex flex-wrap justify-center">
          {products.map((product) => (
            <div
              key={product.id}
              className="m-4 p-4 max-w-xs border border-gray-300 rounded-lg shadow-lg"
            >
              <ProductCart Prod={product} />
              {token && (
                <div className="flex flex-wrap justify-center p-6">
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
              )}
            </div>
          ))}
        </div>
      </div>
      {token && (
        <div className="flex text-center justify-center mb-4">
          <button className="mt-4 py-2 px-4 rounded-lg font-bold text-white bg-teal-500 hover:text-black hover:bg-teal-400 hover:shadow-inner">
            <Link href={"/AddProduct"}>Add Product</Link>
          </button>
        </div>
      )}
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

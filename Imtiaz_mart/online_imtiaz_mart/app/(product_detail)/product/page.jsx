"use client";
import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import UpdateProduct from "@/app/(product_detail)/updateProduct/page";

const Product = () => {
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart,setCart] = useState([])

  const fetchProduct = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/products/");
      if (response.status === 200) {
        setProducts(response.data);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error in Fetching Product");
    }
  };

  useEffect(() => {
    fetchProduct();
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

  const handleUpdate = (product) => {
    openModal(product);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this Product")) return;
    try {
      const response = await axios.delete(
        `http://localhost:8000/products_delete/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProducts(products.filter((product) => product.id !== id));
      if (response.status === 200) {
        toast.success("Product Deleted Succesfuly");
      } else {
        toast.error(
          "Unauthorized: You do not have permission to delete this product."
        );
      }
    } catch (error) {
      toast.error("Error in Deleting product");
      console.log(error);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="border border-gray-300 rounded-lg shadow-lg p-4"
          >
            <img
              className="mx-auto rounded-full h-24 w-24 mb-4"
              src={product.imgUrl}
              alt={product.name}
            />
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">{product.name}</h3>
              <p className="text-gray-600 mb-2">{product.description}</p>
              <p className="text-gray-800 font-semibold">Rs {product.price}</p>
              {!token ? (
                <Button variant="outline" className="mt-3">
                  Add to Cart
                </Button>
              ) : (
                <div className="m-3 space-y-5">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleUpdate(product)}
                  >
                    Update Product
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleDelete(product.id)}
                  >
                    Delete Product
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <ToastContainer />
      <div className="text-center">
        {token && (
          <Button variant="outline">
            <Link href="/addproduct">Add Product</Link>
          </Button>
        )}
      </div>

      {selectedProduct && (
        <UpdateProduct
          isOpen={isOpen}
          closeModal={closeModal}
          product={selectedProduct}
        />
      )}
    </div>
  );
};

export default Product;

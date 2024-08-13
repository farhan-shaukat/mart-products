"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import NavBar from "@/app/Components/Navbar";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";

const ProductModal = () => {
  const params = useParams();
  const id = params.id;
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const fetchProducts = async () => {
        try {
          const response = await axios.get("http://127.0.0.1:8000/products/");
          if (response.status === 200) {
            setProducts(response.data);
          }
        } catch (error) {}
      };
      fetchProducts();

      const storedCart = localStorage.getItem("cart");
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
    }
  }, []);

  const handleAddToCart = (product) => {
    if (typeof window !== "undefined") {
      setCart((prevCart) => {
        const existingProduct = prevCart.find((item) => item.id === product.id);
        const updatedCart = existingProduct
          ? prevCart.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          : [...prevCart, { ...product, quantity: 1 }];

        window.localStorage.setItem("cart", JSON.stringify(updatedCart));
        return updatedCart;
      });

      setProducts((prevProducts) =>
        prevProducts.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
      );

      toast.success("Item added to your cart");
    }
  };

  const TotalQuantity = () => {
    if (typeof window !== "undefined") {
      cart.reduce((acc, item) => acc + item.quantity, 0);
    }
  };

  const handleCartDelete = (quantityForDel, id) => {
    const cartItem = cart.find((cart) => cart.id === id);
    if (!cartItem) return;

    const updatedProducts = products.map((prod) =>
      prod.id === id
        ? { ...prod, quantity: prod.quantity + quantityForDel }
        : prod
    );

    const updatedCart = cart.filter((item) => item.id !== id);
    setCart(updatedCart);
    setProducts(updatedProducts);
    window.localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  return (
    <>
      <NavBar
        quantity={TotalQuantity}
        carts={cart}
        setCart={setCart}
        setProducts={setProducts}
        products={products}
        handleDelete={handleCartDelete}
      />

      <div className="text-center justify-center flex mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] overflow-y-auto h-screen">
          {products &&
            products
              .filter((prod) => prod.id == id)
              .map((product) => (
                <div
                  key={product.id}
                  className="flex flex-col items-center space-y-4"
                >
                  <Image
                    height={80}
                    width={60}
                    className="w-32 h-32 object-cover rounded-full mb-4 transition-transform duration-200 hover:scale-105"
                    src={product.imgUrl}
                    alt={product.name}
                  />
                  <h2 className="text-2xl font-bold mb-2">Product Details</h2>
                  <p className="text-lg">
                    <strong>Name:</strong> {product.name}
                  </p>
                  <p className="text-lg">
                    <strong>Description:</strong> {product.description}
                  </p>
                  <p className="text-lg">
                    <strong>Price:</strong> Rs {product.price}
                  </p>
                  <p className="text-lg">
                    <strong>Category:</strong> {product.category}
                  </p>
                  {product.quantity > 0 ? (
                    <div className="space-y-4">
                      <Button
                        variant="outline"
                        className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                        onClick={() => handleAddToCart(product)}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  ) : (
                    <p className="text-red-600 font-semibold">Out of Stock</p>
                  )}
                </div>
              ))}
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="text-sm sm:text-base md:text-lg"
      />
    </>
  );
};

export default ProductModal;

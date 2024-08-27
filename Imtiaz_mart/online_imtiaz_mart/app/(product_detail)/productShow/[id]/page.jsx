"use client";
import React, { useState, useEffect } from "react";
import { Button } from "../../../../components/ui/button";
import { useParams } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import NavBar from "../../../Components/Navbar";
import "react-toastify/dist/ReactToastify.css";

// Server Action to fetch products
async function fetchProducts() {
  const res = await fetch("http://127.0.0.1:8000/products/");
  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }
  return await res.json();
}

const ProductModal = () => {
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  // Fetch products server-side
  async function loadProducts() {
    try {
      const fetchedProducts = await fetchProducts();
      setProducts(fetchedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }

  loadProducts();

  // Retrieve cart from local storage
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  const handleAddToCart = async (product) => {
    setCart((prevCart) => {
      const existingProduct = prevCart.find((item) => item.id === product.id);
      const updatedCart = existingProduct
        ? prevCart.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [...prevCart, { ...product, quantity: 1 }];

      localStorage.setItem("cart", JSON.stringify(updatedCart));
      return updatedCart;
    });

    setProducts((prevProducts) =>
      prevProducts.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity - 1 } : item
      )
    );

    toast.success("Item added to your cart");
  };

  const totalQuantity = () => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  };

  const handleCartDelete = (quantityForDel, id) => {
    const cartItem = cart.find((item) => item.id === id);
    if (!cartItem) return;

    const updatedProducts = products.map((prod) =>
      prod.id === id
        ? { ...prod, quantity: prod.quantity + quantityForDel }
        : prod
    );

    const updatedCart = cart.filter((item) => item.id !== id);
    setCart(updatedCart);
    setProducts(updatedProducts);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const product = products.find((prod) => prod.id == id);

  return (
    <>
      <NavBar
        quantity={totalQuantity()}
        carts={cart}
        setCart={setCart}
        setProducts={setProducts}
        products={products}
        handleDelete={handleCartDelete}
      />
  
      <div className="text-center flex mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-4xl overflow-y-auto h-screen">
          {product ? (
            <div className="flex flex-col items-center space-y-4">
              <img
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
                <Button
                  variant="outline"
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                  onClick={() => handleAddToCart(product)}
                >
                  Add to Cart
                </Button>
              ) : (
                <p className="text-red-600 font-semibold">Out of Stock</p>
              )}
            </div>
          ) : (
            <p></p>
          )}
        </div>
      </div>
  
      <ToastContainer />
    </>
  );
  
};

export default ProductModal;

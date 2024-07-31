"use client";
import React, { useEffect, useState } from "react";
import ProductCart from "../Component/ProductCart";
import Link from "next/link";
import { useRouter } from "next/navigation";
import UpdateProductModal from "../Component/UpdateProductModal";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CartDetail from "../Component/CartDetail";
import OrderDetail from "../Component/OrderDetail";

const Page = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState(null);
  const [cart, setCart] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:8000/products/");
        setProducts(response.data);
      } catch (error) {
        toast.error("Error fetching products");
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
    const storedToken = window.localStorage.getItem("token");
    setToken(storedToken);

    const storedCart = window.localStorage.getItem("cart");
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
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
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const token = window.localStorage.getItem("token");
      const response = await axios.delete(
        `http://localhost:8000/products_delete/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProducts(products.filter((product) => product.id !== id));
      if (response.status === 200) {
        toast.success("Product deleted successfully!");
      } else {
        toast.error(
          "Unauthorized: You do not have permission to delete this product."
        );
      }
      router.refresh();
    } catch (error) {
      toast.error("Error deleting product");
      console.error("Error deleting product:", error);
    }
  };

  const handleUpdate = (product) => {
    openModal(product);
  };

  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      // Find if the product is already in the cart
      const existingProduct = prevCart.find((item) => item.id === product.id);

      // Update the cart based on whether the product exists or not
      const updatedCart = existingProduct
        ? prevCart.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [...prevCart, { ...product, quantity: 1 }];

      // Update local storage
      window.localStorage.setItem("cart", JSON.stringify(updatedCart));

      // Return the updated cart
      return updatedCart;
    });

    // Update the product quantities
    setProducts((prevProducts) =>
      prevProducts.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity - 1 } : item
      )
    );

    toast.success("Item added to your cart");
  };

  const getTotalQuantity = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCartDelete = (quantityFordel, id) => {
    // Find the cart item to delete
    const cartItem = cart.find((cart) => cart.id === id);
    if (!cartItem) return;

    // Find the product and restore its original quantity
    const updatedProducts = products.map((product) => {
      if (product.id === id) {
        return { ...product, quantity: product.quantity + quantityFordel };
      }
      return product;
    });

    // Update the cart items
    const updatedCart = cart.filter((item) => item.id !== id);
    setCart(updatedCart);
    setProducts(updatedProducts);
  };

  return (
    <div>
      <ToastContainer />
      <div>
        <div className="flex items-center bg-black text-white p-3">
          <div className="flex-grow text-center font-bold">
            <h1 className="text-4xl">Products</h1>
          </div>
          {token ? (
            <button
              className="text-white bg-red-600 rounded ml-auto p-2 text-center font-medium"
              type="button"
              onClick={() => {
                localStorage.removeItem("token");
                setToken(null);
                router.push("/");
              }}
            >
              Log out
            </button>
          ) : (
            <div className="flex items-center">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faCartShopping} className="text-xl" />
                <span
                  className="ml-2 text-lg cursor-pointer"
                  onClick={openModal}
                >
                  Shopping Cart -- {getTotalQuantity()}
                </span>
              </div>
              <button
                className="text-black bg-white rounded p-2 text-center font-medium ml-3"
                type="button"
              >
                <Link href="/SignUpForm">Sign Up</Link>
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-wrap justify-center">
          {products.map((product) => (
            <div
              key={product.id}
              className="m-4 p-4 max-w-xs border border-gray-300 rounded-lg shadow-lg"
            >
              <ProductCart Prod={product} />
              <div className="flex flex-wrap justify-center p-6">
                {!token ? (
                  <>
                    {product.quantity > 0 ? (
                      <button
                        className="mt-4 py-2 px-4 rounded-lg font-bold text-white bg-teal-500 hover:text-black hover:bg-teal-400 hover:shadow-inner"
                        onClick={() => handleAddToCart(product)}
                      >
                        Add to Cart
                      </button>
                    ) : (
                      <p className="mt-4 py-2 px-4 rounded-lg font-bold text-red-500">
                        Out of Stock
                      </p>
                    )}
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
        {token && (
          <div className="flex text-center justify-center mb-4">
            <button className="mt-4 py-2 px-4 rounded-lg font-bold text-white bg-teal-500 hover:text-black hover:bg-teal-400 hover:shadow-inner">
              <Link href="/AddProduct">Add Product</Link>
            </button>
          </div>
        )}
        {selectedProduct && token && (
          <UpdateProductModal
            isOpen={isOpen}
            closeModal={closeModal}
            product={selectedProduct}
          />
        )}
        {!token && (
          <CartDetail
            isOpen={isOpen}
            closeModal={closeModal}
            carts={cart}
            products={products}
            setProducts={setProducts}
            handleDelete={handleCartDelete}
            setCart={setCart}
          />
        )}

      </div>
    </div>
  );
};

export default Page;

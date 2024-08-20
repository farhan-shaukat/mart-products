"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button } from "../../../components/ui/button";
import NavBar from "../../Components/Navbar";
import { useRouter } from "next/navigation";


const Product = () => {
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState(null);
  const [cart, setCart] = useState([]);
  const [category, setCategory] = useState([]);
  const [searchProd, setSearchProd] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const fetchProduct = async () => {
        try {
          const response = await axios.get("http://127.0.0.1:8000/products/");
          if (response.status === 200) {
            setProducts(response.data);
          }
        } catch (error) {
          console.error(error);
          toast.error("Error fetching products");
        }
      };
      fetchProduct();

      const storedToken = localStorage.getItem("token");
      setToken(storedToken);

      const storedCart = localStorage.getItem("cart");
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const fetchCategory = async () => {
        try {
          const resposne = await axios.get(
            "http://127.0.0.1:8000/get_category"
          );
          if (resposne.status === 200) {
            setCategory(resposne.data);
          }
        } catch (error) {}
      };
      fetchCategory();
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const result = products.filter((prod) =>
        prod.name.toLowerCase().includes(searchProd.toLowerCase())
      );
      setFilteredProducts(result);
    }
  }, [searchProd, products]);

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

  const handleCartDelete = (quantityForDel, id) => {
    if (typeof window !== "undefined") {
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
    }
  };

  const handleViewProduct = (id) => {
    if (typeof window !== "undefined") {
      router.push(`/productShow/${id}`);
    }
  };

  const handleCategoryView = (name) => {
    if (typeof window !== "undefined") {
      router.push(`/prodCategory/${name}`);
    }
  };

  const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div>
      <NavBar
        quantity={totalQuantity}
        carts={cart}
        products={filteredProducts}
        setProducts={setProducts}
        handleDelete={handleCartDelete}
        setCart={setCart}
        searchProd={searchProd}
        setSearchProd={setSearchProd}
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 m-4 p-3">
        {category.map((cat) => (
          <div key={cat.id} className="flex flex-col items-center text-center">
            <img
              height={55}
              width={35}
              className="rounded-full h-20 w-20 mb-2 transition-transform duration-200 hover:scale-105"
              src={cat.imgUrl}
              alt={cat.name}
              onClick={() => handleCategoryView(cat.name)}
            />
            <h2 className="text-sm sm:text-base font-medium">{cat.name}</h2>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="border border-gray-300 rounded-lg shadow-lg p-4"
          >
            <img
              height={70}
              width={55}
              className="mx-auto mb-4 rounded-full h-20 w-20 transition-transform duration-200 hover:scale-105"
              src={product.imgUrl}
              alt={product.name}
            />
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">{product.name}</h3>
              <p className="text-gray-800 font-semibold"> Rs {product.price}</p>
              {token && (
                <p className="text-gray-800 font-semibold">
                  Product Quantity {product.quantity}
                </p>
              )}
              {product.quantity > 0 ? (
                <div className="m-5 space-y-5">
                  <Button
                    variant="outline"
                    className="m-3"
                    onClick={() => handleAddToCart(product)}
                  >
                    Add to Cart
                  </Button>
                </div>
              ) : (
                <p className="text-red-600 font-semibold">Out of Stock</p>
              )}
              <Button
                variant="outline"
                className="m-3"
                onClick={() => handleViewProduct(product.id)}
              >
                View Item
              </Button>
            </div>
          </div>
        ))}
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
    </div>
  );
};

export default Product;

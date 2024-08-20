"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import NavBar from "../../../Components/Navbar";
import axios from "axios";
import { Button } from "../../../../components/ui/button";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CategoryProduct = () => {
  const params = useParams();
  const router = useRouter();
  const category = decodeURIComponent(params.name);
  const [products, setProducts] = useState([]);
  const [searchProd, setSearchProd] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/products/");
        if (response.status === 200) {
          setProducts(response.data);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchProduct();

    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  useEffect(() => {
    const result = products.filter((prod) =>
      prod.name.toLowerCase().includes(searchProd.toLowerCase())
    );
    setFilteredProducts(result);
  }, [searchProd, products]);

  const handleViewProduct = (id) => {
    router.push(`/productShow/${id}`);
  };

  const handleAddToCart = (product) => {
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
        item.id === product.id
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );

    toast.success("Item added to your cart");
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
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const totalQuantity = () => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  };

  return (
    <>
      <NavBar
        quantity={totalQuantity()}
        carts={cart}
        products={filteredProducts}
        setProducts={setProducts}
        handleDelete={handleCartDelete}
        setCart={setCart}
        setSearchProd={setSearchProd}
        searchProd={searchProd}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {filteredProducts
          .filter((prod) => prod.category === category)
          .map((product) => (
            <div
              key={product.id}
              className="border border-gray-300 rounded-lg shadow-lg p-4"
            >
              <img
                height={80}
                width={60}
                src={product.imgUrl}
                alt={product.name}
                className="mx-auto rounded-full h-24 w-24 mb-4"
              />
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                <p className="text-gray-800 font-semibold">
                  Rs {product.price}
                </p>
                {product.quantity > 0 ? (
                  <Button
                    variant="outline"
                    className="m-3"
                    onClick={() => handleAddToCart(product)}
                  >
                    Add to Cart
                  </Button>
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
    </>
  );
};

export default CategoryProduct;

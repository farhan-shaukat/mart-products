"use client";
import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, useForm } from "react-hook-form";
import { z } from "zod";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import NavBar from "@/app/Components/Navbar";
import OrderDetail from "@/app/Components/OrderDetail";

// Define the form schema using Zod
const formSchema = z.object({
  username: z.string().min(1, {
    message: "Username must be at least 1 characters.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

const Page = () => {
  // Initialize the form with react-hook-form
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const [products, setProducts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:8000/products/");
        setProducts(response.data);
      } catch (error) {}
    };
    fetchProducts();
  }, []);

  const order = cartItems.map((item) => ({
    productName: item.name,
    productQuantity: item.quantity,
    productPrice: item.price,
  }));

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  useEffect(() => {
    const cartJSON = localStorage.getItem("cart");
    if (cartJSON) {
      const items = JSON.parse(cartJSON);
      setCartItems(items);
    }
  }, []);

  const ProductQuantityUpdate = async () => {
    try {
      const access_token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${access_token}`,
      };
      for (const item of cartItems) {
        const product = products.find((p) => p.id === item.id);
        if (product) {
          const updatedQuantity = product.quantity - item.quantity;
          if (updatedQuantity < 0) {
            toast.error(`Not enough stock for ${product.name}`);
            return;
          }
          const formData = new FormData();
          formData.append("quantity", updatedQuantity.toString());
          await axios.put(
            `http://127.0.0.1:8000/products_update_quantity/${item.id}`,
            formData,
            { headers }
          );
        } else {
          toast.error(`Product with ID ${item.id} not found`);
        }
      }
      localStorage.removeItem("cart");
      router.push("/dashboard")
      toast.success("Product quantities updated successfully");
    } catch (error) {
      toast.error("Error updating product quantities");
    }
  };

  const placeOrder = async (values) => {
          try {
            const latestUserResponse = await axios.get(
              `http://127.0.0.1:8002/get_latest_name/`,
              {
                params: { username: values.username },
              }
            );
            if (latestUserResponse.status === 200) {
              // Place order
              const access_token = localStorage.getItem("token")
              const orderResponse = await axios.post(
                "http://127.0.0.1:8003/Order_create/",
                { products: order, userId: localStorage.getItem("id")},
                {
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${access_token}`,
                  },
                }
              );

              if (orderResponse.status === 200) {
                toast.success("Order placed successfully");
                await ProductQuantityUpdate();
              } else {
                toast.error(
                  `Order failed with status code: ${orderResponse.status}`
                );
              }
            }
          } catch (error) {
            console.error(
              "Error placing order:",
              error.response?.data || error.message
            );
            toast.error("Error placing order");
          }
        }

  // Define the submit handler
  const onSubmit = async (values) => {
    try {
      if (order.length > 0) {
        openModal();
      }
      if (!isOpen) {
        // Make the POST request to your API
        const response = await axios.post(
          "http://127.0.0.1:8001/user_token",
          values,
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );
        if (response.status === 200) {
          const { access_token } = response.data;
          localStorage.setItem("token", access_token);
          // Fetch the latest user data
          const latestUserResponse = await axios.get(
            `http://127.0.0.1:8002/get_latest_name/`,
            {
              params: { username: values.username },
            }
          );

          if (order.length > 0) {
            await placeOrder(values);
          }
          if (latestUserResponse.data.role === "Admin") {
            localStorage.setItem("role", latestUserResponse.data.role);
            toast.success("Login successful.");
            router.push("/dashboard");
          } else {
            localStorage.setItem("id", latestUserResponse.data.id);
            toast.success("Login successful.");
          }
        } else if (response.status === 400) {
          toast.error(
            "Invalid credentials. Please check your username and password."
          );
        } else if (response.status === 401) {
          toast.error("Please check your username and password.");
        } else {
          toast.error("Unexpected error occurred.");
        }
      }
    } catch (error) {
      // Handle error response
      toast.error(
        "Invalid credentials. Please check your username and password."
      );
      console.log(error);
    }
  };

  const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const handleCartDelete = (quantityForDel, id) => {
    const cart = cartItems.find((cart) => cart.id === id);
    if (!cart) return;

    const updatedProducts = products.map((prod) =>
      prod.id === id
        ? { ...prod, quantity: prod.quantity + quantityForDel }
        : prod
    );

    const updatedCart = cartItems.filter((item) => item.id !== id);
    setCartItems(updatedCart);
    setProducts(updatedProducts);
    window.localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  return (
    <>
      <NavBar
        quantity={totalQuantity}
        setCart={setCartItems}
        carts={cartItems}
        products={products}
        setProducts={setProducts}
        handleDelete={handleCartDelete}
      />
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">
            Login
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <input
                id="username"
                {...register("username")}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
              />
              {errors.username && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.username.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                {...register("password")}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
              />
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Login
            </button>
          </form>
        </div>
      </div>
      <ToastContainer />
      {isOpen && (
        <OrderDetail isOpen={isOpen} closeModal={closeModal} prod={products} />
      )}
    </>
  );
};

export default Page;

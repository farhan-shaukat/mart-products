"use client";
import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import NavBar from "../../Components/Navbar";
import OrderDetail from "../../Components/OrderDetail";

// Define the form schema using Zod
const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
  phoneNumber: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits." }),
  address: z.string().min(1, { message: "Address is required." }),
  gender: z.enum(["Male", "Female", "Other"], {
    message: "Select a valid gender.",
  }),
  img: z.any(), // Use any for the image field
});

const Page = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phoneNumber: "",
      address: "",
      gender: "",
      img: null,
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
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

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

  const order = () => {
    return cartItems.map((item) => ({
      productName: item.name,
      productQuantity: item.quantity,
      productPrice: item.price,
    }));
  };

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

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
      toast.success("Product quantities updated successfully");
      localStorage.removeItem("cart");
      localStorage.removeItem("token");
      router.push("/");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error updating product quantities");
    }
  };

  const placeOrder = async (values) => {
    try {
      // User login to get the token
      const login = await axios.post(
        "http://127.0.0.1:8001/user_token",
        new URLSearchParams({
          username: values.name,
          password: values.password,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      if (login.status === 200) {
        const { access_token } = login.data;
        localStorage.setItem("token", access_token);

        try {
          const latestUserResponse = await axios.get(
            `http://127.0.0.1:8002/get_latest_name/`,
            {
              params: { username: values.name },
            }
          );
          if (latestUserResponse.status === 200) {
            // Place order
            const orderResponse = await axios.post(
              "http://127.0.0.1:8003/Order_create/",
              { products: order(), userId: latestUserResponse.data.id },
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
    } catch (error) {
      console.error(
        "Error fetching user details or logging in:",
        error.response?.data || error.message
      );
    }
  };

  const onSubmit = async (data) => {
    try {
      if (cartItems.length > 0) {
        openModal();
      }

      if (data.img && data.img.length !== 1) {
        toast.error("Please upload exactly one image.");
        return;
      }
      if (!isOpen) {
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("email", data.email);
        formData.append("password", data.password);
        formData.append("PhoneNumber", data.phoneNumber);
        formData.append("Address", data.address);
        formData.append("Gender", data.gender);
        if (data.img && data.img[0]) formData.append("file", data.img[0]);

        const response = await axios.post(
          "http://127.0.0.1:8002/user_register/",
          formData
        );

        if (response.status === 200) {
          toast.success("Registration successful!");

          if (order().length > 0) {
            await placeOrder(data);
          }
          router.push("/");
        } else if (response.status === 400) {
          toast.error(
            "Invalid credentials. User already exists. Please check your username and password."
          );
        } else if (response.status === 401) {
          toast.error("Please check your username and password.");
        } else {
          toast.error("Unexpected error occurred.");
        }
      }
    } catch (error) {
      toast.error("Registration failed. Please try again.");
      console.log(error);
    }
  };

  const GotoLogin = async () => {
    router.push("/login");
  };

  return (
    <>
      <NavBar
        quantity={totalQuantity}
        carts={cartItems}
        setCart={setCartItems}
        products={products}
        setProducts={setProducts}
        handleDelete={handleCartDelete}
      />
      <div className="flex items-center justify-center min-h-screen bg-gray-100 pt-3">
        <div className="bg-white p-8 rounded-lg shadow-md w-[90%] max-w-md">
          <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">
            Registration
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Form fields */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                id="name"
                {...register("name")}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.email.message}
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
            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number
              </label>
              <input
                id="phoneNumber"
                {...register("phoneNumber")}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
              />
              {errors.phoneNumber && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700"
              >
                Address
              </label>
              <input
                id="address"
                {...register("address")}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
              />
              {errors.address && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.address.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="gender"
                className="block text-sm font-medium text-gray-700"
              >
                Gender
              </label>
              <select
                id="gender"
                {...register("gender")}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.gender.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="img"
                className="block text-sm font-medium text-gray-700"
              >
                Upload Image
              </label>
              <input
                id="img"
                type="file"
                {...register("img")}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
              />
              {errors.img && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.img.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
            >
              Register
            </button>
          </form>
          <p className="mt-4 w-full px-4 py-2 bg-gray-600 text-white rounded-md shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50">
            If already Register then go to <u onClick={GotoLogin}>Login Page</u>
          </p>
        </div>
      </div>
      <OrderDetail isOpen={isOpen} closeModal={closeModal} prod={products} />
      <ToastContainer />
    </>
  );
};

export default Page;

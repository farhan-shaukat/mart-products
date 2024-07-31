"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import OrderDetail from "@/app/Component/OrderDetail";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";

const Page = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [phNo, setPhNo] = useState("");
  const [pic, setPic] = useState(null);
  const [gender, setGender] = useState("");
  const [products, setProducts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const router = useRouter();

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
  }, []);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => password.length >= 8;
  const validateFile = (file) =>
    file && file.size <= 2 * 1024 * 1024 && file.type.startsWith("image/");

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  useEffect(() => {
    const cartJSON = localStorage.getItem("cart");
    if (cartJSON) {
      const items = JSON.parse(cartJSON);
      setCartItems(items);
    }
  }, []);

  const order = cartItems.map((item) => ({
    productName: item.name,
    productQuantity: item.quantity,
    productPrice: item.price,
  }));

  const ProductQunatutyUpdate = async () => {
    try {
      const access_token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${access_token}`,
      };
      // Iterate through cart items and update product quantities
      for (const item of cartItems) {
        // Find the product based on the item's id
        const product = products.find((p) => p.id === item.id);
        if (product) {
          // Calculate the new quantity
          const updatedQuantity = product.quantity - item.quantity;
          // Ensure that updated quantity is not negative
          if (updatedQuantity < 0) {
            toast.error(`Not enough stock for ${product.name}`);
            return;
          }
          // Prepare the form data to update the product
          const formData = new FormData();
          formData.append("quantity", parseInt(updatedQuantity).toString());
          // Update the product quantity on the server using PUT
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
      router.push("/UserDashboard");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error updating product quantities");
    }
  };

  const placeOrder = async () => {
    try {
      // Fetch user details
      const response = await axios.get("http://127.0.0.1:8002/get_user/");
      const userDetail = response.data;

      const userData = new URLSearchParams();
      userData.append("username", userDetail.name);
      userData.append("password", userDetail.password);

      if (response.status === 200) {
        //  User login to get the token
        const login = await axios.post(
          "http://127.0.0.1:8001/user_token",
          userData,
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );
        console.log(login.status);
        console.log(login);

        if (login.status === 200) {
          const { access_token } = login.data;
          console.log(access_token);
          localStorage.setItem("token", access_token);

          try {
            // Place order
            console.log("Order data:", order);
            const orderResponse = await axios.post(
              "http://127.0.0.1:8003/Order_create/",
              order,
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${access_token}`,
                },
              }
            );
            
            if (orderResponse.status === 200) {
              toast.success("Order placed successfully");
              await ProductQunatutyUpdate();
            } else {
              toast.error(
                `Order failed with status code: ${orderResponse.status}`
              );
            }
          } catch (error) {
            console.error(
              "Error placing order:",
              error.response?.data || error.message
            );
            toast.error("Error placing order");
          }
        }
      }
    } catch (error) {
      console.error(
        "Error fetching user details or logging in:",
        error.response?.data || error.message
      );
      toast.error("Error fetching user details or logging in");
    }
  };

  const submitForm = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !gender || !phNo || !address) {
      toast.error("Please fill out all required fields.");
      return;
    }

    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!validatePassword(password)) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    if (!pic || !validateFile(pic)) {
      toast.error("Please upload a valid image file (max 2MB).");
      return;
    }

    try {
      openModal();
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("Gender", gender);
      formData.append("Address", address);
      formData.append("PhoneNumber", phNo);
      if (pic) formData.append("file", pic);

      const response = await axios.post(
        "http://127.0.0.1:8002/user_register/",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status === 200) {
        toast.success("Registration successful!");
        setName("");
        setEmail("");
        setPassword("");
        setAddress("");
        setPhNo("");
        setPic(null);
        setGender("");
        await placeOrder(order);
      } else if (response.status === 400) {
        toast.error(
          "Invalid credentials. Please check your username and password."
        );
      } else if (response.status === 401) {
        toast.error("Please check your username and password.");
      } else {
        toast.error("Unexpected error occurred.");
      }
    } catch (error) {
      toast.error("Error in Submission");
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800">
      <form
        onSubmit={submitForm}
        className="flex flex-col justify-center items-center m-3 bg-gray-900 p-8 gap-4 rounded-lg shadow-lg"
      >
        <h1 className="flex justify-center items-center font-bold text-white text-3xl">
          Registration Form
        </h1>

        {/* Input fields */}
        <InputField
          label="Enter Your Name"
          value={name}
          onChange={setName}
          placeholder="ABC"
        />
        <InputField
          label="Enter Your Email"
          value={email}
          onChange={setEmail}
          placeholder="ABC@gmail.com"
          type="email"
        />
        <InputField
          label="Enter Your Password"
          value={password}
          onChange={setPassword}
          placeholder="Password Contain 8 letters"
          type="password"
        />
        <InputField
          label="Enter Your Phone Number"
          value={phNo}
          onChange={setPhNo}
          placeholder="Like 0322 1234567"
          type="tel"
        />
        <SelectField
          label="Enter Your Gender"
          value={gender}
          onChange={setGender}
          options={["Male", "Female"]}
        />
        <TextAreaField
          label="Enter Your Address"
          value={address}
          onChange={setAddress}
          placeholder="Complete Address"
        />
        <FileInputField
          label="Upload Your Picture"
          onChange={(e) => setPic(e.target.files ? e.target.files[0] : null)}
        />

        <button
          type="submit"
          className="text-white font-bold border-4 border-white p-2 rounded-lg w-full mt-6"
        >
          Check Your Order
        </button>
        <ToastContainer />
      </form>
      <OrderDetail isOpen={isOpen} closeModal={closeModal} prod={products} />
    </div>
  );
};

const InputField = ({ label, value, onChange, type = "text", placeholder }) => (
  <div className="m-2 pl-6 w-full">
    <label className="font-bold m-3 text-white">{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      className="font-bold border-4 border-black p-1 rounded-md w-full"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const SelectField = ({ label, value, onChange, options }) => (
  <div className="m-2 pl-6 w-full">
    <label className="font-bold m-3 text-white">{label}</label>
    <select
      className="font-bold border-4 border-black p-1 rounded-md w-full"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="" disabled>
        Select
      </option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

const TextAreaField = ({ label, value, onChange, placeholder }) => (
  <div className="m-2 pl-6 w-full">
    <label className="font-bold m-3 text-white">{label}</label>
    <textarea
      placeholder={placeholder}
      className="font-bold border-4 border-black p-1 rounded-md w-full"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const FileInputField = ({ label, onChange }) => (
  <div className="m-2 pl-6 w-full">
    <label className="font-bold m-3 text-white">{label}</label>
    <input
      type="file"
      className="font-bold border-4 border-black p-1 rounded-md w-full"
      onChange={onChange}
    />
  </div>
);

export default Page;

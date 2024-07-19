"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const BuyerForm = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const router = useRouter();

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      userName: "",
      password: "",
    };

    if (!userName) {
      newErrors.userName = "Please enter a valid username.";
      isValid = false;
    }
    if (!password || password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const submitForm = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const userData = {
      username: userName,
      password: password,
    };

    try {
      const response = await axios.post("http://127.0.0.1:8001/token", userData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      if (response.status == 200) {
        const { access_token } = response.data;
        localStorage.setItem("token", access_token); // Store token in localStorage
        alert("Login successful.");
        console.log(localStorage)
        router.push("/Products");
      } else if (response.status == 400) {
        alert("Invalid credentials. Please check your username and password.");
      } else {
        alert("Unexpected error occurred.");
      }

      console.log(response.status);
      console.log(response.statusText);
    } catch (error) {
      console.error("Error:", error);
      alert("Error in submitting the form.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800">
      <form
        onSubmit={submitForm}
        className="flex flex-col justify-center items-center m-3 bg-gray-900 p-8 gap-4 rounded-lg shadow-lg"
      >
        <h1 className="flex justify-center items-center font-bold text-white text-3xl">
          Login Form
        </h1>
        <div className="m-2 pl-6 w-full">
          <label className="font-bold m-3 text-white">Enter Your Username</label>
          <input
            type="text"
            placeholder="Username"
            className="font-bold border-4 border-black p-1 rounded-md w-full"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          {errors.userName && <p className="text-red-500">{errors.userName}</p>}
        </div>

        <div className="m-2 pl-6 w-full">
          <label className="font-bold m-3 text-white">Enter Your Password</label>
          <input
            type="password"
            placeholder="Password must be at least 8 characters"
            className="font-bold border-4 border-black p-1 rounded-md w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && <p className="text-red-500">{errors.password}</p>}
        </div>

        <div>
          <button
            type="submit"
            className="mb-9 py-3 px-6 rounded-lg font-bold text-white bg-teal-500 hover:text-black hover:bg-teal-400 hover:shadow-inner"
          >
            Login
          </button>
        </div>
      </form>
    </div>
  );
};

export default BuyerForm;

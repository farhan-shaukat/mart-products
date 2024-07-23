"use client";
import React, { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const SignUpForm = () => {
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
      newErrors.userName = "Please enter a username.";
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
      const response = await axios.post("http://127.0.0.1:8001/register", userData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      if (response.status === 200) {
        toast.success("Your account has been successfully created.");
        router.push("/BuyerFrom");
      } else if (response.status === 400) {
        toast.error("User already exists. Please choose a different username.");
      } else {
        toast.error("Error in submitting the form.");
      }

      console.log(response.status);
      console.log(response.statusText);
    } catch (error) {
      console.error("Error:", error);
      toast.error("User already exists. Please choose a different username.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800 flex-col">
      <ToastContainer />
      <form
        onSubmit={submitForm}
        className="flex flex-col justify-center items-center m-3 bg-gray-900 p-8 gap-4 rounded-lg shadow-lg"
      >
        <h1 className="flex justify-center items-center font-bold text-white text-3xl">
          Sign Up Form
        </h1>
        <div className="m-2 pl-6 w-full">
          <label className="font-bold m-3 text-white">Enter Your Username</label>
          <input
            type="text"
            placeholder="ABC"
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
            Sign Up
          </button>
        </div>
      </form>
      <p className="text-teal-500">
        Already have an account? Go to <Link href="/BuyerFrom"><u>Login</u></Link>
      </p>
    </div>
  );
};

export default SignUpForm;

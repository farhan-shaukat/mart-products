"use client";
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import NavBar from "@/app/Components/Navbar";

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

  // Define the submit handler
  const onSubmit = async (values) => {

    try {
      // Make the POST request to your API
      const response = await axios.post("http://127.0.0.1:8001/token", values, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      if (response.status === 200) {
        const { access_token } = response.data;
        localStorage.setItem("token", access_token); 
        toast.success("Login successful.");
        router.push("/dashboard");
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
      // Handle error response
      console.error("Error submitting the form", error);
      toast.error("Error submitting the form. Please try again.");
    }
  };

  return (
    <>
    <NavBar/>
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
        <ToastContainer />
      </div>
    </div>
    </>
  );
};

export default Page;

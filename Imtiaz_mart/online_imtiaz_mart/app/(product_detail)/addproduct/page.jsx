"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import "react-toastify/dist/ReactToastify.css";

// Define the form schema using Zod
const formSchema = z.object({
  productName: z.string().min(1, { message: "Product name is required." }),
  productDescription: z.string().min(1, { message: "Product description is required." }),
  price: z.string().min(1, { message: "Price is required." }), // Accepting as string initially
  quantity: z.string().min(1, { message: "Quantity is required." }), // Accepting as string initially
  prodCategory: z.string().min(1, { message: "Category is required." }),
});

const Page = () => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const router = useRouter();

  // Initialize the form with react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: "",
      productDescription: "",
      price: "",
      quantity: "",
      prodCategory: "",
    },
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/get_category");
        if (response.status === 200) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error(error);
        toast.error("Error in Fetching Categories");
      }
    };

    fetchCategories();
  }, []);

  const onSubmit = async (data) => {
    if (!image) {
      toast.error("Please upload an image.");
      return;
    }

    const price = parseFloat(data.price);
    const quantity = parseInt(data.quantity, 10);
    const categoryName = data.prodCategory;

    if (isNaN(price) || isNaN(quantity)) {
      toast.error("Price and quantity must be valid numbers.");
      return;
    }

    const formData = new FormData();
    formData.append("name", data.productName);
    formData.append("description", data.productDescription);
    formData.append("price", price.toString()); // Append price as string
    formData.append("quantity", quantity.toString()); // Append quantity as string
    formData.append("categoryName", categoryName);
    formData.append("file", image);

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://127.0.0.1:8000/products_create/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        toast.success("Product added successfully!");
        router.push("/dashboard");
      } else {
        toast.error("Unexpected error occurred.");
      }
    } catch (error) {
      console.error(error);
      if (error.response) {
        console.error(error.response.data);
        if (error.response.status === 401) {
          toast.error("Unauthorized: You do not have permission to add this product.");
        } else if (error.response.status === 422) {
          toast.error(`Failed to add product. Unprocessable Entity: ${error.response.data.detail}`);
        }
      } else {
        toast.error("Network error.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inset-0 m-5 items-center justify-center bg-gray-800">
      <ToastContainer />
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Add New Product</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="w-full">
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Product Name</label>
            <input
              type="text"
              className="border border-gray-300 p-2 rounded w-full"
              {...register("productName")}
            />
            {errors.productName && <p className="text-red-600">{errors.productName.message}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Product Description</label>
            <textarea
              className="border border-gray-300 p-2 rounded w-full"
              {...register("productDescription")}
              rows={3}
            />
            {errors.productDescription && <p className="text-red-600">{errors.productDescription.message}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Price</label>
            <input
              type="number"
              step="0.01"
              className="border border-gray-300 p-2 rounded w-full"
              {...register("price")}
            />
            {errors.price && <p className="text-red-600">{errors.price.message}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Quantity</label>
            <input
              type="number"
              className="border border-gray-300 p-2 rounded w-full"
              {...register("quantity")}
            />
            {errors.quantity && <p className="text-red-600">{errors.quantity.message}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Categories</label>
            <select
              className="border border-gray-300 p-2 rounded w-full"
              {...register("prodCategory")}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.prodCategory && <p className="text-red-600">{errors.prodCategory.message}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Image</label>
            <Controller
              name="image"
              control={control}
              render={({ field: { onChange } }) => (
                <input
                  type="file"
                  className="border border-gray-300 p-2 rounded w-full"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    onChange(file);
                    setImage(file);
                  }}
                />
              )}
            />
            {!image && <p className="text-red-600">Please upload an image.</p>}
          </div>
          <div className="flex justify-center">
            <button
              type="button"
              className="mr-4 py-2 px-4 rounded bg-gray-500 text-white"
              onClick={() => router.push("/dashboard")}
            >
              Close
            </button>
            <button
              type="submit"
              className="py-2 px-4 rounded bg-teal-500 text-white"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Page;

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
  productDescription: z
    .string()
    .min(1, { message: "Product description is required." }),
  price: z.string().min(1, { message: "Price is required." }), // Accepting as string initially
  quantity: z.string().min(1, { message: "Quantity is required." }), // Accepting as string initially
  prodCategory: z.string().min(1, { message: "Category is required." }),
});

const UpdateProduct = ({ product, isOpen, closeModal }) => {
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
    setValue,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: product?.name || "",
      productDescription: product?.description || "",
      price: product?.price.toString() || "",
      quantity: product?.quantity.toString() || "",
      prodCategory: product?.categoryName || "",
    },
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const fetchCategories = async () => {
        try {
          const response = await axios.get(
            "http://127.0.0.1:8000/get_category"
          );
          if (response.status === 200) {
            setCategories(response.data);
          }
        } catch (error) {
          console.log(error);
          toast.error("Error in Fetching Categories");
        }
      };
      fetchCategories();
    }
  }, []);

  const onSubmit = async (data) => {
      const price = parseFloat(data.price);
      const quantity = parseInt(data.quantity, 10);
      const categoryName = data.prodCategory; // Send category name

      if (isNaN(price) || isNaN(quantity)) {
        toast.error("Price and quantity must be valid numbers.");
        return;
      }

        const formData = new FormData();
        formData.append("name", data.productName);
        formData.append("description", data.productDescription);
        formData.append("price", price);
        formData.append("quantity", quantity);
        formData.append("categoryName", categoryName);
        if (image) formData.append("file", image);
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const response = await axios.put(
          `http://localhost:8000/products_update/${product.id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.status === 200) {
          toast.success("Product updated successfully!");
          closeModal();
          window.location.reload();
          router.refresh();
        } else {
          toast.error("Unexpected error occurred.");
        }
      } catch (error) {
        console.error(error);
        if (error.response) {
          console.error(error.response.data);
          if (error.response.status === 401) {
            toast.error(
              "Unauthorized: You do not have permission to update this product."
            );
          } else if (error.response.status === 422) {
            toast.error(
              `Failed to update product. Unprocessable Entity: ${error.response.data.detail}`
            );
          }
        } else {
          toast.error("Network error.");
        }
      } finally {
        setLoading(false);
      }
    }

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 p-4">
      <ToastContainer />
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-bold mb-4">Update Product</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Product Name
            </label>
            <input
              type="text"
              className="border border-gray-300 p-2 rounded w-full"
              {...register("productName")}
            />
            {errors.productName && (
              <p className="text-red-600 text-sm">
                {errors.productName.message}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Product Description
            </label>
            <textarea
              className="border border-gray-300 p-2 rounded w-full"
              {...register("productDescription")}
              rows={3}
            />
            {errors.productDescription && (
              <p className="text-red-600 text-sm">
                {errors.productDescription.message}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Price</label>
            <input
              type="number"
              step="0.01"
              className="border border-gray-300 p-2 rounded w-full"
              {...register("price")}
            />
            {errors.price && (
              <p className="text-red-600 text-sm">{errors.price.message}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Quantity
            </label>
            <input
              type="number"
              className="border border-gray-300 p-2 rounded w-full"
              {...register("quantity")}
            />
            {errors.quantity && (
              <p className="text-red-600 text-sm">{errors.quantity.message}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Categories
            </label>
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
            {errors.prodCategory && (
              <p className="text-red-600 text-sm">
                {errors.prodCategory.message}
              </p>
            )}
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
                    onChange(e.target.files[0]);
                    setImage(e.target.files[0]);
                  }}
                />
              )}
            />
            {!image && (
              <p className="text-red-600 text-sm">Please upload an image.</p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              type="button"
              className="py-2 px-4 rounded bg-gray-500 text-white"
              onClick={closeModal}
            >
              Close
            </button>
            <button
              type="submit"
              className="py-2 px-4 rounded bg-teal-500 text-white"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProduct;

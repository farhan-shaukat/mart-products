"use client";
import React, { useState } from "react";
import axios from "axios";
import Product from "@/app/(product_detail)/product/page";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "@/app/Components/Slidebar";
import { Button } from "@/components/ui/button";
import { any, z } from "zod";

const Page = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [showProducts, setShowProducts] = useState(false);
  const [showCategory, setShowCategory] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [category, setCategory] = useState([]);
  const [userProfile, setUserProfile] = useState([]);
  const [userOrder, setUserOrder] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [catName, setCatName] = useState("");
  const [img, setImg] = useState(null);
  const [updateCategory, setUpdateCategory] = useState(null);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/products/");
      if (response.status === 200) {
        setProducts(response.data);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error in Fetching Products");
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/get_category");
      if (response.status === 200) {
        setCategory(response.data);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error in Fetching Categories");
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8002/get_user/");
      if (response.status === 200) {
        setUserProfile(response.data);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error in Fetching User Profile");
    }
  };

  const fetchUserOrder = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8003/get_order");
      if (response.status === 200) {
        console.log(response.data);
        setUserOrder(response.data);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error in Fetching User Order");
    }
  };

  const handleShowProducts = () => {
    setShowCategory(false);
    setShowUser(false);
    setShowProducts(true);
    fetchProducts();
  };

  const handleShowCategories = () => {
    setShowProducts(false);
    setShowUser(false);
    setShowCategory(true);
    fetchCategories();
  };

  const handleShowUser = () => {
    setShowProducts(false);
    setShowCategory(false);
    setShowUser(true);
    fetchUserProfile();
  };

  const handleShowOrder = () => {
    setShowProducts(false);
    setShowCategory(false);
    setShowUser(false);
    setShowOrders(true);
    fetchUserOrder();
  };

  const formShow = () => {
    setFormVisible(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const CategorySchema = z.object({
      name: z.string().min(1, "Name is required"),
      img: z.instanceof(File, "Image is required"),
    });

    try {
      if (!(img instanceof File)) {
        throw new Error("Invalid image file");
      }

      const formData = new FormData();
      formData.append("name", catName);
      formData.append("file", img); // Updated field name to match server expectation

      const data = {
        name: catName,
        img: img,
      };

      CategorySchema.parse(data);

      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://127.0.0.1:8000/category",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success("Category added successfully");
        setFormVisible(false);
        fetchCategories();
      }
    } catch (error) {
      console.error(error);
      if (error instanceof z.ZodError) {
        toast.error("Validation error");
      } else if (error.response) {
        if (error.response.status === 422) {
          toast.error("Failed to add category. Unprocessable Entity");
          console.error("Response data:", error.response.data);
        }
      } else {
        toast.error("Network error.");
      }
    }
  };

  const handleUpdateClick = (category) => {
    setUpdateCategory(category);
    setCatName(category.name);
    setImg(null);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    const categorySchema = z.object({
      name: z.string().min(1, "Name is Required"),
      img: z.instanceof(File, "Image is Required"),
    });
    try {
      if (img && !(img instanceof File)) {
        throw new Error("Invalid Image");
      }
      const formData = new FormData();
      formData.append("name", catName);
      if (img) formData.append("file", img);
      const data = {
        name: catName,
        img: img,
      };

      categorySchema.parse(data);

      const token = localStorage.getItem("token");

      const response = await axios.put(
        `http://127.0.0.1:8000/category_update/${updateCategory.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        toast.success("Category Update SuccessFully");
        setUpdateCategory(null);
        fetchCategories();
      }
    } catch (error) {
      console.error(error);
      if (error instanceof z.ZodError) {
        toast.error("Validation Error");
      } else if (error.response) {
        if (error.response.status === 422) {
          toast.error("Failed to Update Category Unprocessable Entity");
        }
      } else {
        toast.error("Network Error");
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this Category")) return;
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `http://127.0.0.1:8000/delete_category/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCategory(
        category.filter((cat) => {
          cat.id !== id;
        })
      );

      if (response.status === 200) {
        toast.success("Category Delete SuccessFuly");
        showCategory();
      } else {
        toast.error(
          "Unauthorized: You do not have permission to delete this product."
        );
      }
    } catch (error) {
      toast.error("Error in Deleting Categories");
      console.log(error);
    }
  };

  return (
    <div className="flex">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onShowProducts={handleShowProducts}
        showCategories={handleShowCategories}
        showUsers={handleShowUser}
        showOrders={handleShowOrder}
      />
      <div
        className={`flex-1 flex flex-col min-h-screen ${
          isSidebarOpen ? "ml-64" : "ml-0"
        } transition-margin duration-300`}
      >
        <h2
          onClick={toggleSidebar}
          className="text-2xl font-bold cursor-pointer p-4 bg-gray-200"
        >
          Dashboard
        </h2>
        <main className="flex-1 p-6 bg-gray-100 overflow-auto">
          {showProducts && (
            <div className="p-4">
              {products.length > 0 ? (
                <Product products={products} />
              ) : (
                <p>No products available</p>
              )}
            </div>
          )}

          {showCategory && (
            <div className="flex justify-center items-center min-h-screen">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {category.length > 0 ? (
                  category.map((cat) => (
                    <div
                      key={cat.id}
                      className="border border-gray-300 rounded-lg shadow-lg p-4"
                    >
                      {updateCategory && updateCategory.id === cat.id ? (
                        <form
                          onSubmit={handleUpdateSubmit}
                          className="border p-4 rounded"
                        >
                          <div className="mb-4">
                            <label className="block text-gray-700">Name</label>
                            <input
                              type="text"
                              name="name"
                              value={catName}
                              onChange={(e) => setCatName(e.target.value)}
                              className="w-full p-2 border rounded"
                            />
                          </div>
                          <div className="mb-4">
                            <label className="block text-gray-700">Image</label>
                            <input
                              type="file"
                              name="img"
                              onChange={(e) => {
                                setImg(e.target.files[0]);
                              }}
                              className="w-full p-2 border rounded"
                            />
                          </div>
                          <Button
                            type="submit"
                            variant="outline"
                            className="w-full"
                          >
                            Update Category
                          </Button>

                          <Button
                            type="submit"
                            variant="outline"
                            className="w-full mt-5"
                            onClick={() => {
                              setUpdateCategory(null);
                            }}
                          >
                            Close
                          </Button>
                        </form>
                      ) : (
                        <div className="border border-gray-300 rounded-lg shadow-lg p-4">
                          <img
                            className="mx-auto rounded-full h-24 w-24 mb-4"
                            src={cat.imgUrl}
                            alt={cat.name}
                          />
                          <p className="text-center">{cat.name}</p>
                          <div className="text-center">
                            <Button
                              variant="outline"
                              className="mt-2"
                              onClick={() => handleUpdateClick(cat)}
                            >
                              Update Category
                            </Button>

                            <Button
                              variant="outline"
                              className="mt-2"
                              onClick={() => handleDelete(cat.id)}
                            >
                              Delete Category
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center col-span-full">
                    No categories found.
                  </p>
                )}
                <div className="text-center col-span-full">
                  {formVisible ? (
                    <form
                      onSubmit={handleFormSubmit}
                      className="border p-4 rounded mx-auto w-full max-w-md"
                    >
                      <div className="mb-4">
                        <label className="block text-gray-700">Name</label>
                        <input
                          type="text"
                          name="name"
                          value={catName}
                          onChange={(e) => setCatName(e.target.value)}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-gray-700">Image</label>
                        <input
                          type="file"
                          name="img"
                          onChange={(e) => setImg(e.target.files[0])}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <Button
                        type="submit"
                        variant="outline"
                        className="w-full"
                      >
                        Add Category
                      </Button>

                      <Button
                        type="submit"
                        variant="outline"
                        className="w-full mt-5"
                        onClick={() => {
                          setFormVisible(false);
                          setCatName("");
                          setImg(null);
                        }}
                      >
                        Close
                      </Button>
                    </form>
                  ) : (
                    <Button variant="outline" onClick={formShow}>
                      Add Category
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
        {showUser && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {userProfile.length > 0 ? (
              userProfile.map((user) => (
                <div
                  key={user.id}
                  className="border border-gray-300 rounded-lg shadow-lg p-4"
                >
                  <img
                    src={user.imgUrl}
                    alt={user.name}
                    className="mx-auto rounded-full h-24 w-24 mb-4"
                  />
                  <div className="text-center">
                    <p className="text-xl font-bold mb-2">{user.name}</p>
                    <p className="text-gray-600">{user.email}</p>
                    <p className="text-gray-600">{user.PhoneNumber}</p>
                    <p className="text-gray-600">{user.Gender}</p>
                    <p className="text-gray-600">{user.Address}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center col-span-full">No users found.</p>
            )}
          </div>
        )}

        {showOrders && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {userOrder.length > 0 ? (
              userOrder.map((order) => (
                <div
                  className="border border-gray-300 rounded-lg shadow-lg p-4"
                  key={order.id}
                >
                  <div className="text-center">
                    <h2 className="text-lg font-bold mb-2">{order.userId}</h2>
                    <h2 className="text-lg font-bold mb-2">
                      {order.productName}
                    </h2>
                    <h2 className="text-lg font-bold mb-2">
                      {order.productPrice}
                    </h2>
                    <h2 className="text-lg font-bold mb-2">
                      {order.totalPrice}
                    </h2>
                    <h2 className="text-lg font-bold mb-2">{total_price}</h2>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center col-span-full">No Order found.</p>
            )}
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default Page;

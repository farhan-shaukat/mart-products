"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from '../../Components/Slidebar';
import { Button } from '../../../components/ui/button';;
import { any, z } from "zod";
import NavBar from "../../Components/Navbar";
import Link from "next/link";
import UpdateProduct from '../../(product_detail)/updateProduct/page';
import { isAuthenticated } from "../../../Utils/Auth";
import { useLayoutEffect } from "react";
import { useRouter } from "next/navigation";


const Page = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
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
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [id, setId] = useState(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhoneNumber, setUserPhoneNumber] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [userGender, setUserGender] = useState("");
  const [userImg, setUserImg] = useState(null);
  const [updateUser, setUpdateUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
      const cartJSON = localStorage.getItem("cart");
      if (cartJSON) {
        const items = JSON.parse(cartJSON);
        setCartItems(items);
    }
    setToken(localStorage.getItem("token"));
      setId(localStorage.getItem("id"));
      setRole(localStorage.getItem("role"));
  }, []);

  useLayoutEffect(() => {
      if (!isAuthenticated()) {
        router.push("/login");
      }
  }, [router]);

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
      console.error(error);
      toast.error("Error Fetching Products");
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/get_category");
      if (response.status === 200) {
        setCategory(response.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error Fetching Categories");
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8002/get_user/");
      if (response.status === 200) {
        setUserProfile(response.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error Fetching User Profile");
    }
  };

  const fetchUserOrder = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8003/get_order");
      if (response.status === 200) {
        setUserOrder(response.data.orders);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error Fetching User Orders");
    }
  };

  const handleShowProducts = () => {
    setShowCategory(false);
    setShowUser(false);
    setShowOrders(false);
    setShowProducts(true);
    fetchProducts();
  };

  const openModal = (product) => {
      setSelectedProduct(product);
      setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedProduct(null);
  };

  const handleUpdate = (product) => openModal(product);

  const handleDeleteProducts = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await axios.delete(
        `http://127.0.0.1:8000/products_delete/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        setProducts(products.filter((product) => product.id !== id));
        toast.success("Product deleted successfully");
      } else {
        toast.error("Unauthorized: You do not have permission to delete this product.");
      }
    } catch (error) {
      toast.error("Error deleting product");
      console.error(error);
    }
  };

  const handleShowCategories = () => {
    setShowProducts(false);
    setShowUser(false);
    setShowOrders(false);
    setShowCategory(true);
    fetchCategories();
  };

  const handleShowUser = () => {
    setShowProducts(false);
    setShowCategory(false);
    setShowOrders(false);
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

  const groupOrdersByUserId = (orders) => {
    return orders.reduce((groups, order) => {
      const { userId } = order;
      if (!groups[userId]) {
        groups[userId] = [];
      }
      groups[userId].push(order);
      return groups;
    }, {});
  };

  const groupedOrders = groupOrdersByUserId(userOrder);

  const formShow = () => setFormVisible(true);

  const formSchema = z.object({
    name: z.string().min(1, { message: "Name is required." }),
    email: z.string().email({ message: "Invalid email address." }),
    phoneNumber: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
    address: z.string().min(1, { message: "Address is required." }),
    gender: z.enum(["Male", "Female", "Other"], { message: "Select a valid gender." }),
    file: z.any().optional(),
  });
  const handleFileChange = (e) => {
      if (e.target.files && e.target.files[0]) {
        setUserImg(e.target.files[0]);
      }
    };

  const UserUpdateForm = async (e) => {
      e.preventDefault();

      // Prepare form data
      const formData = new FormData();
      formData.append("name", userName);
      formData.append("email", userEmail);
      formData.append("PhoneNumber", userPhoneNumber);
      formData.append("Address", userAddress);
      formData.append("Gender", userGender);
      if (userImg) {
        formData.append("file", userImg);
    }

      try {
        // Validate form fields
        if (typeof window !== "undefined") {
        formSchema.parse({
          name: userName,
          email: userEmail,
          phoneNumber: userPhoneNumber,
          address: userAddress,
          gender: userGender,
          file: userImg,
        });
      }
        // Make the API request
        const response = await axios.put(
          `http://127.0.0.1:8002/user_update/${updateUser.id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        if (response.status === 200) {
          toast.success("User updated successfully!");
          // Assuming router is defined somewhere
          setUpdateUser(null);
          router.refresh();
        } else if (response.status === 400) {
          toast.error("Invalid data. Please check your input.");
        } else if (response.status === 401) {
          toast.error("Unauthorized access. Please check your credentials.");
        } else {
          toast.error("Unexpected error occurred.");
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          // Handle validation errors
          toast.error("Upload the Image");
          console.log(error.errors);
        } else if (error.response) {
          // Handle API errors
          if (error.response.status === 422) {
            toast.error("Validation failed. Please check the form fields.");
          } else {
            toast.error("Error occurred during update.");
          }
        } else {
          // Handle other errors
          toast.error("Update failed. Please try again.");
        }
        console.log(error);
      }
  };

  const handleFormSubmit = async (e) => {
      e.preventDefault();

      const CategorySchema = z.object({
        name: z.string().min(1, "Name is required"),
        img: z.instanceof(File, "Image is required"),
      });

      if (typeof window !== 'undefined') {
      try {
        if (img && !(img instanceof File)) {
          throw new Error("Invalid image file");
        }

        const formData = new FormData();
        formData.append("name", catName);
        formData.append("file", img);

        const data = {
          name: catName,
          img: img,
        };

        CategorySchema.parse(data);
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
  }
  };

  const handleUpdateClick = (category) => {
      setUpdateCategory(category);
      setCatName(category.name);
      setImg(null);
  };

  const handleUpdateUserClick = (user) => {
      setUpdateUser(user);
      setUserName(user.name);
      setUserEmail(user.email);
      setUserPhoneNumber(user.PhoneNumber);
      setUserAddress(user.Address);
      setUserGender(user.Gender);
      setUserImg(null);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    
    // Define the validation schema for Zod
    const categorySchema = z.object({
      name: z.string().min(1, "Name is Required"),
      img: z.instanceof(File).optional(), 
    });
  
    // Prepare data object for validation
    const data = {
      name: catName,
      img: img 
    };
  
    try {
      // Validate the data with Zod
      categorySchema.parse(data);
  
      // Prepare form data for submission
      const formData = new FormData();
      formData.append("name", catName);
      if (img) formData.append("file", img);
  
      // Make the API request to update the category
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
  
      // Handle success response
      if (response.status === 200) {
        toast.success("Category updated successfully!");
        setUpdateCategory(null);
        fetchCategories();
      } else {
        toast.error("Unexpected response status.");
      }
    } catch (error) {
      console.error(error);
  
      // Handle validation errors
      if (error instanceof z.ZodError) {
        toast.error("Validation Error: " + error.errors.map(err => err.message).join(", "));
      } 
      // Handle HTTP errors
      else if (error.response) {
        if (error.response.status === 422) {
          toast.error("Failed to update category: Unprocessable Entity.");
        } else {
          toast.error(`Failed to update category: ${error.response.statusText}`);
        }
      } 
      // Handle network or other errors
      else {
        toast.error("Network or unknown error.");
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
      
      // Ensure correct filtering of category
      setCategory(
        category.filter((cat) => cat.id !== id)
      );
  
      if (response.status === 200) {
        toast.success("Category Deleted Successfully");
      } else {
        toast.error(
          "Unauthorized: You do not have permission to delete this category."
        );
      }
    } catch (error) {
      toast.error("Error in Deleting Category");
      console.log(error);
    }
  };
  
  const handleStatusChange = async (orderId, newStatus) => {
    const token = localStorage.getItem("token"); // Get token here
  
    try {
      const response = await axios.put(
        `http://127.0.0.1:8003/orders_status/${orderId}`,
        { status: newStatus },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (response.status === 200) {
        toast.success("Order status updated successfully");
        window.location.reload(); // Refresh to update the UI
      } else {
        toast.error("Failed to update order status");
      }
    } catch (error) {
      toast.error("Error updating order status");
      console.error(error.message);
    }
  };
  
  const totalQuantity = () => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  };
  
  
  return (
    <>
      <NavBar quantity={totalQuantity()} />
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="border border-gray-300 rounded-lg shadow-lg p-4"
                  >
                    <img
                      height={80}
                      width={60}
                      className="mx-auto rounded-full h-24 w-24 mb-4"
                      src={product.imgUrl}
                      alt={product.name}
                    />
                    <div className="text-center">
                      <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                      <p className="text-gray-800 font-semibold">
                        {" "}
                        Rs {product.price}
                      </p>
                      <p className="text-gray-800 font-semibold">
                        Product Quantity {product.quantity}
                      </p>

                      <div className="m-3 space-y-5">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => handleUpdate(product)}
                        >
                          Update Product
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => handleDeleteProducts(product.id)}
                        >
                          Delete Product
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {token && selectedProduct && (
                  <UpdateProduct
                    product={selectedProduct}
                    isOpen={isOpen}
                    closeModal={closeModal}
                  />
                )}
                <div className="text-center">
                  {token && (
                    <Button variant="outline" className="ml-4">
                      <Link href="/addproduct">Add Product</Link>
                    </Button>
                  )}
                </div>
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
                              <label className="block text-gray-700">
                                Name
                              </label>
                              <input
                                type="text"
                                name="name"
                                value={catName}
                                onChange={(e) => setCatName(e.target.value)}
                                className="w-full p-2 border rounded"
                              />
                            </div>
                            <div className="mb-4">
                              <label className="block text-gray-700">
                                Image
                              </label>
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
                              width={60}
                              height={50}
                              className="mx-auto rounded-full h-24 w-24 mb-4"
                              src={cat.imgUrl}
                              alt={cat.name}
                            />
                            <p className="text-center">{cat.name}</p>
                            <div className="text-center">
                              <Button
                                variant="outline"
                                className="m-4"
                                onClick={() => handleUpdateClick(cat)}
                              >
                                Update Category
                              </Button>

                              <Button
                                variant="outline"
                                className="m-4"
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

            {showOrders && (
              <div className="grid grid-cols-1 gap-4 p-4">
                {(() => {
                  const filteredOrders = id
                    ? { [id]: groupedOrders[id] }
                    : groupedOrders;

                  return Object.keys(filteredOrders).length > 0 ? (
                    Object.keys(filteredOrders).map((userId) => {
                      const orders = filteredOrders[userId] || [];
                      const totalBill = orders.reduce(
                        (total, order) =>
                          total + order.productPrice * order.productQuantity,
                        0
                      );
                      return (
                        <div
                          key={userId}
                          className="bg-white shadow-md rounded-lg p-4"
                        >
                          <h2 className="text-xl font-bold mb-4">
                            User ID: {userId}
                          </h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {orders.map((order, id) => (
                              <div
                                className="border border-gray-300 rounded-lg shadow-lg p-4"
                                key={id}
                              >
                                <div className="text-center">
                                  <h2 className="text-lg mb-2">
                                    Product Name: {order.productName}
                                  </h2>
                                  <h2 className="text-lg mb-2">
                                    Product Price: Rs {order.productPrice}
                                  </h2>
                                  <h2 className="text-lg mb-2">
                                    Product Quantity: {order.productQuantity}
                                  </h2>
                                  <h2 className="text-lg mb-2">
                                    Order Status: {order.status}
                                  </h2>
                                  {token && role && (
                                    <div className="mt-2">
                                      <select
                                        value={order.status}
                                        onChange={(e) =>
                                          handleStatusChange(
                                            order.userId,
                                            e.target.value
                                          )
                                        }
                                        className="border rounded p-2"
                                      >
                                        <option value="pending">Pending</option>
                                        <option value="delivered">
                                          Delivered
                                        </option>
                                        <option value="complete">
                                          Complete
                                        </option>
                                        <option value="cancelled">
                                          Cancelled
                                        </option>
                                        <option value="shipped">Shipped</option>
                                      </select>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4">
                            <h2 className="text-lg font-semibold">
                              Total Bill: Rs {totalBill}
                            </h2>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p>No orders found.</p>
                  );
                })()}
              </div>
            )}

            {showUser && (
              <div>
                {id ? (
                  <div className="flex">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                      {showUser && userProfile.length > 0 ? (
                        userProfile
                          .filter((user) => user.id == id)
                          .map((user) => (
                            <div
                              key={user.id}
                              className="border border-gray-300 rounded-lg shadow-lg p-4"
                            >
                              {updateUser && updateUser.id === user.id ? (
                                <form
                                  onSubmit={UserUpdateForm}
                                  className="border p-4 rounded"
                                >
                                  <div className="mb-4">
                                    <label className="block text-gray-700">
                                      Name
                                    </label>
                                    <input
                                      type="text"
                                      name="name"
                                      value={userName}
                                      onChange={(e) =>
                                        setUserName(e.target.value)
                                      }
                                      className="w-full p-2 border rounded"
                                    />
                                  </div>
                                  <div className="mb-4">
                                    <label className="block text-gray-700">
                                      Email
                                    </label>
                                    <input
                                      type="email"
                                      name="email"
                                      value={userEmail}
                                      onChange={(e) =>
                                        setUserEmail(e.target.value)
                                      }
                                      className="w-full p-2 border rounded"
                                    />
                                  </div>
                                  <div className="mb-4">
                                    <label className="block text-gray-700">
                                      Phone Number
                                    </label>
                                    <input
                                      type="text"
                                      name="phoneNumber"
                                      value={userPhoneNumber}
                                      onChange={(e) =>
                                        setUserPhoneNumber(e.target.value)
                                      }
                                      className="w-full p-2 border rounded"
                                    />
                                  </div>
                                  <div className="mb-4">
                                    <label className="block text-gray-700">
                                      Address
                                    </label>
                                    <input
                                      type="text"
                                      name="address"
                                      value={userAddress}
                                      onChange={(e) =>
                                        setUserAddress(e.target.value)
                                      }
                                      className="w-full p-2 border rounded"
                                    />
                                  </div>
                                  <div className="mb-4">
                                    <label className="block text-gray-700">
                                      Gender
                                    </label>
                                    <select
                                      name="gender"
                                      value={userGender}
                                      onChange={(e) =>
                                        setUserGender(e.target.value)
                                      }
                                      className="w-full p-2 border rounded"
                                    >
                                      <option value="">Select Gender</option>
                                      <option value="Male">Male</option>
                                      <option value="Female">Female</option>
                                      <option value="Other">Other</option>
                                    </select>
                                  </div>
                                  <div className="mb-4">
                                    <label className="block text-gray-700">
                                      Profile Image
                                    </label>
                                    <input
                                      type="file"
                                      name="img"
                                      onChange={handleFileChange}
                                      className="w-full p-2 border rounded"
                                    />
                                  </div>
                                  <Button
                                    type="submit"
                                    variant="outline"
                                    className="w-full"
                                  >
                                    Update User
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full mt-5"
                                    onClick={() => setUpdateUser(null)}
                                  >
                                    Close
                                  </Button>
                                </form>
                              ) : (
                                <div className="border border-gray-300 rounded-lg shadow-lg p-4">
                                  <img
                                    height={50}
                                    width={80}
                                    className="mx-auto rounded-full h-24 w-24 mb-4"
                                    src={user.imgUrl}
                                    alt={user.name}
                                  />
                                  <p className="text-center font-black">
                                    {user.name}
                                  </p>
                                  <p className="text-center font-black">
                                    {user.email}
                                  </p>
                                  <p className="text-center text-black">
                                    {user.PhoneNumber}
                                  </p>
                                  <p className="text-center text-black">
                                    {user.Gender}
                                  </p>
                                  <p className="text-center text-black">
                                    {user.Address}
                                  </p>
                                  <div className="text-center">
                                    <Button
                                      variant="outline"
                                      className="m-4"
                                      onClick={() =>
                                        handleUpdateUserClick(user)
                                      }
                                    >
                                      Update User
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))
                      ) : (
                        <p className="text-center col-span-full">
                          No users found.
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center items-center min-h-screen">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                      {showUser && userProfile.length > 0 ? (
                        userProfile.map((user) => (
                          <div
                            key={user.id}
                            className="border border-gray-300 rounded-lg shadow-lg p-4"
                          >
                            <img
                              height={50}
                              width={80}
                              src={user.imgUrl}
                              alt={user.name}
                              className="mx-auto rounded-full h-24 w-24 mb-4"
                            />
                            <div className="text-center">
                              <p className="text-xl font-bold mb-2">
                                User id : {user.id}
                              </p>
                              <p className="text-xl font-bold mb-2">
                                User Name : {user.name}
                              </p>
                              <p className="text-gray-600">
                                User Email :{user.email}
                              </p>
                              <p className="text-gray-600">
                                User PhoneNumber : {user.PhoneNumber}
                              </p>
                              <p className="text-gray-600">
                                User Gender: {user.Gender}
                              </p>
                              <p className="text-gray-600">
                                User Address: {user.Address}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center col-span-full">
                          No users found.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
        <ToastContainer />
      </div>
    </>
  );
};

export default Page;

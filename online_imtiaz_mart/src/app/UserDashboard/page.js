'use client';
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from 'next/navigation';

const Page = () => {
  const [orders, setOrders] = useState([]);
  const [statusOptions] = useState(["Pending", "Delivered", "Complete"]);
  const router = useRouter();

  const getOrderDetail = async () => {
    try {
      const access_token = localStorage.getItem("token");
      const response = await axios.get("http://127.0.0.1:8003/get_order", {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      setOrders(response.data.orders);
    } catch (error) {
      console.log(error);
    }
  };

  const handleStatusChange = (orderId, newStatus) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push('/');
  };

  useEffect(() => {
    getOrderDetail();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <button 
        onClick={handleLogout} 
        className="self-end mb-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Logout
      </button>
      <h1 className="text-2xl font-bold mb-4">User Order Dashboard</h1>
      {orders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
          {orders.map((item, index) => (
            <div key={index} className="bg-white shadow-md rounded-lg p-4">
              <h2 className="text-lg font-semibold">Product Name: {item.productName}</h2>
              <p>Product Price: Rs {item.productPrice}</p>
              <p>Product Quantity: {item.productQuantity}</p>
              <p>Status: {item.status || "Pending"}</p>
              <div className="mt-2">
                <label htmlFor={`status-${index}`} className="block mb-2"> Status:</label>
                <select
                  id={`status-${index}`}
                  value={item.status || "Pending"}
                  onChange={(e) => handleStatusChange(item.id, e.target.value)}
                  className="border border-gray-300 rounded p-2"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
          <div className="bg-white shadow-md rounded-lg p-4 mt-4">
            <h2 className="text-lg font-semibold">Total Bills: Rs {orders.reduce((total, order) => total + order.productPrice * order.productQuantity, 0)}</h2>
          </div>
        </div>
      ) : (
        <p>No Order Found</p>
      )}
    </div>
  );
};

export default Page;

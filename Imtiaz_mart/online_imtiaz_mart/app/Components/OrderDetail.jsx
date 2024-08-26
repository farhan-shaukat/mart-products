"use client";
import React, { useState, useEffect } from "react";

const OrderDetail = ({ isOpen, closeModal, prod }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(isOpen);

  useEffect(() => {
      setIsModalOpen(isOpen);
  }, [isOpen]);

  useEffect(() => {
      const cartJSON = localStorage.getItem("cart");
      if (cartJSON) {
        const items = JSON.parse(cartJSON);
        setCartItems(items);
    }
  }, []);

  const closeModalSystem = () => {
      closeModal();
  };

  const totalBill = () => {
      return cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
  };

  const checkStock = (itemId, quantityItem) => {
      const product = prod.find((p) => p.id === itemId);
      return product ? product.quantity >= quantityItem : false;

  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 overflow-y-auto h-screen">
      <div className="bg-white p-8 sm:p-6 max-w-md sm:max-w-2xl lg:max-w-4xl w-full mx-auto rounded-lg z-10 overflow-y-auto">
        <h2 className="text-2xl text-center sm:text-3xl font-bold mb-4">
          Order Details
        </h2>
        <div className="space-y-2 sm:space-y-4 overflow-y-auto max-h-[50vh]">
          {cartItems.length > 0 ? (
            <>
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 border border-gray-300 rounded-lg shadow-sm items-center"
                >
                  <span className="font-semibold">{item.name}</span>
                  <span className="text-center sm:text-left">
                    {item.quantity}
                  </span>
                  <span className="text-center sm:text-left">
                    Rs {item.price}
                  </span>
                  <span className="text-center sm:text-left">
                    Rs {item.price * item.quantity}
                  </span>
                  {!checkStock(item.id, item.quantity) && (
                    <p className="text-red-500 col-span-2 sm:col-span-4 mt-2 sm:mt-0">
                      Not enough stock available
                    </p>
                  )}
                </div>
              ))}
              <div className="flex justify-between items-center mt-4">
                <span className="font-bold">Total Bill:</span>
                <span> Rs {totalBill()}</span>
              </div>
            </>
          ) : (
            <p>Your cart is empty.</p>
          )}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button
            className="bg-red-500 text-white px-4 py-2 rounded"
            onClick={closeModalSystem}
          >
            Cancel
          </button>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={closeModalSystem}
          >
            Submit Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;

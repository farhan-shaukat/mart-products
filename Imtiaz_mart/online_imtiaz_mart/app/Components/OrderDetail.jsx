"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";


const OrderDetail = ({ isOpen, closeModal, prod}) => {
  const [cartItems, setCartItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(isOpen);
  const router = useRouter()

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
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black opacity-50"></div>
      <div className="bg-white p-8 rounded-lg z-10 w-1/3">
        <h2 className="text-xl font-bold mb-4">Order Details</h2>
        <div className="flex flex-col gap-2">
          {cartItems.length > 0 ? (
            <>
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center"
                >
                  <span>{item.name}</span>
                  <span>{item.quantity}</span>
                  <span>{item.price}</span>
                  <span>Rs {item.price * item.quantity}</span>
                  {!checkStock(item.id, item.quantity) && (
                    <p className="text-red-500 ml-4">
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

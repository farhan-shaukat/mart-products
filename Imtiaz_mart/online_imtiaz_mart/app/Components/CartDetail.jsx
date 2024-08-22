"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/button";

const CartDetail = ({
  isOpen,
  closeModal,
  carts,
  products,
  setProducts,
  handleDelete,
  setCart,
}) => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState(carts || []);
  const [isModalOpen, setIsModalOpen] = useState(isOpen);

  useEffect(() => {
    setIsModalOpen(isOpen);
  }, [isOpen]);

  useEffect(() => {
    setCartItems(carts);
  }, [carts]);

  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      closeModal();
    }
  }, [cartItems, closeModal]);

  const totalBill = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const updateProductQuantity = (id, change) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;

    const productQuantity = product.quantity;

    const updatedCart = cartItems
      .map((item) => {
        if (item.id === id) {
          const newQuantity = item.quantity + change;
          if (
            newQuantity >= productQuantity ||
            newQuantity <= productQuantity
          ) {
            return { ...item, quantity: newQuantity };
          } else if (newQuantity <= 0) {
            return null;
          }
        }
        return item;
      })
      .filter((item) => item.quantity > 0);

    const updatedProducts = products.map((p) => {
      if (p.id === id && p.quantity >= 0) {
        const newProductQuantity = p.quantity - change;
        if (productQuantity <= productQuantity) {
          return { ...p, quantity: newProductQuantity };
        }
      }
      return p;
    });

    window.localStorage.setItem("cart", JSON.stringify(updatedCart));

    setCart(updatedCart);
    setProducts(updatedProducts);
  };

  return isModalOpen ? (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4 overflow-y-auto h-screen">
      <div className="bg-white p-4 sm:p-6 max-w-md sm:max-w-2xl lg:max-w-4xl w-full mx-auto rounded-lg overflow-y-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-center">
          Cart Items
        </h1>
        {cartItems.length > 0 ? (
          <ul className="space-y-2 sm:space-y-4 overflow-y-auto max-h-[50vh]">
            {cartItems.map((item) => (
              <li
                key={item.id}
                className="flex flex-col sm:flex-row justify-between items-center p-2 sm:p-4 border border-gray-300 rounded-lg shadow-sm space-y-2 sm:space-y-0"
              >
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <span className="font-semibold text-lg">{item.name}</span>
                  <div className="text-sm text-gray-600 flex space-x-2 sm:space-x-4">
                    <span>Quantity: {item.quantity}</span>
                    <button
                      onClick={() => updateProductQuantity(item.id, 1)}
                      className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                      disabled={
                        products.find((p) => p.id === item.id).quantity === 0
                      }
                    >
                      +
                    </button>
                    <button
                      onClick={() => updateProductQuantity(item.id, -1)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                      disabled={item.quantity === 0}
                    >
                      -
                    </button>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <span className="text-lg font-semibold">{item.price} Rs</span>
                  <span className="text-lg font-semibold">
                    {item.quantity * item.price} Rs
                  </span>
                  <Button
                    onClick={() => handleDelete(item.quantity, item.id)}
                    variant="outline"
                    className="sm:w-auto w-full"
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-600 mt-4">
            No items in the cart.
          </p>
        )}
        <div className="mt-6 font-bold text-xl flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <Button
            variant="outline"
            onClick={closeModal}
            className="w-full sm:w-auto min-w-[100px] text-center"
          >
            Add More Items
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              router.push("/register");
            }}
            className="w-full sm:w-auto min-w-[100px] text-center"
          >
            Check Out
          </Button>

          <span>Total Bill: {totalBill()} Rs</span>
        </div>
      </div>
    </div>
  ) : null;
};

export default CartDetail;

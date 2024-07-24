import React, { useEffect, useState } from "react";

const CartDetail = ({
  isOpen,
  closeModal,
  carts,
  products,
  setProducts,
  handleDelete,
  setCart,
}) => {
  const [cartItems, setCartItems] = useState(carts || []);
  const [isModalOpen, setIsModalOpen] = useState(isOpen);

  useEffect(() => {
    setIsModalOpen(isOpen);
  }, [isOpen]);

  useEffect(() => {
    setCartItems(carts);
  }, [carts]);

  useEffect(() => {
    if (cartItems.length === 0) {
      closeModal();
    }
  }, [cartItems, closeModal]);

  // useEffect(() => {
  //   const checkCartExpiration = () => {
  //     const savedExpireTime = localStorage.getItem("cart_expire_time");
  //     const currentTime = new Date().getTime();
  //     console.log("Current Time\t",currentTime)
  //     console.log("Expire Time\t",savedExpireTime)
  //     if ( currentTime > savedExpireTime) {
  //       clearCart();
  //     }
  //   };

  //   const setCartExpiration = () => {
  //     const expireTime = new Date().getTime() + (2 * 60 * 1000);
  //     localStorage.setItem("cart_expire_time", expireTime);
  //   };
  //   setCartExpiration();
  //   const interval = setInterval(checkCartExpiration(),1000)
  //   return () => clearInterval(interval);
  // }, []);

  // const clearCart = () => {
  //   setCartItems([]);
  //   setCart([]);
  //   localStorage.removeItem("cart_expire_time");
  // };

  const totalBill = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const updateProductQuantity = (id, change) => {
    // Find the product and its current quantity
    const product = products.find((p) => p.id === id);
    if (!product) return; // Exit if product is not found

    // Get the product's available quantity
    const productQuantity = product.quantity;

    // Update the cart items
    const updatedCart = cartItems
      .map((item) => {
        if (item.id === id) {
          const newQuantity = item.quantity + change;
          // Ensure new quantity is within valid range
          if (
            newQuantity >= productQuantity ||
            newQuantity <= productQuantity
          ) {
            return { ...item, quantity: newQuantity };
          }
        }
        return item;
      })
      .filter((item) => item.quantity > 0);

    // Update the product quantities
    const updatedProducts = products.map((p) => {
      if (p.id === id && p.quantity >= 0) {
        const newProductQuantity = p.quantity - change;

        if (productQuantity <= productQuantity) {
          return { ...p, quantity: newProductQuantity };
        }
      }
      return p;
    });

    // Update the state or context with new cart and products
    setCartItems(updatedCart);
    setCart(updatedCart);

    setProducts(updatedProducts);

  };

  return isModalOpen ? (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 max-w-4xl mx-auto rounded-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">Cart Items</h1>
        {cartItems.length > 0 ? (
          <ul className="space-y-4">
            {cartItems.map((item) => (
              <li
                key={item.id}
                className="flex justify-between items-center p-4 border border-gray-300 rounded-lg shadow-sm"
              >
                <div>
                  <span className="font-semibold text-lg">{item.name}</span>
                  <div className="text-sm text-gray-600">
                    <span>Quantity: {item.quantity}</span>
                    <button
                      onClick={() => updateProductQuantity(item.id, 1)}
                      className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 ml-2"
                      disabled={
                        products.find((p) => p.id === item.id).quantity === 0
                      }
                    >
                      +
                    </button>
                    <button
                      onClick={() => updateProductQuantity(item.id, -1)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 ml-2"
                      disabled={item.quantity === 0}
                    >
                      -
                    </button>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-lg font-semibold">{item.price} Rs</span>
                  <span className="text-lg font-semibold">
                    {item.quantity * item.price} Rs
                  </span>
                  <button
                    onClick={() => handleDelete(item.quantity, item.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-600 mt-4">No items in the cart.</p>
        )}
        <div className="mt-6 font-bold text-xl flex justify-between items-center">
          <button
            className="py-2 px-2 rounded-lg font-semibold text-white bg-teal-500 hover:text-black hover:bg-teal-400 hover:shadow-inner"
            onClick={closeModal}
          >
            Add More Items
          </button>
          <span>Total Bill: {totalBill()} Rs</span>
        </div>
      </div>
    </div>
  ) : null;
};

export default CartDetail;

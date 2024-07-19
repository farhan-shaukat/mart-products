import React from "react";
import Link from "next/link";

const OrderDetails = ({ cartItem }) => {
  return (
    <div className="border p-4">
      <h1 className="text-xl font-bold mb-2">Your Order Details</h1>
      <div className="grid grid-cols-2 gap-4">
        {cartItem &&
          cartItem.map((item) => (
            <div key={item.id} className="border p-2">
              <p className="font-bold">{item.name}</p>
              <p>Quantity: {item.quantity}</p>
              <p>Price: ${item.price}</p>
              <p className="font-bold mt-2">
                Total: ${item.price * item.quantity}
              </p>
            </div>
          ))}
      </div>
      <button className="mt-4 py-2 px-4 rounded-lg font-bold text-white bg-teal-500 hover:text-black hover:bg-teal-400 hover:shadow-inner">
        <Link href={"/Orders"}>Order Completed</Link>
      </button>
    </div>
  );
};

export default OrderDetails;

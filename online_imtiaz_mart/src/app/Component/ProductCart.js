"use client";
import React from "react";
import { useEffect, useState } from "react";
const ProductCart = ({ Prod }) => {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const localtoken = localStorage.getItem("token");
    setToken(localtoken);
  }, []);

  return (
    <div className="m-4 p-4 max-w-xs border border-gray-300 rounded-lg shadow-lg">
      <img
        className="mx-auto rounded-full h-24 w-24 mb-4"
        src={Prod.imgUrl}
        alt="Product Image"
      />
      <div className="text-center">
        <h3 className="text-xl font-bold">Product Name: {Prod.name}</h3>
        <p className="text-gray-600">Product Description: {Prod.description}</p>
        <p className="text-gray-600">Product Price: {Prod.price}</p>
        { <p className="text-gray-600">Quantity: {Prod.quantity}</p>}
        
      </div>
    </div>
  );
};

export default ProductCart;

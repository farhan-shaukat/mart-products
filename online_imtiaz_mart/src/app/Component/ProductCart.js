import React from "react";

const ProductCart = ({ Prod }) => {
  const QuantityCheck = () => {
    if (Prod.Quantity === 0) {
      return <p className="text-red-700 font-bold">Out of Stock</p>;
    } else {
      return <p className="text-gray-600">Product Quantity: {Prod.quantity}</p>;
    }
  };

  return (
    <div className="m-4 p-4 max-w-xs border border-gray-300 rounded-lg shadow-lg">
      <img
        className="mx-auto rounded-full h-24 w-24 mb-4"
        src={Prod.imgUrl}
        alt="Prod Avatar"
      />
      <div className="text-center">
        <h3 className="text-xl font-bold">Product Name: {Prod.name}</h3>
        <p className="text-gray-600">Product Description: {Prod.description}</p>
        <p className="text-gray-600">Product Price: {Prod.price}</p>

        {QuantityCheck()}
      </div>
    </div>
  );
};

export default ProductCart;

'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import UpdateProduct from '@/app/(product_detail)/updateProduct/page';
import NavBar from '@/app/Components/Navbar';

const Product = () => {
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/products/');
      if (response.status === 200) {
        setProducts(response.data);
      }
    } catch (error) {
      console.log(error);
      toast.error('Error fetching products');
    }
  };

  useEffect(() => {
    fetchProduct();
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  const openModal = (product) => {
    setSelectedProduct(product);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedProduct(null);
  };


  const handleUpdate = (product) => {
    openModal(product);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const response = await axios.delete(
        `http://localhost:8000/products_delete/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        setProducts(products.filter((product) => product.id !== id));
        toast.success('Product deleted successfully');
      } else {
        toast.error('Unauthorized: You do not have permission to delete this product.');
      }
    } catch (error) {
      toast.error('Error deleting product');
      console.log(error);
    }
  };

  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const existingProduct = prevCart.find((item) => item.id === product.id);
      const updatedCart = existingProduct
        ? prevCart.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [...prevCart, { ...product, quantity: 1 }];

      window.localStorage.setItem('cart', JSON.stringify(updatedCart));
      return updatedCart;
    });

    setProducts((prevProducts) =>
      prevProducts.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity - 1 } : item
      )
    );

    toast.success('Item added to your cart');
  };

  const handleCartDelete = (quantityForDel, id) => {
    const cartItem = cart.find((cart) => cart.id === id);

    if (!cartItem) return;

    const updatedProducts = products.map((prod) =>
      prod.id === id
        ? { ...prod, quantity: prod.quantity + quantityForDel }
        : prod
    );

    const updatedCart = cart.filter((item) => item.id !== id);
    setCart(updatedCart);
    setProducts(updatedProducts);
    window.localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div>
      {!token && (
          <NavBar
          quantity = {totalQuantity}
            carts={cart}
            products={products}
            setProducts={setProducts}
            handleDelete={handleCartDelete}
            setCart={setCart}
          />
        )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {products.map((product) => (
          <div key={product.id} className="border border-gray-300 rounded-lg shadow-lg p-4">
            <img className="mx-auto rounded-full h-24 w-24 mb-4" src={product.imgUrl} alt={product.name} />
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Product Name : {product.name}</h3>
              <p className="text-gray-600 mb-2">Product Description : {product.description}</p>
              <p className="text-gray-800 font-semibold">Product Price: Rs {product.price}</p>
             { token && <p className="text-gray-800 font-semibold"> Product Quantity {product.quantity}</p>}
              {product.quantity > 0 ? (
                !token ? (
                  <Button variant="outline" className="mt-3" onClick={() => handleAddToCart(product)}>
                    Add to Cart
                  </Button>
                ) : (
                  <div className="m-3 space-y-5">
                    <Button variant="outline" className="w-full" onClick={() => handleUpdate(product)}>
                      Update Product
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => handleDelete(product.id)}>
                      Delete Product
                    </Button>
                  </div>
                )
              ) : (
                <p className="text-red-600 font-semibold">Out of Stock</p>
              )}
            </div>
          </div>
        ))}
      </div>
      <ToastContainer />
      <div className="text-center">
        {token && (
          <Button variant="outline" className="ml-4">
            <Link href="/addproduct">Add Product</Link>
          </Button>
        )}
      </div>
      {selectedProduct && token && (
        <UpdateProduct
          isOpen={isOpen}
          closeModal={closeModal}
          product={selectedProduct}
        />
      )}
    </div>
  );
};

export default Product;

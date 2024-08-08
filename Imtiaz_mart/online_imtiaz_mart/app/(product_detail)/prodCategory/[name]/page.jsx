"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import NavBar from "@/app/Components/Navbar";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const CategoryProduct = () => {
  const params = useParams();
  const router = useRouter()
  const category = decodeURIComponent(params.name);
  const [products, setProducts] = useState([]);
  const [searchProd,setSearchProd] = useState("")
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/products/");
        if (response.status === 200) {
          setProducts(response.data);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchProduct();
  }, []);

  const handleViewProduct = (id) => {
    router.push(`/productShow/${id}`);
  };

  useEffect(()=>{
    const result = products.filter((prod)=>prod.name.toLowerCase().includes(searchProd.toLowerCase()))
    setFilteredProducts(result)
  },[searchProd,products])

  return (
    <>
      <NavBar
      products={filteredProducts}
      setSearchProd={setSearchProd}
      searchProd={searchProd}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {products
          .filter((prod) => prod.category === category)
          .map((product) => (
            <div
              key={product.id}
              className="border border-gray-300 rounded-lg shadow-lg p-4"
            >
              <img
                src={product.imgUrl}
                alt={product.name}
                className="mx-auto rounded-full h-24 w-24 mb-4"
              />
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                <p className="text-gray-800 font-semibold">
                  Rs {product.price}
                </p>
                {product.quantity > 0 ? (
                  <div>
                    <Button variant="outline" className="m-3">
                      Add to Cart
                    </Button>
                  </div>
                ) : (
                  <p className="text-red-600 font-semibold">Out of Stock</p>
                )}
                <Button variant = "outline" className = "m-3" onClick={()=>handleViewProduct(product.id)}>
                View Item
                </Button>
              </div>
            </div>
          ))}
      </div>
    </>
  );
};

export default CategoryProduct;

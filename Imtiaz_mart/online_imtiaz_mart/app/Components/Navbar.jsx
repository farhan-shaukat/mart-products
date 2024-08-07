"use client";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CartDetail from "./CartDetail";

const NavBar = ({
  quantity,
  carts,
  products,
  setProducts,
  handleDelete,
  setCart,
}) => {
  const [token, setToken] = useState(null);
  const [id, setId] = useState(null);
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
    const storedId = localStorage.getItem("id");
    setId(storedId);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("id");
    localStorage.removeItem("role")
    setId(null);
    setToken(null);
    router.push("/");
  };

  const openModalCart = () => {
    setIsOpen(true);
  };

  const closeModalCart = () => {
    setIsOpen(false);
  };

  return (
    <div className="bg-slate-600 w-full">
      <nav className="container mx-auto flex justify-between items-center px-4 xl:px-0 py-2">
        <div className="flex items-center space-x-5 flex-grow">
          <div className="h-14 m-2">
            <Image src="/img/logo.jpeg" alt="Logo" width={56} height={56} />
          </div>

          <Link
            href="/"
            className="px-4 py-2 bg-transparent text-white border border-white rounded hover:bg-white hover:text-slate-600 transition"
          >
            Home
          </Link>
          <div className="flex flex-grow items-center">
            <input
              type="text"
              placeholder="Search"
              className="p-2 rounded bg-white text-black w-full"
            />
            <button className="px-4 py-2 bg-transparent text-white border border-white rounded hover:bg-white hover:text-slate-600 transition ml-3 mr-5">
              Search
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-5">
          {token ? (
            <button
              className="px-4 py-2 bg-transparent text-white border border-white rounded hover:bg-white hover:text-slate-600 transition"
              onClick={handleLogout}
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 bg-transparent text-white border border-white rounded hover:bg-white hover:text-slate-600 transition"
              >
                Login
              </Link>

              <Link
                href="/adminlogin"
                className="px-4 py-2 bg-transparent text-white border border-white rounded hover:bg-white hover:text-slate-600 transition"
              >
                Admin Login
              </Link>

              <Link
                href="/register"
                className="px-4 py-2 bg-transparent text-white border border-white rounded hover:bg-white hover:text-slate-600 transition"
              >
                Register
              </Link>
            </>
          )}
          <div className="relative flex items-center cursor-pointer" onClick={openModalCart} >
            <FontAwesomeIcon
              icon={faCartShopping}
              className="text-2xl text-white"
            />
            {
              <span className="absolute top-0 right-0 bg-red-600 text-white rounded-full px-2 py-1 text-xs">
                {quantity}
              </span>
            }
          </div>
        </div>
      </nav>
      {!token && (
          <CartDetail
            isOpen={isOpen}
            closeModal={closeModalCart}
            carts={carts}
            products={products}
            setProducts={setProducts}
            handleDelete={handleDelete}
            setCart={setCart}
          />
        )}
    </div>
  );
};

export default NavBar;

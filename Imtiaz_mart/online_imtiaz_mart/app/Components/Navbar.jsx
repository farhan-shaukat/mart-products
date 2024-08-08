"use client";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CartDetail from "./CartDetail";
import { Button } from "@/components/ui/button";

const NavBar = ({
  quantity,
  carts,
  products,
  setProducts,
  handleDelete,
  setCart,
  searchProd,
  setSearchProd,
}) => {
  const [token, setToken] = useState(null);
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(searchProd || "");

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("id");
    localStorage.removeItem("role");
    setToken(null);
    router.push("/");
  };

  const openModalCart = () => {
    setIsOpen(true);
  };

  const closeModalCart = () => {
    setIsOpen(false);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setSearchProd(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="bg-slate-600 w-full">
      <nav className="container mx-auto flex justify-between items-center px-4 xl:px-0 py-2">
        <div className="flex items-center space-x-5 flex-grow">
          <div className="h-14 m-2">
            <Image src="/img/logo.jpeg" alt="Logo" width={56} height={56} />
          </div>

          <Button
            variant="outline"
            className="px-4 py-2 hover:bg-white hover:text-slate-600  ml-3 mr-5"
          >
            <Link href="/">Home</Link>
          </Button>
          <form onSubmit={handleSearchSubmit} className="flex flex-grow">
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={handleSearchChange}
              className="p-2 rounded bg-white text-black w-full"
            />
          </form>
        </div>
        <div className="flex items-center space-x-5">
          {token ? (
            <Button
              variant="outline"
              className="px-4 py-2 hover:bg-white hover:text-slate-600  ml-3 mr-5"
              onClick={handleLogout}
            >
              Logout
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                className="px-4 py-2 hover:bg-white hover:text-slate-600  ml-3 mr-5"
              >
                <Link href="/login">Login</Link>
              </Button>

              <Button
                variant="outline"
                className="px-4 py-2 hover:bg-white hover:text-slate-600  ml-3 mr-5"
              >
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
          <div
            className="relative flex items-center cursor-pointer"
            onClick={openModalCart}
          >
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

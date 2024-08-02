"use client";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const NavBar = () => {
  const [token, setToken] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Retrieve token from localStorage on component mount
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  const handleLogout = () => {
    // Remove token from localStorage and update state
    localStorage.removeItem("token");
    setToken(null);
    router.push("/");
  };

  return (
    <div className="bg-slate-600 w-full">
      <nav className="container mx-auto flex justify-between items-center px-4 xl:px-0 py-2">
        <div className="flex items-center space-x-5 flex-grow">
          <div className="h-14 m-2">
            <Image src="/img/logo.jpeg" alt="Logo" width={56} height={56} />
          </div>

          <Button variant="outline" onClick={handleLogout}>
            <Link href="/">Home</Link>
          </Button>
          <div className="flex flex-grow items-center">
            <input
              type="text"
              placeholder="Search"
              className="p-2 rounded bg-white text-black w-full"
            />
            <Button variant="outline" className="m-3">
              {" "}
              Search{" "}
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-5">
          {token ? (
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <>
              <Button variant="outline">
                <Link href="/login">Login</Link>
              </Button>

              <Button variant="outline">
                <Link href={"/register"} >Register</Link>
              </Button>
            </>
          )}
          <div className="flex items-center">
            <FontAwesomeIcon
              icon={faCartShopping}
              className="text-xl text-white"
            />
            <span className="ml-2 text-md cursor-pointer text-white m-3">
              Shopping Cart
            </span>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default NavBar;

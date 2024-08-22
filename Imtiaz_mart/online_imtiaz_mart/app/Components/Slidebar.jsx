"use client";
import React, { useState, useEffect } from "react";

const Sidebar = ({
  isOpen,
  onClose,
  onShowProducts,
  showCategories,
  showUsers,
  showOrders,
}) => {
  const [token, setToken] = useState(null);
  const [id, setId] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
      const storedToken = localStorage.getItem("token");
      const storedId = localStorage.getItem("id");
      const storedRole = localStorage.getItem("role");
      setToken(storedToken);
      setId(storedId);
      setRole(storedRole);
  }, [setId, setRole, setToken]);

  return (
    <aside
      className={`fixed left-0 top-0 w-64 h-full bg-gray-800 text-white transform ${
        isOpen ? "translate-x-0" : "-translate-x-64"
      } transition-transform duration-300 z-50`}
    >
      <div className="p-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Dashboard</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <nav className="mt-4">
        <ul className="space-y-2">
          {(!id && (token && role)) && (
            <>
              <li>
                <button
                  className="block py-2 px-4 hover:bg-gray-700"
                  onClick={onShowProducts}
                >
                  Products
                </button>
              </li>
              <li>
                <button
                  className="block py-2 px-4 hover:bg-gray-700"
                  onClick={showCategories}
                >
                  Categories
                </button>
              </li>
              <li>
                <button
                  className="block py-2 px-4 hover:bg-gray-700"
                  onClick={showUsers}
                >
                  Profiles
                </button>
              </li>
              <li>
                <button
                  className="block py-2 px-4 hover:bg-gray-700"
                  onClick={showOrders}
                >
                  Orders
                </button>
              </li>
            </>
          )}
        </ul>
      </nav>

      <nav className="mt-4">
        <ul className="space-y-2">
          {id && token && (
            <>
              <li>
                <button
                  className="block py-2 px-4 hover:bg-gray-700"
                  onClick={showUsers}
                >
                  Profiles
                </button>
              </li>
              <li>
                <button
                  className="block py-2 px-4 hover:bg-gray-700"
                  onClick={showOrders}
                >
                  Orders
                </button>
              </li>
            </>
          )}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;

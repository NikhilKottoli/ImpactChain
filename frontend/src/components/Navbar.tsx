import { useState } from "react";
import { Bell, CreditCard, Map, Repeat, Search } from "lucide-react";

const navItems = [
  { icon: CreditCard, label: "Cards" },
  { icon: Map, label: "Map" },
  { icon: Search, label: "Search" },
  { icon: Bell, label: "Notifications" },
  { icon: Repeat, label: "Transactions" },
];

export default function Navbar() {
  const [active, setActive] = useState(0);

  return (
    <>
      <nav className="flex items-center justify-between px-12 py-6  bg- fixed w-full top-0 left-0 z-50 ">
        {/* Left: Platform Logo */}
        <div className="flex items-center">
          <img src="/logo.png" alt="Platform Logo" className="h-20  mr-3" />
          <span className="font-semibold text-xl"></span>
        </div>

        {/* Right: Wallet & Profile */}

        <div className="flex items-center gap-2 bg-white px-2 py-2 rounded-full shadow-md">
          <button className="px-4 py-2 rounded-full border border-gray-300 bg-gray-100 cursor-pointer font-medium">
            Connect Wallet
          </button>
          <img
            src="https://t4.ftcdn.net/jpg/04/31/64/75/360_F_431647519_usrbQ8Z983hTYe8zgA7t1XVc5fEtqcpa.jpg"
            alt="Profile"
            className="h-9 w-9 rounded-full object-cover border border-gray-300"
          />
        </div>
      </nav>

      {/* Bottom Tab Bar */}
      <nav className="w-full fixed left-0 lg:top-5 lg:bottom-auto bottom-5 px-6">
        <div className="w-full max-w-[600px] bg-white z-50 flex justify-around items-center py-6 mx-auto rounded-full shadow-xl">
          {navItems.map((item, idx) => (
            <button
              key={item.label}
              className={`flex flex-col items-center focus:outline-none relative ${
                active === idx
                  ? "text-blue-400"
                  : "text-gray-600 hover:text-blue-400"
              }`}
              onClick={() => setActive(idx)}
            >
              <item.icon className="mb-1 w-6 h-6" />
              <span className="text-xs">{item.label}</span>
              {active === idx && (
                <div className="absolute -bottom-6 left-0 w-full h-1 bg-blue-400 rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}

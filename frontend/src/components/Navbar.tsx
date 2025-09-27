import { useState } from "react";
import { Bell, CreditCard, Map, Repeat, Search, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { WalletConnect } from "./WalletConnect";

const navItems = [
  { icon: CreditCard, label: "Cards", path: "/cards" },
  { icon: Users, label: "Social", path: "/social" },
  { icon: Map, label: "Map", path: "/map" },
  { icon: Search, label: "Search", path: "/search" },
  { icon: Bell, label: "Notifications", path: "/notifications" },
];

export default function Navbar() {
  const location = useLocation();
  const getActiveIndex = () => {
    const currentPath = location.pathname;
    const index = navItems.findIndex((item) => item.path === currentPath);
    return index >= 0 ? index : 0;
  };
  const [active, setActive] = useState(getActiveIndex());

  return (
    <>
      <nav className="flex items-center justify-between px-12 py-6   fixed w-full top-0 left-0 z-50 ">
        {/* Left: Platform Logo */}
        <Link to="/" className="flex items-center">
          <img src="/logo.png" alt="Platform Logo" className="h-12 mr-3" />
          <div>
            <span className="font-bold text-xl text-gray-900">ImpactDAO</span>
            <p className="text-xs text-gray-600">Social Impact Platform</p>
          </div>
        </Link>

        {/* Center: Create Actions
        <div className="hidden md:flex items-center space-x-3">
          <Link to="/create-post">
            <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full hover:from-green-600 hover:to-blue-600 text-sm font-medium">
              + Create Post
            </button>
          </Link>
          <Link to="/create-campaign">
            <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full hover:from-purple-600 hover:to-blue-600 text-sm font-medium">
              + Create Campaign
            </button>
          </Link>
        </div> */}

        {/* Right: Wallet & Profile */}
        <div className="flex items-center gap-2 bg-white px-2 py-2 rounded-full shadow-md">
          <WalletConnect />
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
            <Link
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center focus:outline-none relative ${
                location.pathname === item.path
                  ? "text-blue-400"
                  : "text-gray-600 hover:text-blue-400"
              }`}
              onClick={() => setActive(idx)}
            >
              <item.icon className="mb-1 w-6 h-6" />
              <span className="text-xs">{item.label}</span>
              {location.pathname === item.path && (
                <div className="absolute -bottom-6 left-0 w-full h-1 bg-blue-400 rounded-full"></div>
              )}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}

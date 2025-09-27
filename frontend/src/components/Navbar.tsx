import { useState } from "react";
import { Bell, CreditCard, Map, Repeat, Search, Users, Target, UserCheck, TestTube } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { ENSAccountDisplay } from "./ConnectKitWallet";

const navItems = [
  { icon: CreditCard, label: "Cards", path: "/cards" },
  { icon: Users, label: "Social", path: "/social" },
  { icon: Target, label: "Campaigns", path: "/campaign" },
  { icon: UserCheck, label: "People", path: "/people" },
  { icon: Map, label: "Map", path: "/map" },
  { icon: Search, label: "Search", path: "/search" },
  { icon: TestTube, label: "Test", path: "/test" },
  { icon: Bell, label: "Notifications", path: "/notifications" },
];

export default function Navbar() {
  const location = useLocation();
  const getActiveIndex = () => {
    const currentPath = location.pathname;
    const index = navItems.findIndex((item) => item.path === currentPath);
    return index >= 0 ? index : 0;
  };
  // Using the state in the onClick handler
  const [_, setActive] = useState(getActiveIndex());

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="flex items-center justify-between px-12 py-6 bg-transparent fixed w-full top-0 left-0 z-50">
        {/* Left: Platform Logo */}
        <Link to="/" className="flex items-center">
          <img src="/logo.svg" alt="Platform Logo" className="h-12 mr-3" />
        </Link>

        {/* Right: ENS-Enhanced Wallet & Profile */}
        <div className="flex items-center gap-2">
          <ENSAccountDisplay />
        </div>
      </nav>

      {/* Bottom Tab Bar */}
      <nav className="w-full fixed left-0 lg:top-5 lg:bottom-auto bottom-5 px-6 z-40">
        <div className="w-full max-w-[600px] bg-white flex justify-around items-center py-6 mx-auto rounded-full shadow-xl">
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

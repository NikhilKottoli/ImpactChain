import { useState } from "react";
import {
  Bell,
  CreditCard,
  Map,
  Repeat,
  Search,
  Camera,
  Calendar,
  Shield,
  Database,
  Home,
  LogIn,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: Camera, label: "Feed", path: "/social-feed" },
  { icon: Calendar, label: "Campaigns", path: "/campaigns" },
  { icon: Shield, label: "Verify", path: "/attestations" },
  { icon: Database, label: "Data", path: "/datasets" },
];

const secondaryNavItems = [
  { icon: CreditCard, label: "Cards", path: "/cards" },
  { icon: LogIn, label: "Login", path: "/login" },
];

export default function Navbar() {
  const location = useLocation();

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
        <div className="flex items-center gap-2 bg-white px-2 py-2 rounded-full shadow-md border border-gray-200">
          <Link to="/login">
            <button className="px-4 py-2 rounded-full border border-gray-300 bg-gray-100 cursor-pointer font-medium text-sm hover:bg-gray-200">
              Connect Wallet
            </button>
          </Link>
          <img
            src="https://t4.ftcdn.net/jpg/04/31/64/75/360_F_431647519_usrbQ8Z983hTYe8zgA7t1XVc5fEtqcpa.jpg"
            alt="Profile"
            className="h-9 w-9 rounded-full object-cover border border-gray-300"
          />
        </div>
      </nav>

      {/* Bottom Tab Bar */}
      <nav className="w-full fixed left-0 lg:top-6 lg:bottom-auto bottom-5 px-6">
        <div className="w-full max-w-[700px] bg-white z-50 flex justify-around items-center py-4 mx-auto rounded-full shadow-xl border border-gray-200">
          {navItems.map((item, idx) => {
            const isActive =
              location.pathname === item.path ||
              (item.path === "/" && location.pathname === "/dashboard");
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex flex-col items-center focus:outline-none relative transition-colors ${
                  isActive
                    ? "text-blue-500"
                    : "text-gray-600 hover:text-blue-400"
                }`}
              >
                <item.icon className="mb-1 w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && (
                  <div className="absolute -bottom-4 left-0 w-full h-1 bg-blue-500 rounded-full"></div>
                )}
              </Link>
            );
          })}

          {/* Divider */}
          <div className="w-px h-8 bg-gray-300"></div>

          {/* Secondary Items */}
          {secondaryNavItems.map((item, idx) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex flex-col items-center focus:outline-none relative transition-colors ${
                  isActive
                    ? "text-purple-500"
                    : "text-gray-600 hover:text-purple-400"
                }`}
              >
                <item.icon className="mb-1 w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && (
                  <div className="absolute -bottom-4 left-0 w-full h-1 bg-purple-500 rounded-full"></div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

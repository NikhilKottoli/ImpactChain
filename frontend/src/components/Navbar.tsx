import { Bell, CreditCard, Map, Repeat, Search } from "lucide-react";

export default function Navbar() {
  return (
    <>
      <nav className="flex items-center justify-between px-8 py-3  bg- fixed w-full top-0 left-0 z-50 ">
        {/* Left: Platform Logo */}
        <div className="flex items-center">
          <img src="/logo.png" alt="Platform Logo" className="h-20  mr-3" />
          <span className="font-semibold text-xl"></span>
        </div>

        {/* Right: Wallet & Profile */}
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 rounded-md border border-gray-300 bg-gray-100 cursor-pointer font-medium">
            Connect Wallet
          </button>
          <img
            src="/profile.png"
            alt="Profile"
            className="h-9 w-9 rounded-full object-cover border border-gray-300"
          />
        </div>
      </nav>

      {/* Bottom Tab Bar */}
      <nav>
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-50 flex justify-around items-center py-2">
          <button className="flex flex-col items-center text-gray-600 hover:text-blue-600 focus:outline-none">
            <CreditCard className="mb-1 w-6 h-6" />
            <span className="text-xs">Cards</span>
          </button>
          <button className="flex flex-col items-center text-gray-600 hover:text-blue-600 focus:outline-none">
            <Map className="mb-1 w-6 h-6" />
            <span className="text-xs">Map</span>
          </button>
          <button className="flex flex-col items-center text-gray-600 hover:text-blue-600 focus:outline-none">
            <Search className="mb-1 w-6 h-6" />
            <span className="text-xs">Search</span>
          </button>
          <button className="flex flex-col items-center text-gray-600 hover:text-blue-600 focus:outline-none">
            <Bell className="mb-1 w-6 h-6" />
            <span className="text-xs">Notifications</span>
          </button>
          <button className="flex flex-col items-center text-gray-600 hover:text-blue-600 focus:outline-none">
            <Repeat className="mb-1 w-6 h-6" />
            <span className="text-xs">Transactions</span>
          </button>
        </div>
      </nav>
    </>
  );
}

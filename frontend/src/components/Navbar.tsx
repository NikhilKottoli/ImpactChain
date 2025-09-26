export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-3 border-b border-gray-200 bg-none fixed w-full top-0 left-0 z-50 ">
      {/* Left: Platform Logo */}
      <div className="flex items-center">
        <img src="/logo.png" alt="Platform Logo" className="h-10 w-10 mr-3" />
        <span className="font-semibold text-xl">Platform Name</span>
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
  );
}

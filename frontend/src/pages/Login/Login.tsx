import React from "react";
import { Link } from "react-router";
import FormButton from "../../components/FormButton";
import Input from "@/components/Input";
import { LockIcon, User } from "lucide-react";

export default function Login() {
  return (
    <div className=" h-full flex flex-col justify-center items-center py-20 bg-red overflow-hidden">
      <div
        className="rounded-[100px] flex w-full max-w-5xl h-full max-h-[800px] overflow-hidden"
        style={{
          boxShadow:
            "0 4px 24px 8px rgba(0,0,0,0.05), inset 0 1px 6px 0 rgba(0,0,0,0.08), inset 0 -1px 6px 0 rgba(0,0,0,0.05)",
          backdropFilter: "blur(6px)",
        }}
      >
        {/* LEFT PANEL → Light gradient */}
        <div
          className="flex-1 max-w-[550px] p-20 py-20 flex flex-col"
          style={{
            background:
              "linear-gradient(to bottom, rgba(255,255,255) 0%, rgba(230,245,255,0.7) 100%)",
          }}
        >
          <img src="/logo.png" alt="" className="w-30 h-20" />
          <div className="flex-1"></div>
          <div className="w-full mx-auto">
            <h2 className="text-2xl font-bold text-gray-900">Log In</h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your email and password to access your account
            </p>

            <Input
              type="text"
              placeholder="Enter email /username"
              icon={<User size={20} />}
              className="mt-4"
            />
            <Input
              type="password"
              placeholder="Enter your password"
              icon={<LockIcon size={20} />}
              className="mt-6"
            />

            <Link to="#">
              <FormButton>Sign Up</FormButton>
            </Link>

            <div className="text-center mt-6 text-xs text-gray-600">
              Already have an account?{" "}
              <Link to="#" className="text-violet-600 font-semibold">
                Login
              </Link>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL → Dark background */}
        <div
          className="flex-1 flex items-center justify-center relative"
          style={{
            background: "rgba(0,0,0,0.02)",
            backgroundPosition: "left",
            backgroundSize: "cover",
          }}
        >
          <div
            className="absolute bottom-0 right-0 rounded-tl-4xl"
            style={{
              width: "90%",
              height: "90%",
              borderTop: "2px solid rgba(0,0,0,0.1)",
              borderLeft: "2px solid rgba(0,0,0,0.1)",
              boxSizing: "border-box",
              paddingTop: "12px",
              paddingLeft: "12px",
              paddingBottom: "0",
              paddingRight: "0",
              background: "transparent",
            }}
          >
            <img
              className="w-full h-full object-cover rounded-tl-2xl "
              src="/demo.png"
              alt=""
              style={{ objectPosition: "left" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

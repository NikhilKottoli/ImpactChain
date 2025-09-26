import React from "react";
import { Link } from "react-router";
import FormButton from "../../components/FormButton";
import Input from "@/components/Input";
import { LockIcon, User } from "lucide-react";

export default function Login() {
  return (
    <div
      style={{
        background: `linear-gradient(rgba(255,255,255,0.4), rgba(255,255,255,0.4)), url('https://img.freepik.com/free-vector/gradient-grainy-gradient-background_23-2149922133.jpg?semt=ais_hybrid&w=740&q=80')`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
      className="min-h-screen flex flex-col justify-center items-center"
    >
      <div
        className="rounded-[28px] flex w-full max-w-7xl h-full max-h-[800px] overflow-hidden"
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
              "linear-gradient(to bottom, #f9f9f9e0 0%, #e1e1e1e0 100%)",
          }}
        >
          <img src="/logo.svg" alt="" className="w-10 h-10" />
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
            background: "rgba(0,0,0,0.6)",
            backgroundPosition: "left",
            backgroundSize: "cover",
          }}
        >
          <div
            className="absolute bottom-0 right-0 rounded-tl-4xl"
            style={{
              width: "90%",
              height: "90%",
              borderTop: "2px solid rgba(0,0,0,0.4)",
              borderLeft: "2px solid rgba(0,0,0,0.4)",
              boxSizing: "border-box",
              paddingTop: "12px",
              paddingLeft: "12px",
              paddingBottom: "0",
              paddingRight: "0",
              background: "transparent",
            }}
          >
            <img
              className="w-full h-full object-cover rounded-tl-2xl border border-black/30"
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

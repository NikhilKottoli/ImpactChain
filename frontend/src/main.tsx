import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./index.css";
import Home from "./pages/home/Home";
import App from "./App";
import Login from "./pages/Login/Login";
import Navbar from "./components/Navbar";
import BgDynamic from "./components/BgDynamic";

// import Home from "./pages/Home";
// import About from "./pages/About";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <div className="absolute inset-0 -z-10 h-full w-full bg-[#FBF3F0] [background:radial-gradient(125%_125%_at_50%_80%,#fff_40%,#26AFE0_100%)] ">
        <Navbar />
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            {/* <Route path="about" element={<About />} /> */}
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  </React.StrictMode>
);

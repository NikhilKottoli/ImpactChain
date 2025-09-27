import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

import "./index.css";
import { Web3Provider } from './config/wagmi';
import Home from "./pages/home/Home";
import App from "./App";
import Login from "./pages/Login/Login";
import Navbar from "./components/Navbar";
import Cards from "./pages/Cards/Cards";
import SocialMedia from "./pages/Social/SocialMedia";
import CreatePost from "./pages/Social/CreatePost";
import TestConfig from "./pages/Social/TestConfig";
import CampaignPage from "./pages/Campaign/CampaignPage";
import TestPage from "./pages/Test/TestPage";
import SearchPage from "./pages/Search/SearchPage";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Web3Provider>
      <BrowserRouter>
        <div className="absolute inset-0 -z-10 h-full w-full bg-[#FBF3F0] [background:radial-gradient(125%_125%_at_50%_80%,#FBF3F0_40%,#26AFE0_100%)] ">
          <Navbar />
          <Routes>
            <Route path="/" element={<App />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="cards" element={<Cards />} />
              <Route path="social" element={<SocialMedia />} />
              <Route path="createpost" element={<CreatePost />} />
              <Route path="campaign" element={<CampaignPage />} />
              <Route path="test" element={<TestPage />} />
              <Route path="search" element={<SearchPage />} />
              {/* <Route path="about" element={<About />} /> */}
            </Route>
          </Routes>
        </div>
      </BrowserRouter>
    </Web3Provider>
  </React.StrictMode>
);

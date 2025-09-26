import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./index.css";
import Home from "./pages/home/Home";
import App from "./App";
import Login from "./pages/Login/Login";
import Navbar from "./components/Navbar";
import Cards from "./pages/Cards/Cards";
import SocialFeed from "./pages/SocialFeed/SocialFeed";
import CampaignList from "./pages/Campaigns/CampaignList";
import AttestationDashboard from "./pages/Attestations/AttestationDashboard";
import DatasetMarketplace from "./pages/Datasets/DatasetMarketplace";
import CreatePost from "./pages/CreatePost/CreatePost";
import CreateCampaign from "./pages/CreateCampaign/CreateCampaign";
import Dashboard from "./pages/Dashboard/Dashboard";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <div className="absolute inset-0 -z-10 h-full w-full bg-[#FBF3F0] [background:radial-gradient(125%_125%_at_50%_80%,#FBF3F0_40%,#26AFE0_100%)] ">
        <Navbar />
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Dashboard />} />
            <Route path="home" element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="cards" element={<Cards />} />
            <Route path="social-feed" element={<SocialFeed />} />
            <Route path="campaigns" element={<CampaignList />} />
            <Route path="attestations" element={<AttestationDashboard />} />
            <Route path="datasets" element={<DatasetMarketplace />} />
            <Route path="create-post" element={<CreatePost />} />
            <Route path="create-campaign" element={<CreateCampaign />} />
            <Route path="dashboard" element={<Dashboard />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  </React.StrictMode>
);

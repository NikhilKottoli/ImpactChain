import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { MiniKitProvider } from "@worldcoin/minikit-js/minikit-provider";
import "./index.css";
// import Home from "./pages/home/Home"; // Commented out unused import
import App from "./App";
import Login from "./pages/Login/Login";
import Navbar from "./components/Navbar";
import Cards from "./pages/Cards/Cards";
import SocialMedia from "./pages/Social/SocialMedia";
import CreatePost from "./pages/Social/CreatePost";
import TestConfig from "./pages/Social/TestConfig";
import Dashboard from "./pages/Dashboard/Dashboard";
import LandingPage from "./pages/LandingPage/LandingPage";
import BgDynamic from "./components/BgDynamic";
import CampaignPage from "./pages/Campaign/CampaignPage";
import CreateCampaignForm from "./pages/Campaign/CampaignPageForm";
import CampaignFeed from "./pages/Campaign/CampaignFeed";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* The MiniKitProvider wraps the entire application, making the MiniKit 
      object available to all nested components. 
    */}
    <MiniKitProvider>
      <BrowserRouter>
        <BgDynamic>
          <Routes>
            {/* Dashboard route (with Navbar) */}
            <Route
              path="/dashboard"
              element={
                <>
                  <Navbar />
                  <Dashboard />
                </>
              }
            />

            {/* Main app routes */}
            <Route
              path="/"
              element={
                <div className="w-full h-screen">
                  <Outlet />
                </div>
              }
            >
              {/* Index route (no Navbar) */}
              <Route index element={<LandingPage />} />
              {/* All other routes (with Navbar or specific layout) */}
              <Route
                element={
                  <>
                    <App />
                    <Navbar />
                  </>
                }
              >
                <Route path="login" element={<Login />} />
                <Route path="cards" element={<Cards />} />
                <Route path="social" element={<SocialMedia />} />
                <Route path="createpost" element={<CreatePost />} />
                <Route path="testconfig" element={<TestConfig />} />
                <Route path="campaign" element={<CampaignPage />} />
                <Route path="create-campaign" element={<CreateCampaignForm />} />
              </Route>
            </Route>
            {/* Added CampaignFeed route which seems to be missing in the original Routes structure, based on imports */}
            <Route path="/campaign/feed" element={<CampaignFeed />} />
          </Routes>
        </BgDynamic>
      </BrowserRouter>
    </MiniKitProvider>
  </React.StrictMode>
);

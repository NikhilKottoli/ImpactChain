import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

import "./index.css";
import Home from "./pages/home/Home";
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
import DataPage from "./pages/Activity/Data";
import CampaignFeed from "./pages/Campaign/CampaignFeed";
import MyDatasetsPage from "./pages/MyDatasets";
// import Home from "./pages/Home";
// import About from "./pages/About";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
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
            {/* All other routes (with Navbar) */}
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
              <Route path="marketplace" element={<DataPage />} />
              <Route path="my-datasets" element={<MyDatasetsPage />} />
            </Route>
          </Route>
        </Routes>
      </BgDynamic>
    </BrowserRouter>
  </React.StrictMode>
);

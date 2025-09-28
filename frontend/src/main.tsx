import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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
import CampaignFeed from "./pages/Campaign/CampaignFeed";
import DAOHomepage from "./pages/DAO/DAOhomepage";
import VotingPage from "./pages/DAO/Votingpage";
import SearchPage from "./pages/Search/SearchPage";
import SubdomainPage from "./pages/Subdomain/SubdomainPage";
import ProfileBuilderPage from "./pages/ProfileBuilder/ProfileBuilderPage";
import SocialFeaturesPage from "./pages/SocialFeatures/SocialFeaturesPage";
import CampaignHubPage from "./pages/CampaignHub/CampaignHubPage";
import { config } from "./lib/wagmi";
// import Home from "./pages/Home";
// import About from "./pages/About";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
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
              <Route path="dao" element={<DAOHomepage />} />
              <Route path="voting/:uuid" element={<VotingPage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="subdomains" element={<SubdomainPage />} />
              <Route path="profile-builder" element={<ProfileBuilderPage />} />
              <Route path="social-features" element={<SocialFeaturesPage />} />
              <Route path="campaign-hub" element={<CampaignHubPage />} />
              <Route path="campaign/:uuid" element={<CampaignFeed />} />
            </Route>
          </Route>
        </Routes>
      </BgDynamic>
    </BrowserRouter>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);

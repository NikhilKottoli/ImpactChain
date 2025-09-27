import { ArrowRight } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <main>
      <div className="w-full h-screen relative bg-[#FBF3F0] ">
        <div className="absolute">
          <Link
            to="/"
            className="flex items-center z-[100] fixed top-10 left-10"
          >
            <img src="/logo.svg" alt="Platform Logo" className="h-12 mr-3" />
            {/* <div>
                  <span className="font-bold text-xl text-gray-900">ImpactDAO</span>
                  <p className="text-xs text-gray-600">Social Impact Platform</p>
                </div> */}
          </Link>
          {/* Right: Wallet & Profile */}
          <div className="flex items-center gap-2 bg-white px-2 py-2 rounded-full shadow-md z-[100]  fixed top-10 right-10">
            <img
              src="https://t4.ftcdn.net/jpg/04/31/64/75/360_F_431647519_usrbQ8Z983hTYe8zgA7t1XVc5fEtqcpa.jpg"
              alt="Profile"
              className="h-9 w-9 rounded-full object-cover border border-gray-300"
            />
          </div>
        </div>
        <img
          className=" absolute bottom-0 left-0  h-[50%] w-full object-cover"
          src="heropattern.png"
          alt=""
        />
        <div className="absolute inset-0 z-10 h-full w-full bg-[#fbf3f000] [background:radial-gradient(125%_125%_at_50%_80%,#FBF3F000_40%,#26AFE0_100%)]"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 px-4">
          <div className="relative pt-24 md:pt-120">
            <div className="mx-auto max-w-7xl px-6">
              <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                {/* Announcement banner */}
                <a
                  href="#"
                  className="bg-background group mx-auto flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md transition-colors duration-300"
                >
                  <span className="text-sm">Check out the ne features</span>
                  <span className="block h-4 w-0.5 border-l "></span>
                  <div className=" group-hover:bg-gray-50 size-6 overflow-hidden rounded-full duration-500">
                    <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                      <span className="flex size-6">
                        <ArrowRight className="m-auto size-3" />
                      </span>
                      <span className="flex size-6">
                        <ArrowRight className="m-auto size-3" />
                      </span>
                    </div>
                  </div>
                </a>

                {/* Main heading */}
                <h1 className="mx-auto mt-8 max-w-4xl text-balance text-5xl font-medium shadow-xl md:text-7xl lg:mt-16">
                  ImpactChain: Verify Social Good
                </h1>

                {/* Subheading */}
                <p className="mx-auto mt-8 max-w-2xl text-balance text-lg text-black/40">
                  Create campaigns, document your social impact activities, and
                  earn rewards through verified attestations on a decentralized
                  platform for positive change.
                </p>

                {/* CTA buttons */}
                <div className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row">
                  <div className="bg-black/10 rounded-xl border p-0.5">
                    <Link to="/social">
                      <button className="px-8 py-3 bg-[#26AFE0] text-white font-semibold rounded-lg hover:bg-[#1c99c6] transition-all shadow-lg">
                        Explore Campaigns
                      </button>
                    </Link>
                  </div>
                  <Link to="/create">
                    <button className="px-8 py-3 bg-white text-[#26AFE0] font-semibold rounded-lg hover:bg-gray-100 transition-all shadow-lg">
                      Create Impact Post
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Hero image */}
            <div className="relative -mr-56 mt-8 overflow-hidden px-2 sm:mr-0 sm:mt-12 md:mt-20">
              <div className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl border p-4 shadow-lg bg-white">
                <img
                  className="aspect-[15/8] relative rounded-2xl w-full"
                  src="/dashboard-preview.png"
                  alt="Platform dashboard preview"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

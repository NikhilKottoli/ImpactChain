import React from "react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <main>
      <div className="w-full">
        <Link to={"/social"}>Go to Social</Link>
      </div>
    </main>
  );
}

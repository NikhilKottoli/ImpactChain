import { Outlet } from "react-router-dom";


export default function App() {

  return (
    <div className="pb-32 lg:pt-32 lg:pb-0 pt-0 h-full">
      <Outlet />
    </div>
  );
}

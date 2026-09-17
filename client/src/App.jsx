import Navbar from "./components/Navbar";
import Hero from './pages/Hero';
import ScanningPage from "./pages/ScanningPage";
import { Routes, Route, useLocation } from "react-router-dom";
import Report from "./pages/Report";
import AuthPage from "./pages/AuthPage";
import LandingPage from "./pages/LandingPage";
import { Toaster } from "react-hot-toast";

// Create a small wrapper component to handle the conditional navbar rendering
function Layout() {
  const location = useLocation();
  
  // Check if the current route is the landing page ('/')
  const isLandingPage = location.pathname === "/";

  return (
    <div>
      {/* Render Navbar only if it's NOT the landing page */}
      {!isLandingPage && (
        <div>
          <Navbar />
        </div>
      )}
      
      <div className="mt-[80px]">
        <Routes>
          <Route index element={<LandingPage />} />
          <Route path="/dash" element={<Hero />} />
          <Route path="/scanning" element={<ScanningPage />} />
          <Route path="/report" element={<Report />} />
          <Route path="/login" element={<AuthPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Toaster />
      <Layout />
    </>
  );
}
import Navbar from "./components/Navbar";
import Hero from './pages/Hero';
import ScanningPage from "./pages/ScanningPage";
import { Routes, Route } from "react-router-dom";
import Report from "./pages/Report";
import AuthPage from "./pages/AuthPage";
import { Toaster } from "react-hot-toast";
export default function App() {
    return (
       <div>
         <div>
             <Navbar/>
         </div>
            <div>
    <Routes>
        <Route path="/" index element={<Hero/>}/>
        <Route path="/scanning" element={<ScanningPage/>}/>
        <Route path="/report" element={<Report/>}/>
        <Route path="/login" element={<AuthPage/>}/>
        </Routes>
             </div>

       </div>
    );
}
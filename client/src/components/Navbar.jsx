import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FiMenu, FiClock, FiBookOpen, FiArrowUpRight } from 'react-icons/fi';
import { RiLoginCircleLine, RiLogoutCircleLine } from "react-icons/ri";
import { GiCyberEye } from "react-icons/gi";
import NavSelector from './NavSelector';
import { AuthContext } from '../context/AuthContext';
export default function Navbar({ onToggleSidebar }) {
  const { userEmail, logout } = useContext(AuthContext);
  return (
    <header className="w-full h-14 border-b border-slate-200/80 bg-white/90 backdrop-blur-md py-9 px-4 sm:px-6 flex items-center justify-between fixed top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      
      {/* Left side: Brand + Mobile Toggle + Breadcrumb */}
      <div className="flex items-center gap-3 sm:gap-4 ">
        <button 
          type="button"
          onClick={onToggleSidebar}
          className="md:hidden text-slate-500 hover:text-slate-900 p-1 rounded-md hover:bg-slate-100 transition-colors"
          aria-label="Toggle Sidebar"
        >
          <FiMenu className="text-[18px]" />
        </button>

        {/* Brand Logo & Title */}
        <div className="flex items-center gap-2.5 tracking-tight text-slate-900">
          <div className="w-8 h-8 rounded-lg bg-slate-950 text-white flex items-center justify-center shadow-xs shrink-0">
            <GiCyberEye className="text-[20px]" />
          </div>
          <div className="flex flex-col hidden sm:flex">
            <span className="text-sm font-semibold tracking-tight leading-none">Secura</span>
            <span className="text-[9px] text-slate-400 font-mono mt-0.5 tracking-wider uppercase">Audit Platform</span>
          </div>
        </div>

        {/* Breadcrumb Indicator */}
        <div className="hidden lg:flex items-center gap-2 text-xs border-l border-slate-200 pl-3 ml-1">
          <span className="text-slate-400 font-medium">Secura</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-800 font-semibold flex items-center gap-1.5">
            Surface Diagnostic
            <span className="px-1.5 py-0.2 text-[10px] rounded bg-slate-100 text-slate-600 border border-slate-200 font-mono">
              PASSIVE ONLY
            </span>
          </span>
        </div>
      </div>

      {/* Right side: Telemetry & Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* Select the options  */}
        <NavSelector/>

        {/* History Button */}
        <Link 
          to="/history" 
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-950 border border-slate-200/90 shadow-2xs transition-all active:scale-[0.98]"
        >
          <FiClock className="text-slate-500 text-[13px]" />
          <span className="hidden sm:inline">History</span>
          <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-slate-100 text-slate-500">24</span>
        </Link>

        {/* Docs Button */}
        <Link 
          to="/docs" 
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium text-slate-900 bg-slate-100 hover:bg-slate-200/80 border border-slate-300/70 shadow-2xs transition-all active:scale-[0.98]"
        >
          <FiBookOpen className="text-slate-700 text-[13px]" />
          <span className="hidden sm:inline">Docs</span>
          <FiArrowUpRight className="text-slate-500 text-[13px]" />
        </Link>

        {/* Login / User Button */}
        {userEmail ? (
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-700 hidden sm:inline">
              {userEmail.split('@')[0]}
            </span>
            <button 
              onClick={logout}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-red-500 hover:bg-red-600 shadow-2xs transition-all active:scale-[0.98]"
            >
              <RiLogoutCircleLine className="text-white text-[14px]" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <Link 
            to="/login" 
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-[#1a1a1a] hover:bg-[#747E91] shadow-2xs transition-all active:scale-[0.98]"
          >
            <RiLoginCircleLine className="text-white text-[14px]" />
            <span>Login</span>
          </Link>
        )}
      </div>
    </header>
  );
}
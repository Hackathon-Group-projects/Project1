import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiCompass, 
  FiChevronDown, 
  FiHome, 
  FiLoader, 
  FiShield, 
  FiClock, 
  FiLock, 
  FiCode, 
  FiCpu, 
  FiAlertCircle, 
  FiCrosshair,
  FiBookOpen,
  FiFileText
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';

export default function NavSelector() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState('/dashboard');

  const handleChange = (e) => {
    const path = e.target.value;
    setSelected(path);

    if (path.startsWith('/')) {
      navigate(path);
    } else {
      // For hash navigation like #scanning, #report
      window.location.hash = path;
    }
  };

  return (
    <div className="relative inline-block text-[13px] font-sans">
      <div className="relative flex items-center">
        {/* Left Navigation Icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
          <FiCompass className="text-[15px]" />
        </div>

        {/* Dropdown Select with optgroups */}
        <select
          value={selected}
          onChange={handleChange}
          aria-label="Navigate Platform"
          className="w-56 pl-9 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium text-xs shadow-2xs hover:border-slate-300 focus:outline-none focus:border-[#8C95A6] transition-all appearance-none cursor-pointer"
        >
          {/* Main App Views */}
          <optgroup label="App Views" className="text-slate-400 text-[10px] font-mono uppercase font-semibold">
            <option value="/dash" className="text-slate-800 text-xs">Landing </option>
            <option value="/scanning" className="text-slate-800 text-xs">Scanning</option>
            <option value="/report" className="text-slate-800 text-xs">Security Report</option>
          </optgroup>

         
        </select>

        {/* Right Arrow Icon */}
        <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400">
          <FiChevronDown className="text-[13px]" />
        </div>
      </div>
    </div>
  );
}
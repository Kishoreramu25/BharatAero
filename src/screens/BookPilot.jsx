import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ArrowLeft, Calendar, MapPin, Clock, ChevronRight, 
  DollarSign, Briefcase, Shield, FileText, AlertTriangle 
} from 'lucide-react';

export default function BookPilot() {
  const { navigate, addBooking } = useApp();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Agricultural Survey');
  const [customCategory, setCustomCategory] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('12:00');
  const [duration, setDuration] = useState('3');
  const [budget, setBudget] = useState('5000'); // Higher number suitable for INR
  const [droneModel, setDroneModel] = useState('DJI Mavic 3 Enterprise (Thermal)');
  const [customDroneModel, setCustomDroneModel] = useState('');
  const [hazards, setHazards] = useState('');
  const [description, setDescription] = useState('');
  const [certifications, setCertifications] = useState('FAA Part 107 / DGCA Certified');

  // Map Integration State
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);

  // Load Leaflet Map CSS/JS via CDN dynamically
  useEffect(() => {
    if (window.L) {
      setMapLoaded(true);
      return;
    }

    // Load Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    // Load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => {
      setMapLoaded(true);
    };
    document.body.appendChild(script);
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapLoaded || !window.L) return;

    // Center map on India (e.g. Pune/Mumbai region) by default
    const defaultLat = 18.5204;
    const defaultLng = 73.8567;

    const map = window.L.map('location-map', {
      center: [defaultLat, defaultLng],
      zoom: 13,
      zoomControl: false // custom controls used
    });

    // Tile Layers
    const streetTiles = window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    });

    const satelliteTiles = window.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: '© Esri Satellite'
    });

    // Add satellite tiles as default (looks premium 4k)
    satelliteTiles.addTo(map);

    // Default pin marker
    const customIcon = window.L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const marker = window.L.marker([defaultLat, defaultLng], { icon: customIcon, draggable: true }).addTo(map);

    const updatePositionInfo = async (lat, lng) => {
      const coordsString = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      setLocation(coordsString);

      // Attempt reverse-geocoding
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`);
        if (response.ok) {
          const data = await response.json();
          if (data.display_name) {
            setLocation(data.display_name);
          }
        }
      } catch (err) {
        console.warn('Geocoder failed, falling back to coords string.');
      }
    };

    // Update marker and location on map click
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      map.panTo([lat, lng]);
      updatePositionInfo(lat, lng);
    });

    // Update on marker drag
    marker.on('dragend', () => {
      const position = marker.getLatLng();
      map.panTo(position);
      updatePositionInfo(position.lat, position.lng);
    });

    setMapInstance({ map, marker });

    return () => {
      map.remove();
    };
  }, [mapLoaded]);

  // Search Address & Move Marker
  const handleSearchLocation = async () => {
    if (!location.trim()) return;
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          if (mapInstance) {
            const { map, marker } = mapInstance;
            map.setView([lat, lon], 14);
            marker.setLatLng([lat, lon]);
          }
        }
      }
    } catch (e) {
      console.warn('Geocoding search failed:', e);
    }
  };

  const formatTimeTo12Hour = (timeStr) => {
    if (!timeStr) return '';
    const [hoursStr, minutesStr] = timeStr.split(':');
    let hours = parseInt(hoursStr, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedHours = hours < 10 ? `0${hours}` : hours;
    return `${formattedHours}:${minutesStr} ${ampm}`;
  };

  const handleMagicFill = () => {
    setTitle('50-Acre Paddy Crop Spraying');
    setCategory('Agricultural Survey');
    setCustomCategory('');
    setLocation('Hadapsar, Pune, Maharashtra, 411028, India');
    setDate('2026-06-20');
    setStartTime('08:00');
    setEndTime('11:00');
    setDuration('3');
    setBudget('12500');
    setDroneModel('DJI Agras T40 / T50 (Agriculture)');
    setCustomDroneModel('');
    setHazards('High-tension power lines along the eastern boundary, tall coconut trees near takeoff point.');
    setDescription('Spraying biological pesticide over 50 acres of paddy crop field. Drone operator must maintain low-altitude flight (approx 3-4 meters above crop canopy) and coordinate with ground supervisors for battery swapping and payload refilling.');
    setCertifications('DGCA Pilot License, Category Small Rotorcraft, Third-Party Drone Insurance (min 10 Lakhs)');

    if (mapInstance) {
      const { map, marker } = mapInstance;
      const testLat = 18.5089;
      const testLng = 73.9259;
      map.setView([testLat, testLng], 14);
      marker.setLatLng([testLat, testLng]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalCategory = category === 'Other' ? customCategory.trim() : category;
    const finalDroneModel = droneModel === 'Other' ? customDroneModel.trim() : droneModel;
    const formattedTimeSlot = `${formatTimeTo12Hour(startTime)} - ${formatTimeTo12Hour(endTime)} IST`;
    
    addBooking({
      title: title.trim(),
      type: finalCategory || 'Custom Flight Mission',
      date,
      timeSlot: formattedTimeSlot,
      location: location.trim(),
      duration: Number(duration),
      price: Number(budget),
      droneModel: finalDroneModel || 'Custom Drone Model',
      hazards: hazards.trim() || 'None reported',
      description: description.trim(),
      certifications: certifications.trim(),
      pilotName: 'Unassigned',
      pilotImage: null,
      status: 'Pending'
    });
    navigate('booking_confirmed');
  };

  return (
    <div className="flex-1 flex flex-col justify-between bg-slate-50 text-[#1b1c1b] h-full pb-6 relative select-none" style={{
      backgroundImage: `radial-gradient(rgba(183, 198, 194, 0.2) 1px, transparent 1px)`,
      backgroundSize: '16px 16px'
    }}>
      
      {/* Top App Bar */}
      <header className="sticky top-0 bg-white/85 backdrop-blur-md flex items-center justify-between px-4 h-[64px] border-b border-[#b7c6c2]/15 z-40">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('client_dashboard', 'home')}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-neutral-100 transition-colors"
          >
            <ArrowLeft size={18} className="text-[#000201]" />
          </button>
          <span className="ml-3 text-base font-headline font-black text-[#000201] tracking-tight">Create Mission Request</span>
        </div>
        <button
          type="button"
          onClick={handleMagicFill}
          className="text-[9px] bg-red-600 hover:bg-red-700 active:scale-95 text-white px-3 py-1.5 rounded-full font-headline font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm shadow-red-200"
        >
          ✨ Magic Fill
        </button>
      </header>

      {/* Main Form */}
      <main className="flex-grow px-5 pt-4 overflow-y-auto no-scrollbar pb-6">
        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="space-y-5">
            
            {/* Section 1: Mission Identity */}
            <div className="bg-white rounded-3xl border border-neutral-200/50 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.025)] hover:-translate-y-0.5 transition-all duration-300 space-y-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ca0013] to-red-400"></div>
              
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <h4 className="text-[10px] font-headline font-black uppercase tracking-widest text-[#ca0013] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">assignment</span>
                  1. Mission Identity & Operation
                </h4>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-headline font-bold text-[#747874] uppercase tracking-wider ml-1">
                  Mission / Job Title
                </label>
                <div className="relative flex items-center bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-200/70 rounded-2xl overflow-hidden px-4 py-0.5 transition-all duration-200 focus-within:border-[#ca0013] focus-within:bg-white focus-within:ring-4 focus-within:ring-red-50">
                  <Briefcase size={15} className="text-neutral-400 mr-2.5 shrink-0" />
                  <input 
                    type="text" 
                    placeholder="e.g. 50-Acre Paddy Crop Spraying"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-transparent border-none py-3.5 text-xs outline-none font-body text-[#1b1c1b] placeholder-neutral-400/80"
                    required
                  />
                </div>
              </div>

              {/* Category / Industry */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-headline font-bold text-[#747874] uppercase tracking-wider ml-1">
                  Operation Type / Category
                </label>
                <div className="relative flex items-center">
                  <select 
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      if (e.target.value !== 'Other') {
                        setCustomCategory('');
                      }
                    }}
                    className="w-full bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-200/70 py-3.5 pl-4 pr-10 rounded-2xl text-xs font-body outline-none appearance-none cursor-pointer transition-all duration-200 focus:border-[#ca0013] focus:bg-white focus:ring-4 focus:ring-red-50 text-[#1b1c1b]"
                  >
                    <option value="Agricultural Survey">Agricultural Survey & Spraying</option>
                    <option value="Thermal Roof Inspection">Thermal & Roof Inspection</option>
                    <option value="Infrastructure Inspection">Infrastructure & Bridge Inspection</option>
                    <option value="Real Estate Promo">Real Estate & Cinema Filming</option>
                    <option value="Aerial Mapping">Aerial Orthomosaic Mapping</option>
                    <option value="Surveillance">Surveillance & Security Patrol</option>
                    <option value="Logistics/Delivery">UAV Logistics & Package Delivery</option>
                    <option value="Disaster Relief / Search & Rescue">Disaster Relief & Search & Rescue</option>
                    <option value="Mining & Quarry Survey">Mining & Volume Estimation</option>
                    <option value="Wind Turbine & Solar Inspection">Wind Turbine & Solar Panel Inspection</option>
                    <option value="Environmental & Forestry">Environmental & Forestry Monitoring</option>
                    <option value="Powerline & Pipeline Patrol">Powerline & Pipeline Patrol</option>
                    <option value="Construction Site Monitoring">Construction Progress Tracking</option>
                    <option value="Other">Other (Specify below...)</option>
                  </select>
                  <div className="absolute right-4 pointer-events-none text-neutral-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              </div>

              {/* Custom Category Input (Only shows if category is 'Other') */}
              {category === 'Other' && (
                <div className="space-y-1.5 animate-fade-in">
                  <label className="block text-[10px] font-headline font-bold text-[#ca0013] uppercase tracking-wider ml-1">
                    Specify Custom Operation Type
                  </label>
                  <div className="relative flex items-center bg-white border border-[#ca0013] rounded-2xl overflow-hidden px-4">
                    <input 
                      type="text" 
                      placeholder="Enter custom operation type (e.g. Wildlife Tracking)"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="w-full bg-transparent border-none py-3.5 text-xs outline-none font-body text-[#1b1c1b]"
                      required={category === 'Other'}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Time & Budget */}
            <div className="bg-white rounded-3xl border border-neutral-200/50 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.025)] hover:-translate-y-0.5 transition-all duration-300 space-y-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 to-[#128807]"></div>
              
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <h4 className="text-[10px] font-headline font-black uppercase tracking-widest text-[#ca0013] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                  2. Dispatch Parameters & Financials
                </h4>
              </div>

              {/* Date Field */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-headline font-bold text-[#747874] uppercase tracking-wider ml-1">
                  Mission Date
                </label>
                <div className="relative flex items-center bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-200/70 rounded-2xl overflow-hidden px-4 py-0.5 transition-all duration-200 focus-within:border-[#ca0013] focus-within:bg-white focus-within:ring-4 focus-within:ring-red-50">
                  <Calendar size={15} className="text-neutral-400 mr-2.5 shrink-0" />
                  <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-transparent border-none py-3.5 text-xs outline-none font-body text-[#1b1c1b]"
                    required
                  />
                </div>
              </div>

              {/* Time Slot (Clock Pickers) */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-headline font-bold text-[#747874] uppercase tracking-wider ml-1">
                  Deploy Time Window (IST)
                </label>
                <div className="flex items-center gap-3">
                  {/* Start Time */}
                  <div className="flex-1 relative flex items-center bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-200/70 rounded-2xl overflow-hidden px-3.5 py-0.5 transition-all duration-200 focus-within:border-[#ca0013] focus-within:bg-white focus-within:ring-4 focus-within:ring-red-50">
                    <Clock size={14} className="text-neutral-400 mr-2 shrink-0" />
                    <span className="text-[9px] font-bold text-neutral-400 mr-1.5 uppercase shrink-0">Start</span>
                    <input 
                      type="time" 
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full bg-transparent border-none py-3.5 text-xs outline-none font-body text-[#1b1c1b] cursor-pointer"
                      required
                    />
                  </div>
                  
                  <span className="text-[10px] font-headline font-bold text-[#747874] uppercase shrink-0">to</span>

                  {/* End Time */}
                  <div className="flex-1 relative flex items-center bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-200/70 rounded-2xl overflow-hidden px-3.5 py-0.5 transition-all duration-200 focus-within:border-[#ca0013] focus-within:bg-white focus-within:ring-4 focus-within:ring-red-50">
                    <Clock size={14} className="text-neutral-400 mr-2 shrink-0" />
                    <span className="text-[9px] font-bold text-neutral-400 mr-1.5 uppercase shrink-0">End</span>
                    <input 
                      type="time" 
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full bg-transparent border-none py-3.5 text-xs outline-none font-body text-[#1b1c1b] cursor-pointer"
                      required
                    />
                  </div>
                </div>
                
                {/* AM/PM Live Preview Badge */}
                <div className="pt-1 flex justify-end">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-[#ca0013] text-[9px] font-bold font-headline uppercase tracking-wider border border-red-100/40 rounded-xl">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ca0013] animate-pulse"></span>
                    Selected: {formatTimeTo12Hour(startTime)} - {formatTimeTo12Hour(endTime)} IST
                  </span>
                </div>
              </div>

              {/* Grid for Budget and Duration */}
              <div className="grid grid-cols-2 gap-4">
                {/* Budget */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-headline font-bold text-[#747874] uppercase tracking-wider ml-1">
                    Budget Offer (INR)
                  </label>
                  <div className="relative flex items-center bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-200/70 rounded-2xl overflow-hidden px-3.5 py-0.5 transition-all duration-200 focus-within:border-[#ca0013] focus-within:bg-white focus-within:ring-4 focus-within:ring-red-50">
                    <span className="text-xs font-black text-neutral-400 mr-1.5 shrink-0">₹</span>
                    <input 
                      type="number" 
                      placeholder="e.g. 15000"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full bg-transparent border-none py-3.5 text-xs outline-none font-body text-[#1b1c1b]"
                      required
                    />
                  </div>
                </div>

                {/* Duration */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-headline font-bold text-[#747874] uppercase tracking-wider ml-1">
                    Est. Flight Hours
                  </label>
                  <div className="relative flex items-center bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-200/70 rounded-2xl overflow-hidden px-3.5 py-0.5 transition-all duration-200 focus-within:border-[#ca0013] focus-within:bg-white focus-within:ring-4 focus-within:ring-red-50">
                    <Clock size={14} className="text-neutral-400 mr-2 shrink-0" />
                    <input 
                      type="number" 
                      placeholder="e.g. 3"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full bg-transparent border-none py-3.5 text-xs outline-none font-body text-[#1b1c1b]"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Equipment & Location */}
            <div className="bg-white rounded-3xl border border-neutral-200/50 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.025)] hover:-translate-y-0.5 transition-all duration-300 space-y-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#128807] to-emerald-400"></div>
              
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <h4 className="text-[10px] font-headline font-black uppercase tracking-widest text-[#ca0013] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">my_location</span>
                  3. Flight Zone & Payload Specifications
                </h4>
              </div>

              {/* Location Field */}
              <div className="space-y-2">
                <label className="block text-[10px] font-headline font-bold text-[#747874] uppercase tracking-wider ml-1">
                  Mission Location / Area
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-grow flex items-center bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-200/70 rounded-2xl overflow-hidden px-4 py-0.5 transition-all duration-200 focus-within:border-[#ca0013] focus-within:bg-white focus-within:ring-4 focus-within:ring-red-50">
                    <MapPin size={15} className="text-neutral-400 mr-2 shrink-0" />
                    <input 
                      type="text" 
                      placeholder="Enter area, city, or coordinates"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-transparent border-none py-3.5 text-xs outline-none font-body text-[#1b1c1b]"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSearchLocation}
                    className="bg-[#000201] text-white hover:bg-neutral-800 text-[10px] font-headline font-bold px-6 py-4 rounded-2xl uppercase transition-all cursor-pointer shrink-0 active:scale-95 shadow-md shadow-neutral-950/5"
                    title="Locate on map"
                  >
                    Locate
                  </button>
                </div>
                
                {/* Premium Map Container */}
                <div className="relative border border-neutral-200 bg-neutral-50 h-[380px] w-full overflow-hidden mt-3 rounded-3xl shadow-md">
                  {!mapLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-neutral-50 z-10 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                      Loading Interactive Map...
                    </div>
                  )}
                  
                  {/* Leaflet map div */}
                  <div id="location-map" className="w-full h-full z-0"></div>
                </div>
              </div>

              {/* Required UAV Category */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-headline font-bold text-[#747874] uppercase tracking-wider ml-1">
                  Required UAV / Drone Model
                </label>
                <div className="relative flex items-center">
                  <select 
                    value={droneModel}
                    onChange={(e) => {
                      setDroneModel(e.target.value);
                      if (e.target.value !== 'Other') {
                        setCustomDroneModel('');
                      }
                    }}
                    className="w-full bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-200/70 py-3.5 pl-4 pr-10 rounded-2xl text-xs font-body outline-none appearance-none cursor-pointer transition-all duration-200 focus:border-[#ca0013] focus:bg-white focus:ring-4 focus:ring-red-50 text-[#1b1c1b]"
                  >
                    <option value="DJI Mavic 3 Enterprise (Thermal)">DJI Mavic 3 Enterprise (Thermal)</option>
                    <option value="DJI Agras T40 / T50 (Agriculture)">DJI Agras T40 / T50 (Agriculture)</option>
                    <option value="DJI Matrice 300 / 350 RTK (Mapping/Survey)">DJI Matrice 300 / 350 RTK (Mapping/Survey)</option>
                    <option value="DJI Inspire 3 / Custom Cinematic FPV">DJI Inspire 3 / Custom Cinematic FPV</option>
                    <option value="DJI Matrice 30T (Weatherproof Thermal)">DJI Matrice 30T (Weatherproof Thermal)</option>
                    <option value="DJI FlyCart 30 (Delivery/Logistics)">DJI FlyCart 30 (Delivery/Logistics)</option>
                    <option value="Skydio X10 (Autonomous Survey)">Skydio X10 (Autonomous Survey)</option>
                    <option value="Autel Robotics EVO II Dual 640T (Thermal)">Autel Robotics EVO II Dual 640T (Thermal)</option>
                    <option value="Custom Hexacopter (Heavy Lift Payload)">Custom Hexacopter (Heavy Lift Payload)</option>
                    <option value="Custom Fixed-Wing (Long Range Mapping)">Custom Fixed-Wing (Long Range Mapping)</option>
                    <option value="Other">Other (Specify below...)</option>
                  </select>
                  <div className="absolute right-4 pointer-events-none text-neutral-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              </div>

              {/* Custom Drone Model Input (Only shows if droneModel is 'Other') */}
              {droneModel === 'Other' && (
                <div className="space-y-1.5 animate-fade-in">
                  <label className="block text-[10px] font-headline font-bold text-[#ca0013] uppercase tracking-wider ml-1">
                    Specify Custom Drone Model
                  </label>
                  <div className="relative flex items-center bg-white border border-[#ca0013] rounded-2xl overflow-hidden px-4">
                    <input 
                      type="text" 
                      placeholder="Enter custom UAV model (e.g. DJI Phantom 4 RTK)"
                      value={customDroneModel}
                      onChange={(e) => setCustomDroneModel(e.target.value)}
                      className="w-full bg-transparent border-none py-3.5 text-xs outline-none font-body text-[#1b1c1b]"
                      required={droneModel === 'Other'}
                    />
                  </div>
                </div>
              )}

              {/* Certifications Required */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-headline font-bold text-[#747874] uppercase tracking-wider ml-1">
                  Pilot Certifications Required
                </label>
                <div className="relative flex items-center bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-200/70 rounded-2xl overflow-hidden px-4 py-0.5 transition-all duration-200 focus-within:border-[#ca0013] focus-within:bg-white focus-within:ring-4 focus-within:ring-red-50">
                  <Shield size={15} className="text-neutral-400 mr-2.5 shrink-0" />
                  <input 
                    type="text" 
                    placeholder="e.g. DGCA Certified, FAA Part 107, Flight Insurance"
                    value={certifications}
                    onChange={(e) => setCertifications(e.target.value)}
                    className="w-full bg-transparent border-none py-3.5 text-xs outline-none font-body text-[#1b1c1b]"
                    required
                  />
                </div>
              </div>

              {/* Site Hazards */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-headline font-bold text-[#747874] uppercase tracking-wider ml-1">
                  Site Hazards & Airspace Obstacles
                </label>
                <div className="relative flex items-center bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-200/70 rounded-2xl overflow-hidden px-4 py-0.5 transition-all duration-200 focus-within:border-[#ca0013] focus-within:bg-white focus-within:ring-4 focus-within:ring-red-50">
                  <AlertTriangle size={15} className="text-neutral-400 mr-2.5 shrink-0" />
                  <input 
                    type="text" 
                    placeholder="e.g. Tall trees, high tension power lines nearby"
                    value={hazards}
                    onChange={(e) => setHazards(e.target.value)}
                    className="w-full bg-transparent border-none py-3.5 text-xs outline-none font-body text-[#1b1c1b]"
                  />
                </div>
              </div>

              {/* Scope of Work */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-headline font-bold text-[#747874] uppercase tracking-wider ml-1">
                  Detailed Scope of Work
                </label>
                <div className="relative flex bg-neutral-50/50 hover:bg-neutral-50 border border-neutral-200/70 rounded-2xl overflow-hidden px-4 py-2 transition-all duration-200 focus-within:border-[#ca0013] focus-within:bg-white focus-within:ring-4 focus-within:ring-red-50">
                  <FileText size={15} className="text-neutral-400 mr-2.5 mt-1 shrink-0" />
                  <textarea 
                    placeholder="Provide details about the mission layout, objectives, and any deliverable files (e.g. Orthomosaic TIFs, RAW footage, PDF survey reports)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full bg-transparent border-none py-1.5 text-xs outline-none font-body text-[#1b1c1b] resize-none"
                    required
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Confirm Button */}
          <button 
            type="submit"
            className="w-full bg-gradient-to-r from-[#ca0013] to-[#a3000b] text-white py-4.5 rounded-2xl font-headline font-bold text-xs hover:shadow-xl hover:shadow-red-500/25 active:scale-[0.99] transition-all tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer mt-8 shadow-md"
          >
            <span>Confirm & Broadcast Mission</span>
            <ChevronRight size={15} />
          </button>

        </form>
      </main>

    </div>
  );
}


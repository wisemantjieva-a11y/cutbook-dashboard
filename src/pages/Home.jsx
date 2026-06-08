import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// Dynamically use live environment backend URL or fallback to local
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function Home() {
  const [shops, setShops] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedArea, setSelectedArea] = useState('All');

  useEffect(() => {
    // Calling our adjusted /api/shops endpoint
    axios.get(`${API_URL}/api/shops`)
      .then(res => setShops(res.data))
      .catch(err => console.error(err));
  }, []);

  // Syncing search tags with backend property fields (area/name)
  const filteredShops = shops.filter(shop => {
    const matchesSearch = shop.name.toLowerCase().includes(search.toLowerCase()) || 
                          (shop.description && shop.description.toLowerCase().includes(search.toLowerCase()));
    const matchesArea = selectedArea === 'All' || shop.area === selectedArea;
    return matchesSearch && matchesArea;
  });

  const areas = ['All', 'Katutura', 'Khomasdal', 'Wanaheda', 'Hakahana', 'Pioneerspark', 'Windhoek Central'];

  return (
    <div className="min-h-screen bg-emerald-800 text-white">
      {/* Top Banner Navigation Match */}
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-emerald-700/50 rounded-lg">✂️</div>
          <h1 className="text-2xl font-bold tracking-tight">CutBook</h1>
        </div>

        <h2 className="text-4xl font-extrabold mb-6 leading-tight">
          Find your barber<br />in Windhoek
        </h2>

        {/* Dynamic Interactive Searching Input */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name or area..."
            className="w-full p-4 rounded-xl bg-emerald-900/60 text-white placeholder-emerald-300 border border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-lg shadow-inner"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filter Pills Layout matching Netlify screenshot */}
        <div className="flex gap-2 overflow-x-auto pb-6 scrollbar-hide">
          {areas.map(area => (
            <button
              key={area}
              onClick={() => setSelectedArea(area)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border whitespace-nowrap transition-all duration-200 ${
                selectedArea === area
                  ? 'bg-white text-emerald-900 border-white'
                  : 'bg-emerald-900/40 text-emerald-100 border-emerald-700 hover:bg-emerald-900/60'
              }`}
            >
              {area}
            </button>
          ))}
        </div>

        {/* Render Cards Grid */}
        <div className="grid gap-4">
          {filteredShops.map(shop => (
            <Link to={`/shop/${shop.id}`} key={shop.id} className="block group">
              <div className="bg-white text-gray-900 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-200 flex justify-between items-center relative overflow-hidden border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="p-4 bg-emerald-50 rounded-xl text-emerald-800 font-bold group-hover:scale-105 transition-transform duration-200">
                    ✂️
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-0.5">{shop.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-pink-500 font-semibold mb-1">
                      📍 <span>{shop.area}</span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-1">{shop.description || 'No description available'}</p>
                  </div>
                </div>

                {/* DYNAMIC OPEN/CLOSED BADGES - Evaluated via Live Database Array Variables */}
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-sm uppercase ${
                    shop.is_open 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                      : 'bg-gray-100 text-gray-500 border border-gray-300'
                  }`}>
                    {shop.is_open ? '● Open' : 'Closed'}
                  </span>
                </div>
              </div>
            </Link>
          ))}

          {filteredShops.length === 0 && (
            <div className="text-center py-12 text-emerald-200 font-medium">
              No registered barbershops found matching your selections.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;

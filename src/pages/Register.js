import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ShopDetail from './pages/ShopDetail';
import Booking from './pages/Booking';
import Confirmation from './pages/Confirmation';
import Register from './pages/Register'; // Added Import

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop/:id" element={<ShopDetail />} />
        <Route path="/booking/:shopId" element={<Booking />} />
        <Route path="/confirmation" element={<Confirmation />} />
        <Route path="/register" element={<Register />} /> {/* Added Route */}
      </Routes>
    </Router>
  );
}

export default App;

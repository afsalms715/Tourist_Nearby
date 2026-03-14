import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Discover from './pages/Discover';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import MyList from './pages/MyList';
import PlaceDetails from './pages/PlaceDetails';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Discover />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/mylist" element={<MyList />} />
          <Route path="/place/:placeId" element={<PlaceDetails />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

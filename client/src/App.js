import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { jwtDecode } from "jwt-decode"; 
import Navbar from './Navbar';
import { Login, Register } from './Auth';
import AnimalsList from './AnimalsList';
import Appointments from './Appointments';
import Home from './Home';
import './App.css';

const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
};

const getUserRole = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
        const decoded = jwtDecode(token);
        return decoded.role;
    } catch (e) {
        return null;
    }
};

function App() {
    const { t } = useTranslation();
    
    const userRole = getUserRole();
    
    return (
        <Router>
            <header>
                <img src="/images/logo.jpg" alt="Klinika Weterynaryjna" className="header-img" />
                <h1>{t('header_title')}</h1> 
            </header>
            <Navbar />
            <main>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/my-animals" element={
                        <PrivateRoute>
                            <AnimalsList mode="my" />
                        </PrivateRoute>
                    } />
                    <Route path="/appointments" element={
                        <PrivateRoute>
                            <Appointments />
                        </PrivateRoute>
                    } />
                    <Route path="/all-animals" element={
                        <PrivateRoute>
                            {getUserRole() === 'vet' ? <AnimalsList mode="all" /> : <Navigate to="/" />}
                        </PrivateRoute>
                    } />
                </Routes>
            </main>
            <footer>
                <p>&copy; 2026 DracoVet | Czarna 1, Warszawa | +48 0000 000 000</p>
            </footer>
        </Router>
    );
}

export default App;
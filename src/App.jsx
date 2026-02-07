import React, { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import { logout } from './services/api';

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if token exists on mount
        const token = localStorage.getItem('token');
        if (token) {
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, []);

    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        logout();
        setIsAuthenticated(false);
    };

    if (loading) {
        return null; // Or a spinner
    }

    if (!isAuthenticated) {
        if (isRegistering) {
            return (
                <Register
                    onRegisterSuccess={() => setIsRegistering(false)}
                    onCancel={() => setIsRegistering(false)}
                />
            );
        }
        return (
            <Login
                onLogin={handleLogin}
                onRegisterClick={() => setIsRegistering(true)}
            />
        );
    }

    return (
        <div className="App">
            <Dashboard onLogout={handleLogout} />
        </div>
    );
};

export default App;

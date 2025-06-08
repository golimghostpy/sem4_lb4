import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Detail from './pages/Detail';
import Form from './pages/Form';
import Authentication from './pages/Authentication';
import Registration from './pages/Registration';

const isAuthenticated = () => {
    return localStorage.getItem('accessToken') !== null;
};

const PrivateRoute = ({ children }) => {
    return isAuthenticated() ? children : <Navigate to="/login" />;
};

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Authentication />} />
                <Route path="/register" element={<Registration />} />
                <Route 
                    path="/" 
                    element={
                        <PrivateRoute>
                            <Home />
                        </PrivateRoute>
                    } 
                />
                <Route 
                    path="/detail/:id" 
                    element={
                        <PrivateRoute>
                            <Detail />
                        </PrivateRoute>
                    } 
                />
                <Route 
                    path="/add" 
                    element={
                        <PrivateRoute>
                            <Form />
                        </PrivateRoute>
                    } 
                />
            </Routes>
        </Router>
    );
};

export default App;
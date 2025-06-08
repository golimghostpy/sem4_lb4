import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './styles.css';

const Authentication = () => {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLoginChange = (e) => {
        setLogin(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await api.post('/auth', {
                login,
                password
            });

            if (response.data.status === 'success') {
                localStorage.setItem('accessToken', response.data.access_token);
                localStorage.setItem('refreshToken', response.data.refresh_token);
                localStorage.setItem('userLogin', login);
                navigate('/');
            } else {
                setError(response.data.message || 'Неверный логин или пароль');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Ошибка сервера. Попробуйте позже.');
            console.error('Authentication error:', error);
        }
    };

    const handleRegisterClick = () => {
        navigate('/register');
    };

    return (
        <div className="container auth-container">
            <h2>Вход</h2>
            
            {error && <p style={{ color: 'red' }}>{error}</p>}
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Логин:</label>
                    <input
                        type="text"
                        value={login}
                        onChange={handleLoginChange}
                        required
                    />
                </div>
                
                <div className="form-group">
                    <label>Пароль:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={handlePasswordChange}
                        required
                    />
                </div>
                
                <button type="submit">Войти</button>
            </form>
            
            <button onClick={handleRegisterClick}>Регистрация</button>
        </div>
    );
};

export default Authentication;
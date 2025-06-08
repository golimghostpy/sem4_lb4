import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './styles.css';

const Registration = () => {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/register', {
                login: login,
                password: password
            });
            
            if (response.status === 200) {
                navigate('/login');
            } else {
                setError(response.data.message || 'Ошибка регистрации');
            }
        } catch (error) {
            if (error.response) {
                console.log(error)
                setError(error.response.data.message || 'Ошибка сервера');
            } else {
                setError('Не удалось подключиться к серверу');
            }
        }
    };

    return (
        <div className="container auth-container">
            <h2>Регистрация</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Логин:</label>
                    <input 
                        type="text" 
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Пароль:</label>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Зарегистрироваться</button>
            </form>
        </div>
    );
};

export default Registration;
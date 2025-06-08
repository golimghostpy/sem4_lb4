import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './styles.css';

const Form = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [city, setCity] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChangeName = (e) => {
        setTitle(e.target.value);
    };

    const handleChangeDescription = (e) => {
        setDescription(e.target.value);
    };

    const handleChangeCity = (e) => {
        setCity(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/hotels', { 
                title, 
                city, 
                description 
            });

            if (response.data.status === 'success') {
                navigate('/');
            } else {
                setError(response.data.message || 'Ошибка при добавлении отеля');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Ошибка при добавлении отеля');
        }
    };

    return (
        <div className="container form-container">
            <h1>Добавление отеля</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Название:</label>
                    <input 
                        type="text" 
                        value={title} 
                        onChange={handleChangeName} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label>Город:</label>
                    <input 
                        type="text" 
                        value={city} 
                        onChange={handleChangeCity} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label>Описание:</label>
                    <textarea 
                        value={description} 
                        onChange={handleChangeDescription} 
                    />
                </div>
                <button type="submit">Сохранить</button>
            </form>
        </div>
    );
};

export default Form;
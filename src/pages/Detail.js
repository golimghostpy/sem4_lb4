import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import './styles.css';

const Detail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [hotel, setHotel] = useState({ title: '', city: '', description: '' });
    const [error, setError] = useState('');
    const titleRef = useRef(null);
    const cityRef = useRef(null);
    const descriptionRef = useRef(null);

    useEffect(() => {
        const loadHotel = async () => {
            try {
                const response = await api.get(`/hotels/${id}`);
                
                if (response.data.status === 'success') {
                    setHotel({
                        title: response.data.title || response.data.hotel?.title || '',
                        city: response.data.city || response.data.hotel?.city || '',
                        description: response.data.description || response.data.hotel?.description || ''
                    });
                } else {
                    setError(response.data.message || 'Отель не найден');
                    navigate('/');
                }
            } catch (error) {
                setError('Ошибка загрузки отеля');
                navigate('/');
            }
        };
        loadHotel();
    }, [id, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const updatedHotel = {
                title: titleRef.current.value,
                city: cityRef.current.value,
                description: descriptionRef.current.value || null,
            };

            const response = await api.put(
                `/hotels/${id}`,
                updatedHotel
            );

            if (response.data.status === 'success') {
                navigate('/');
            } else {
                setError(response.data.message || 'Ошибка при обновлении');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Ошибка при обновлении отеля');
        }
    };

    return (
        <div className="container form-container">
            <h1>Редактирование отеля</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Название:</label>
                    <input 
                        type="text" 
                        ref={titleRef} 
                        defaultValue={hotel.title} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label>Город:</label>
                    <input 
                        type="text" 
                        ref={cityRef} 
                        defaultValue={hotel.city} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label>Описание:</label>
                    <textarea 
                        ref={descriptionRef} 
                        defaultValue={hotel.description || ''} 
                    />
                </div>
                <button type="submit">Сохранить</button>
            </form>
        </div>
    );
};

export default Detail;
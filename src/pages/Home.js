import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import './styles.css';

const Home = () => {
    const [hotels, setHotels] = useState([]);

    const loadHotels = async () => {
        try {
            const response = await api.get("/hotels");
            setHotels(response.data.hotels || []);
        } catch (error) {
            console.error("Ошибка запроса:", error);
        }
    };

    useEffect(() => {
        loadHotels();
    }, []);

    const deleteHotel = async (id) => {
        try {
            await api.delete(`/hotels/${id}`);
            setHotels(hotels.filter(hotel => hotel.id !== id));
        } catch (error) {
            console.error(`Ошибка удаления отеля с id ${id}:`, error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userLogin');
        window.location.href = '/login';
    };

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Список отелей</h1>
                <button onClick={handleLogout} style={{ height: '40px' }}>Выйти</button>
            </div>
            
            <ul>
                {hotels.map(item => (
                <li key={item.id}>
                    <Link to={`/detail/${item.id}`} style={{ display: 'flex', alignItems: 'center' }}>
                    {item.name}
                    </Link>
                    <button onClick={() => deleteHotel(item.id)}>
                    Удалить
                    </button>
                </li>
                ))}
            </ul>

            <Link to="/add" className="btn-add">Добавить отель</Link>
        </div>
    );
};

export default Home;
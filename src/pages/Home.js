import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { searchHotels } from '../api';
import './styles.css';

const Home = () => {
    const [hotels, setHotels] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    const loadHotels = async (page = 1, query = '') => {
        setLoading(true);
        try {
            const data = await searchHotels(query, page);
            setHotels(data.hotels || []);
            setTotalPages(data.pages || 1);
            setCurrentPage(data.current_page || 1);
        } catch (error) {
            console.error("Ошибка запроса:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHotels();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        loadHotels(1, searchQuery);
    };

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            loadHotels(newPage, searchQuery);
        }
    };

    const deleteHotel = async (id) => {
        try {
            await api.delete(`/hotels/${id}`);
            loadHotels(currentPage, searchQuery);
            
            if (hotels.length === 1 && currentPage > 1) {
                loadHotels(currentPage - 1, searchQuery);
            }
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
            
            <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
                <div className="form-group">
                    <input
                        type="text"
                        placeholder="Поиск по названию отеля"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button type="submit">Поиск</button>
                <button 
                    type="button" 
                    onClick={() => {
                        setSearchQuery('');
                        loadHotels(1, '');
                    }} 
                    style={{ marginLeft: '10px' }}
                >
                    Сбросить
                </button>
            </form>

            {loading ? (
                <p>Загрузка...</p>
            ) : (
                <>
                    <ul>
                        {hotels.map(item => (
                            <li key={item.id}>
                                <Link to={`/detail/${item.id}`} style={{ display: 'flex', alignItems: 'center' }}>
                                    {item.title}
                                </Link>
                                <button onClick={() => deleteHotel(item.id)}>
                                    Удалить
                                </button>
                            </li>
                        ))}
                    </ul>

                    {totalPages > 1 && (
                        <div className="pagination" style={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            marginTop: '20px' 
                        }}>
                            <button 
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Назад
                            </button>
                            <span style={{ 
                                margin: '0 15px', 
                                display: 'flex', 
                                alignItems: 'center' 
                            }}>
                                Страница {currentPage} из {totalPages}
                            </span>
                            <button 
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Вперед
                            </button>
                        </div>
                    )}
                </>
            )}

            <Link to="/add" className="btn-add">Добавить отель</Link>
        </div>
    );
};

export default Home;
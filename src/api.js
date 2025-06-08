import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    logout();
                    return Promise.reject(error);
                }
                
                const response = await axios.post('http://localhost:5000/api/refresh', {
                    refresh_token: refreshToken
                });
                
                const { access_token } = response.data;
                localStorage.setItem('accessToken', access_token);
                
                originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
                return api(originalRequest);
            } catch (refreshError) {
                logout();
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
);

const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userLogin');
    window.location.href = '/login';
};

export default api;
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import bcrypt
import os
from datetime import datetime, timedelta
import jwt
from functools import wraps

app = Flask(__name__)
CORS(
    app,
    resources={
        r"/api/*": {
            "origins": ["http://localhost:3000"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    }
)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:root@localhost:15432/lb_4'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config["CORS_LOG"] = True
app.config['SECRET_KEY'] = 'secret'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=15)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=7)
db = SQLAlchemy(app)

class Hotel(db.Model):
    __tablename__ = 'hotels'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(32), nullable=False)
    city = db.Column(db.String(32), nullable=False)
    description = db.Column(db.String(512))

class User(db.Model):
    __tablename__ = 'users'
    login = db.Column(db.String(32), primary_key=True)
    hash_password = db.Column(db.String(64), nullable=False)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]
        
        if not token:
            return jsonify({'status': 'error', 'message': 'Токен отсутствует'}), 401
        
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = db.session.get(User, data['login'])
        except jwt.ExpiredSignatureError:
            return jsonify({'status': 'error', 'message': 'Время действия токена истекло'}), 401
        except Exception as e:
            return jsonify({'status': 'error', 'message': 'Неверный токен'}), 401
        
        return f(current_user, *args, **kwargs)
    return decorated

@app.route('/api/hotels', methods=['GET'])
@token_required
def get_hotels(current_user):
    hotels = Hotel.query.all()
    return jsonify({
        'status': 'success',
        'hotels': [{
            'id': hotel.id,
            'name': hotel.title,
            'city': hotel.city,
            'description': hotel.description
        } for hotel in hotels]
    }), 200

@app.route('/api/hotels/<int:id>', methods=['GET'])
@token_required
def get_hotel(current_user, id):
    hotel = Hotel.query.get(id)
    if not hotel:
        return jsonify({'status': 'error', 'message': 'Отели не найдены'}), 404
    return jsonify({
        'status': 'success',
        'hotel': {
            'id': hotel.id,
            'title': hotel.title,
            'city': hotel.city,
            'description': hotel.description
        }
    }), 200

@app.route('/api/hotels', methods=['POST'])
@token_required
def create_hotel(current_user):
    data = request.get_json()
    if not data or not data.get('title') or not data.get('city'):
        return jsonify({'status': 'error', 'message': 'Заполните обязательные поля'}), 400
    
    hotel = Hotel(
        title=data['title'],
        city=data['city'],
        description=data.get('description')
    )
    db.session.add(hotel)
    db.session.commit()
    
    return jsonify({
        'status': 'success',
        'id': hotel.id,
        'title': hotel.title,
        'city': hotel.city,
        'description': hotel.description
    }), 200

@app.route('/api/hotels/<int:id>', methods=['PUT'])
@token_required
def update_hotel(current_user, id):
    hotel = Hotel.query.get(id)
    if not hotel:
        return jsonify({'status': 'error', 'message': 'Отель не найден'}), 404
    
    data = request.get_json()
    if not data:
        return jsonify({'status': 'error', 'message': 'Нет данных'}), 400
    
    if 'title' in data:
        hotel.title = data['title']
    if 'city' in data:
        hotel.city = data['city']
    if 'description' in data:
        hotel.description = data['description']
    
    db.session.commit()
    return jsonify({
        'status': 'success',
        'hotel': {
            'id': hotel.id,
            'title': hotel.title,
            'city': hotel.city,
            'description': hotel.description
        }
    }), 200

@app.route('/api/hotels/<int:id>', methods=['DELETE'])
@token_required
def delete_hotel(current_user, id):
    hotel = Hotel.query.get(id)
    if not hotel:
        return jsonify({'status': 'error', 'message': 'Отель не найден'}), 404
    
    db.session.delete(hotel)
    db.session.commit()
    return jsonify({'status': 'success'}), 200

@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        if not data or not data.get('login') or not data.get('password'):
            return jsonify({'status': 'error', 'message': 'Нужно ввести и логин, и пароль'}), 400
        
        if db.session.get(User, data['login']):
            return jsonify({'status': 'error', 'message': 'Пользователь с таким именем уже существует'}), 401

        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), salt)
        
        user = User(
            login=data['login'],
            hash_password=hashed_password.decode('utf-8', errors='ignore')
        )
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({'status': 'success'}), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500
    
@app.route('/api/auth', methods=['POST'])
def authenticate():
    data = request.get_json()
    if not data or not data.get('login') or not data.get('password'):
        return jsonify({'status': 'error', 'message': 'Нужно ввести и логин, и пароль'}), 400
    
    user = db.session.get(User, data['login'])
    if not user:
        return jsonify({'status': 'error', 'message': 'Неверный логин или пароль'}), 401
    
    try:
        if not bcrypt.checkpw(data['password'].encode('utf-8'), user.hash_password.encode('utf-8')):
            return jsonify({'status': 'error', 'message': 'Неверный логин или пароль'}), 401
    except Exception as e:
        return jsonify({'status': 'error', 'message': f'Ошибка проверки пароля: {str(e)}'}), 402
    
    access_token = jwt.encode({
        'login': user.login,
        'exp': datetime.utcnow() + app.config['JWT_ACCESS_TOKEN_EXPIRES']
    }, app.config['SECRET_KEY'], algorithm="HS256")
    
    refresh_token = jwt.encode({
        'login': user.login,
        'exp': datetime.utcnow() + app.config['JWT_REFRESH_TOKEN_EXPIRES']
    }, app.config['SECRET_KEY'], algorithm="HS256")
    
    return jsonify({
        'status': 'success',
        'login': user.login,
        'access_token': access_token,
        'refresh_token': refresh_token
    }), 200

@app.route('/api/refresh', methods=['POST'])
def refresh():
    try:
        data = request.get_json()
        if not data or not data.get('refresh_token'):
            return jsonify({'status': 'error', 'message': 'Отсутствует обновляющий токен'}), 400
        
        try:
            token_data = jwt.decode(data['refresh_token'], app.config['SECRET_KEY'], algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return jsonify({'status': 'error', 'message': 'Время действия обновляющего токена истекло'}), 401
        except Exception as e:
            return jsonify({'status': 'error', 'message': 'Неверный обновляющий токен'}), 402
        
        user = db.session.get(User, token_data['login'])
        if not user:
            return jsonify({'status': 'error', 'message': 'Пользователь не найден'}), 403
        
        new_access_token = jwt.encode({
            'login': user.login,
            'exp': datetime.utcnow() + app.config['JWT_ACCESS_TOKEN_EXPIRES']
        }, app.config['SECRET_KEY'], algorithm="HS256")
        
        return jsonify({
            'status': 'success',
            'access_token': new_access_token
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/hotels/search', methods=['GET'])
@token_required
def search_hotels(current_user):
    try:
        search_query = request.args.get('q', '').strip()
        page = int(request.args.get('page', 1))
        per_page = 3

        query = Hotel.query
        
        if search_query:
            query = query.filter(Hotel.title.ilike(f'%{search_query}%'))
        
        paginated_hotels = query.paginate(page=page, per_page=per_page, error_out=False)
        
        hotels_list = [{
            'id': hotel.id,
            'title': hotel.title,
            'city': hotel.city,
            'description': hotel.description
        } for hotel in paginated_hotels.items]
        
        return jsonify({
            'status': 'success',
            'hotels': hotels_list,
            'total': paginated_hotels.total,
            'pages': paginated_hotels.pages,
            'current_page': paginated_hotels.page
        }), 200
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
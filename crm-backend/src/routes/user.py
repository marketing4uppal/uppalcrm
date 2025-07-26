from flask import Blueprint, jsonify, request
from flask_cors import cross_origin
from src.models.user import User, db
from datetime import datetime

user_bp = Blueprint('user', __name__)

@user_bp.route('/login', methods=['POST'])
@cross_origin()
def login():
    """Handle user login"""
    data = request.json
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password are required'}), 400
    
    # Try to find user by username or email
    user = User.query.filter(
        (User.username == data['username']) | (User.email == data['username'])
    ).first()
    
    if user and user.check_password(data['password']) and user.status == 'active':
        # Update last login time
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'user': user.to_dict(),
            'message': 'Login successful'
        }), 200
    else:
        return jsonify({
            'success': False,
            'error': 'Invalid credentials or inactive account'
        }), 401

@user_bp.route('/users', methods=['GET'])
@cross_origin()
def get_users():
    """Get all users"""
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])

@user_bp.route('/users', methods=['POST'])
@cross_origin()
def create_user():
    """Create a new user"""
    data = request.json
    
    if not data or not all(k in data for k in ('username', 'email', 'password')):
        return jsonify({'error': 'Username, email, and password are required'}), 400
    
    # Check if user already exists
    existing_user = User.query.filter(
        (User.username == data['username']) | (User.email == data['email'])
    ).first()
    
    if existing_user:
        return jsonify({'error': 'User with this username or email already exists'}), 409
    
    # Create new user
    user = User(
        username=data['username'], 
        email=data['email'],
        role=data.get('role', 'user'),
        status=data.get('status', 'active')
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'user': user.to_dict(),
        'message': 'User created successfully'
    }), 201

@user_bp.route('/users/<int:user_id>', methods=['GET'])
@cross_origin()
def get_user(user_id):
    """Get a specific user"""
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict())

@user_bp.route('/users/<int:user_id>', methods=['PUT'])
@cross_origin()
def update_user(user_id):
    """Update a user"""
    user = User.query.get_or_404(user_id)
    data = request.json
    
    # Update fields if provided
    if 'username' in data:
        user.username = data['username']
    if 'email' in data:
        user.email = data['email']
    if 'role' in data:
        user.role = data['role']
    if 'status' in data:
        user.status = data['status']
    if 'password' in data:
        user.set_password(data['password'])
    
    db.session.commit()
    return jsonify({
        'success': True,
        'user': user.to_dict(),
        'message': 'User updated successfully'
    })

@user_bp.route('/users/<int:user_id>', methods=['DELETE'])
@cross_origin()
def delete_user(user_id):
    """Delete a user"""
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({
        'success': True,
        'message': 'User deleted successfully'
    }), 200

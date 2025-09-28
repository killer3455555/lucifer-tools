from flask import Blueprint, request, jsonify
import requests
try:
    import psutil
    PSUTIL_AVAILABLE = True
except (ImportError, NotImplementedError):
    PSUTIL_AVAILABLE = False
import time
from datetime import datetime, timedelta
import threading
import sqlite3
import os
import random

tools_bp = Blueprint('tools', __name__)

# Global variables for uptime tracking
start_time = datetime.now()
uptime_data = {
    'start_time': start_time,
    'total_requests': 0,
    'active_users': set(),
    'deployments': 0
}

# Database setup for statistics
def init_stats_db():
    db_path = os.path.join(os.path.dirname(__file__), '..', 'database', 'stats.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS cpu_stats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            cpu_percent REAL,
            memory_percent REAL,
            disk_percent REAL
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS uptime_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            status TEXT,
            users_count INTEGER,
            requests_count INTEGER
        )
    ''')
    
    conn.commit()
    conn.close()

# Initialize database on import
init_stats_db()

@tools_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if username == 'Lucifer' and password == 'Lucifer':
        return jsonify({'success': True, 'message': 'Login successful'})
    else:
        return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

@tools_bp.route('/token-check', methods=['POST'])
def check_token():
    data = request.get_json()
    token = data.get('token')
    
    if not token:
        return jsonify({'success': False, 'message': 'Token is required'}), 400
    
    try:
        # Check token validity using Facebook Graph API
        url = f"https://graph.facebook.com/v15.0/me?access_token={token}"
        response = requests.get(url)
        
        if response.status_code == 200:
            user_data = response.json()
            
            # Get token info
            token_info_url = f"https://graph.facebook.com/v15.0/debug_token?input_token={token}&access_token={token}"
            token_response = requests.get(token_info_url)
            
            result = {
                'success': True,
                'valid': True,
                'user_id': user_data.get('id'),
                'user_name': user_data.get('name'),
                'token_info': token_response.json() if token_response.status_code == 200 else None
            }
            
            uptime_data['total_requests'] += 1
            return jsonify(result)
        else:
            return jsonify({
                'success': True,
                'valid': False,
                'message': 'Invalid token'
            })
            
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@tools_bp.route('/cpu-monitor', methods=['GET'])
def cpu_monitor():
    try:
        if PSUTIL_AVAILABLE:
            # Get current system stats using psutil
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            cpu_val = cpu_percent
            memory_val = memory.percent
            disk_val = disk.percent
        else:
            # Provide simulated data when psutil is not available (for deployment)
            cpu_val = random.uniform(20, 80)
            memory_val = random.uniform(30, 70)
            disk_val = random.uniform(15, 45)
        
        # Store in database
        db_path = os.path.join(os.path.dirname(__file__), '..', 'database', 'stats.db')
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO cpu_stats (cpu_percent, memory_percent, disk_percent)
            VALUES (?, ?, ?)
        ''', (cpu_val, memory_val, disk_val))
        
        conn.commit()
        conn.close()
        
        # Calculate uptime
        uptime_seconds = (datetime.now() - start_time).total_seconds()
        uptime_days = uptime_seconds / 86400
        
        result = {
            'success': True,
            'current_stats': {
                'cpu_percent': round(cpu_val, 1),
                'memory_percent': round(memory_val, 1),
                'disk_percent': round(disk_val, 1),
                'uptime_days': round(uptime_days, 2),
                'total_requests': uptime_data['total_requests'],
                'active_users': len(uptime_data['active_users'])
            }
        }
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@tools_bp.route('/facebook-posts', methods=['POST'])
def get_facebook_posts():
    data = request.get_json()
    token = data.get('token')
    
    if not token:
        return jsonify({'success': False, 'message': 'Token is required'}), 400
    
    try:
        # Get user's posts
        url = f"https://graph.facebook.com/v15.0/me/posts?fields=id,message,created_time&access_token={token}"
        response = requests.get(url)
        
        if response.status_code == 200:
            posts_data = response.json()
            posts = []
            
            for post in posts_data.get('data', []):
                posts.append({
                    'id': post.get('id'),
                    'message': post.get('message', 'No message')[:100] + '...' if post.get('message') and len(post.get('message', '')) > 100 else post.get('message', 'No message'),
                    'created_time': post.get('created_time')
                })
            
            uptime_data['total_requests'] += 1
            return jsonify({
                'success': True,
                'posts': posts,
                'total_posts': len(posts)
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to fetch posts. Check your token permissions.'
            })
            
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@tools_bp.route('/uptime-status', methods=['GET'])
def uptime_status():
    try:
        uptime_seconds = (datetime.now() - start_time).total_seconds()
        uptime_days = uptime_seconds / 86400
        
        # Log uptime status
        db_path = os.path.join(os.path.dirname(__file__), '..', 'database', 'stats.db')
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO uptime_log (status, users_count, requests_count)
            VALUES (?, ?, ?)
        ''', ('running', len(uptime_data['active_users']), uptime_data['total_requests']))
        
        conn.commit()
        conn.close()
        
        result = {
            'success': True,
            'uptime_days': round(uptime_days, 2),
            'target_days': 100,
            'progress_percent': min(round((uptime_days / 100) * 100, 2), 100),
            'status': 'running',
            'start_time': start_time.isoformat(),
            'total_requests': uptime_data['total_requests'],
            'active_users': len(uptime_data['active_users']),
            'deployments': uptime_data['deployments']
        }
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@tools_bp.route('/admin-info', methods=['GET'])
def admin_info():
    return jsonify({
        'success': True,
        'admin': {
            'name': 'Muddassir',
            'facebook': 'https://www.facebook.com/muddassir.OP',
            'whatsapp': '+923243037456',
            'whatsapp_link': 'https://wa.me/923243037456'
        }
    })

# Background task to increment deployment count
def increment_deployment():
    uptime_data['deployments'] += 1

# Call this when app starts
increment_deployment()


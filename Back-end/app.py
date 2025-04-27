from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from datetime import datetime
import os

app = Flask(__name__, static_folder='../Front-end')
CORS(app)

# In-memory storage
users = [
    {"username": "doctor1", "password": "password123", "department": "Cardiology"},
    {"username": "Teddy Akumu", "password": "Teddy123", "department": "MCH"},
    {"username": "Faith Ndanu", "password": "faith123", "department": "Physiotherapy"},
    {"username": "Joseph", "password": "joseph0123", "department": "Procument"}]
clients = []
programs = []
enrollments = []

# Helper functions
def find_client(client_id):
    return next((c for c in clients if c['id'] == client_id), None)

def find_program(program_id):
    return next((p for p in programs if p['id'] == program_id), None)

# Serve frontend files
@app.route('/')
def serve_index():
    return send_from_directory('../Front-end', 'login.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('../Front-end', filename)

# API Endpoints
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = next((u for u in users if u['username'] == data.get('username') and u['password'] == data.get('password')), None)
    return jsonify({"message": "Login successful", "user": user}) if user else (jsonify({"error": "Invalid credentials"}), 401)

@app.route('/api/clients', methods=['GET', 'POST'])
def handle_clients():
    if request.method == 'GET':
        return jsonify(clients)
    elif request.method == 'POST':
        data = request.get_json()
        new_client = {
            "id": max([c.get('id', 0) for c in clients], default=0) + 1,
            **data,
            "created_at": datetime.now().isoformat()
        }
        clients.append(new_client)
        return jsonify({"message": "Client created", "client": new_client}), 201

@app.route('/api/programs', methods=['GET', 'POST'])
def handle_programs():
    if request.method == 'GET':
        return jsonify(programs)
    elif request.method == 'POST':
        data = request.get_json()
        new_program = {
            "id": max([p.get('id', 0) for p in programs], default=0) + 1,
            **data,
            "created_at": datetime.now().isoformat()
        }
        programs.append(new_program)
        return jsonify({"message": "Program created", "program": new_program}), 201

@app.route('/api/enrollments', methods=['GET', 'POST'])
def handle_enrollments():
    if request.method == 'GET':
        return jsonify([{
            "id": e['id'],
            "client": find_client(e['client_id']),
            "program": find_program(e['program_id']),
            "enrolled_at": e['enrolled_at']
        } for e in enrollments if find_client(e['client_id']) and find_program(e['program_id'])])
    
    elif request.method == 'POST':
        data = request.get_json()
        if not find_client(data['client_id']):
            return jsonify({"error": "Client not found"}), 404
        if not find_program(data['program_id']):
            return jsonify({"error": "Program not found"}), 404
        
        new_enrollment = {
            "id": max([e.get('id', 0) for e in enrollments], default=0) + 1,
            "client_id": data['client_id'],
            "program_id": data['program_id'],
            "enrolled_at": datetime.now().isoformat()
        }
        enrollments.append(new_enrollment)
        return jsonify({"message": "Enrollment created", "enrollment": new_enrollment}), 201

# Client endpoints
@app.route('/api/clients/<int:client_id>', methods=['GET'])
def get_client(client_id):
    client = find_client(client_id)
    if not client:
        return jsonify({"error": "Client not found"}), 404
    return jsonify({
        "id": client['id'],
        "name": client['name'],
        "age": client.get('age'),
        "gender": client.get('gender'),
        "phone": client.get('phone')
    })

# Enrollment endpoints
@app.route('/api/clients/<int:client_id>/enrollments', methods=['GET'])
def get_client_enrollments(client_id):
    client = find_client(client_id)
    if not client:
        return jsonify({"error": "Client not found"}), 404
    
    client_enrollments = []
    for enroll in enrollments:
        if enroll['client_id'] == client_id:
            program = find_program(enroll['program_id'])
            if program:
                client_enrollments.append({
                    "program": {
                        "id": program['id'],
                        "name": program['name'],
                        "description": program.get('description', '')
                    },
                    "enrolled_at": enroll.get('enrolled_at', 'Unknown date')
                })
    
    return jsonify(client_enrollments)
if __name__ == "__main__":
    app.run(debug=True, port=5000)

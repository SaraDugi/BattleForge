from flask import Flask, request, jsonify
import requests
import grpc
import player_pb2
import player_pb2_grpc

app = Flask(__name__)

grpc_channel = grpc.insecure_channel('localhost:5000')
player_stub = player_pb2_grpc.PlayerServiceStub(grpc_channel)

@app.route('/api/battles', methods=['POST'])
def create_battle():
    try:
        data = request.get_json()
        resp = requests.post('http://localhost:7000/api/battles', json=data)
        return jsonify(resp.json()), resp.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/battles', methods=['GET'])
def get_all_battles():
    try:
        resp = requests.get('http://localhost:7000/api/battles')
        return jsonify(resp.json()), resp.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/battles/<int:battle_id>', methods=['GET'])
def get_battle_by_id(battle_id):
    try:
        resp = requests.get(f'http://localhost:7000/api/battles/{battle_id}')
        return jsonify(resp.json()), resp.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/battles/<int:battle_id>/status', methods=['PUT'])
def update_battle_status(battle_id):
    try:
        data = request.get_json()
        resp = requests.put(f'http://localhost:7000/api/battles/{battle_id}/status', json=data)
        return jsonify(resp.json()), resp.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/battles/<int:battle_id>/winner', methods=['PUT'])
def set_winner(battle_id):
    try:
        data = request.get_json()
        resp = requests.put(f'http://localhost:7000/api/battles/{battle_id}/winner', json=data)
        return jsonify(resp.json()), resp.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/battles/<int:battle_id>/events', methods=['POST'])
def add_battle_event(battle_id):
    try:
        data = request.get_json()
        resp = requests.post(f'http://localhost:7000/api/battles/{battle_id}/events', json=data)
        return jsonify(resp.json()), resp.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/battles/<int:battle_id>/events', methods=['GET'])
def get_battle_events(battle_id):
    try:
        resp = requests.get(f'http://localhost:7000/api/battles/{battle_id}/events')
        return jsonify(resp.json()), resp.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/reservations/<reservation_id>', methods=['GET'])
def get_reservation_by_id(reservation_id):
    try:
        resp = requests.get(f'http://localhost:5050/booking/reservations/{reservation_id}')
        return jsonify(resp.json()), resp.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/reservations/by-date', methods=['GET'])
def get_reservations_by_date():
    try:
        resp = requests.get('http://localhost:5050/booking/reservations/by-date', params=request.args)
        return jsonify(resp.json()), resp.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/reservations/table/<table_assigned>', methods=['GET'])
def get_reservations_by_table(table_assigned):
    try:
        resp = requests.get(f'http://localhost:5050/booking/reservations/table/{table_assigned}')
        return jsonify(resp.json()), resp.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/reservation_assignments', methods=['GET'])
def get_all_reservation_assignments():
    try:
        resp = requests.get('http://localhost:5050/booking/reservation_assignments')
        return jsonify(resp.json()), resp.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/reservation_assignments/<reservation_id>', methods=['GET'])
def get_assignments_by_reservation(reservation_id):
    try:
        resp = requests.get(f'http://localhost:5050/booking/reservation_assignments/{reservation_id}')
        return jsonify(resp.json()), resp.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/reservation_assignments/user/<int:user_id>', methods=['GET'])
def get_assignments_by_user(user_id):
    try:
        resp = requests.get(f'http://localhost:5050/booking/reservation_assignments/user/{user_id}')
        return jsonify(resp.json()), resp.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/reservation_assignments', methods=['POST'])
def create_reservation_assignment():
    try:
        resp = requests.post('http://localhost:5050/booking/reservation_assignments', json=request.get_json())
        return jsonify(resp.json()), resp.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/reservation_assignments/<reservation_id>/<int:user_id>', methods=['PUT'])
def update_reservation_assignment(reservation_id, user_id):
    try:
        url = f'http://localhost:5050/booking/reservation_assignments/{reservation_id}/{user_id}'
        resp = requests.put(url, json=request.get_json())
        return jsonify(resp.json()), resp.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/reservation_assignments/<reservation_id>/<int:user_id>', methods=['DELETE'])
def delete_reservation_assignment(reservation_id, user_id):
    try:
        url = f'http://localhost:5050/booking/reservation_assignments/{reservation_id}/{user_id}'
        resp = requests.delete(url)
        return jsonify(resp.json()), resp.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/players', methods=['POST'])
def create_player():
    try:
        data = request.get_json()

        achievements = data.get("achievements", [])
        if isinstance(achievements, str):
            achievements = [achievements]
        elif not isinstance(achievements, list):
            achievements = []
        else:
            achievements = [str(a) for a in achievements] 

        player = player_pb2.Player(
            firstName=str(data.get("firstName", "")),
            lastName=str(data.get("lastName", "")),
            nickname=str(data.get("nickname", "")),
            email=str(data.get("email", "")),
            accountPassword=str(data.get("accountPassword", "")),
            mainFaction=str(data.get("mainFaction", "")),
            eloRating=float(data.get("eloRating", 0.0)),
            wins=int(data.get("wins", 0)),
            losses=int(data.get("losses", 0)),
            tournamentsParticipated=int(data.get("tournamentsParticipated", 0)),
            achievements=achievements,
            score=int(data.get("score", 0)),
            profilePic=str(data.get("profilePic", "")),
            banner=str(data.get("banner", "")),
            teamId=int(data.get("teamId", 0))
        )

        result = player_stub.CreatePlayer(player)
        return jsonify({"id": result.id}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/players/<int:player_id>', methods=['DELETE'])
def delete_player(player_id):
    try:
        req = player_pb2.PlayerIdRequest(id=player_id)
        player_stub.DeletePlayerById(req)
        return jsonify({"message": "Player deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/players/query', methods=['POST'])
def query_players():
    try:
        query = player_pb2.PlayerQueryRequest(**request.get_json())
        res = player_stub.FindPlayers(query)
        players = [{
            "id": p.id,
            "firstName": p.firstName,
            "lastName": p.lastName,
            "nickname": p.nickname,
            "email": p.email,
            "mainFaction": p.mainFaction,
            "eloRating": p.eloRating,
            "wins": p.wins,
            "losses": p.losses,
            "tournamentsParticipated": p.tournamentsParticipated,
            "achievements": p.achievements,
            "score": p.score,
            "profilePic": p.profilePic,
            "banner": p.banner,
            "teamId": p.teamId
        } for p in res.players]
        return jsonify(players), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/players/<int:player_id>/achievements', methods=['POST'])
def add_achievement(player_id):
    try:
        data = request.get_json()
        req = player_pb2.AchievementRequest(id=player_id, achievement=data['achievement'])
        player_stub.AddAchievement(req)
        return jsonify({"message": "Achievement added"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/players/<int:player_id>/update/profile', methods=['PUT'])
def update_profile(player_id):
    try:
        data = request.get_json()
        data['id'] = player_id
        player = player_pb2.Player(**data)
        player_stub.UpdateProfile(player)
        return jsonify({"message": "Profile updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/players/<int:player_id>/update/email', methods=['PUT'])
def update_email(player_id):
    try:
        data = request.get_json()
        data['id'] = player_id
        player = player_pb2.Player(**data)
        player_stub.UpdateEmail(player)
        return jsonify({"message": "Email updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/players/<int:player_id>/update/password', methods=['PUT'])
def update_password(player_id):
    try:
        data = request.get_json()
        data['id'] = player_id
        player = player_pb2.Player(**data)
        player_stub.UpdatePassword(player)
        return jsonify({"message": "Password updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/players/<int:player_id>/update/score', methods=['PUT'])
def update_score(player_id):
    try:
        data = request.get_json()
        data['id'] = player_id
        player = player_pb2.Player(**data)
        player_stub.UpdateScore(player)
        return jsonify({"message": "Score updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/players/<int:player_id>/update/stats', methods=['PUT'])
def update_stats(player_id):
    try:
        data = request.get_json()
        data['id'] = player_id
        player = player_pb2.Player(**data)
        player_stub.UpdateStats(player)
        return jsonify({"message": "Stats updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/players/<int:player_id>/update/mainFaction', methods=['PUT'])
def update_main_faction(player_id):
    try:
        data = request.get_json()
        data['id'] = player_id
        player = player_pb2.Player(**data)
        player_stub.UpdateMainFaction(player)
        return jsonify({"message": "Main faction updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/players/<int:player_id>/update/media', methods=['PUT'])
def update_media(player_id):
    try:
        data = request.get_json()
        data['id'] = player_id
        player = player_pb2.Player(**data)
        player_stub.UpdateMedia(player)
        return jsonify({"message": "Media updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/players/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        req = player_pb2.LoginRequest(email=data['email'], password=data['password'])
        res = player_stub.Login(req)
        return jsonify({"token": res.token, "message": res.message}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8081, debug=True)
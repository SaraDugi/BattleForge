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
        resp = requests.post('http://localhost:7000/api/battles', json=request.get_json())
        return jsonify(resp.json()), resp.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/reservations', methods=['POST'])
def create_reservation():
    try:
        resp = requests.post('http://localhost:5050/booking/reservations', json=request.get_json())
        return jsonify(resp.json()), resp.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/players/<int:player_id>', methods=['GET'])
def get_player(player_id):
    try:
        request_proto = player_pb2.PlayerQueryRequest(id=player_id)
        response_proto = player_stub.FindPlayers(request_proto)

        if not response_proto.players:
            return jsonify({"error": "Player not found"}), 404

        player = response_proto.players[0]
        player_data = {
            "id": player.id,
            "firstName": player.firstName,
            "lastName": player.lastName,
            "nickname": player.nickname,
            "email": player.email,
            "mainFaction": player.mainFaction,
            "eloRating": player.eloRating,
            "wins": player.wins,
            "losses": player.losses,
            "tournamentsParticipated": player.tournamentsParticipated,
            "achievements": player.achievements,
            "score": player.score,
            "profilePic": player.profilePic,
            "banner": player.banner,
            "teamId": player.teamId
        }
        return jsonify(player_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/players/<int:player_id>/overview', methods=['GET'])
def get_player_overview(player_id):
    try:
        request_proto = player_pb2.PlayerQueryRequest(id=player_id)
        response_proto = player_stub.FindPlayers(request_proto)

        if not response_proto.players:
            return jsonify({"error": "Player not found"}), 404

        player = response_proto.players[0]
        player_info = {
            "id": player.id,
            "firstName": player.firstName,
            "lastName": player.lastName,
            "nickname": player.nickname,
            "email": player.email,
            "mainFaction": player.mainFaction,
            "eloRating": player.eloRating,
            "wins": player.wins,
            "losses": player.losses,
            "tournamentsParticipated": player.tournamentsParticipated,
            "achievements": player.achievements,
            "score": player.score,
            "profilePic": player.profilePic,
            "banner": player.banner,
            "teamId": player.teamId
        }

        resp = requests.get(f'http://localhost:5050/booking/reservation_assignments/user/{player_id}')
        reservations = resp.json()

        overview = {
            "player": player_info,
            "reservations": reservations
        }
        return jsonify(overview)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8081, debug=True)
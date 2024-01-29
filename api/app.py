import json
from flask import Flask, request
import requests

app = Flask(__name__)


@app.route('/PlayerData')
def get_player_data():
    player_tag = request.args.get('player_tag')

    return requests.get(f"https://smashpros.gg/api/users/{player_tag}").json()


@app.route('/PlayerWinsLosses')
def get_player_wins_losses():
    player_id = request.args.get('player_id')

    return requests.get(f"https://smashpros.gg/api/users/{player_id}/wins-losses").json()


@app.route('/LocalWinsLosses')
def get_local_wins_losses():
    with open("score.json") as f:
        score_data = json.load(f)
        return score_data


@app.route('/IncrementLocalWins')
def increase_local_wins():
    increment_by = int(request.args.get('increment_by', default=1))

    with open("score.json") as f:
        score_data = json.load(f)

    score_data["wins"] += increment_by

    with open("score.json", "w") as f:
        f.write(json.dumps(score_data, indent=4))


@app.route("/IncrementLocalLosses")
def increase_local_losses():
    increment_by = int(request.args.get('increment_by', default=1))

    with open("score.json") as f:
        score_data = json.load(f)

    score_data["losses"] += increment_by

    with open("score.json", "w") as f:
        f.write(json.dumps(score_data, indent=4))


@app.route("/ResetLocalWinsLosses")
def reset_local_stats():
    score_data = {
        "wins": 0,
        "losses": 0
    }

    with open("score.json", "w") as f:
        f.write(json.dumps(score_data, indent=4))

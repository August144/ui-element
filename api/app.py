import json
from flask import Flask, request
import requests

app = Flask(__name__)
BASE_URL = "https://smashpros.gg/api/users"
SCORE_FILE = "score.json"

def read_json_file(file):
    """
    Reads the contents of a JSON file.

    :param file: The path of the JSON file to read.
    :return: The contents of the JSON file as a Python object.

    """
    with open(file) as f:
        return json.load(f)

def write_json_file(file, data):
    """
    Write data to a JSON file.

    :param file: The file path of the JSON file to write to.
    :param data: The data to write to the JSON file.
    :return: None
    """
    with open(file, "w") as f:
        f.write(json.dumps(data, indent=4))

@app.route('/PlayerData')
def get_player_data():
    """
    Get player data based on the given player tag.

    :return: JSON data containing player information.
    """
    player_tag = request.args.get('player_tag')
    return requests.get(f"{BASE_URL}/{player_tag}").json()

@app.route('/PlayerWinsLosses')
def get_player_wins_losses():
    """
    Fetches the wins and losses data for a player.

    :return: The wins and losses data for the player as a JSON response.
    """
    player_id = request.args.get('player_id')
    return requests.get(f"{BASE_URL}/{player_id}/wins-losses").json()

@app.route('/LocalWinsLosses')
def get_local_wins_losses():
    """
    Retrieves local wins and losses from the score file.

    :return: The wins and losses data for the local player as a JSON response.
    """
    return read_json_file(SCORE_FILE)

@app.route('/IncrementLocalWins')
def increase_local_wins():
    """
    Increments the number of local wins by a specified amount.

    :return: None
    """
    increment_by = int(request.args.get('increment_by', default=1))
    score_data = read_json_file(SCORE_FILE)
    score_data["wins"] += increment_by
    write_json_file(SCORE_FILE, score_data)

@app.route("/IncrementLocalLosses")
def increase_local_losses():
    """Increments the local losses score by a given value.

    :return: None
    """
    increment_by = int(request.args.get('increment_by', default=1))
    score_data = read_json_file(SCORE_FILE)
    score_data["losses"] += increment_by
    write_json_file(SCORE_FILE, score_data)

@app.route("/ResetLocalWinsLosses")
def reset_local_stats():
    """
    Resets the local wins and losses statistics to zero.

    :return: None
    """
    score_data = {
        "wins": 0,
        "losses": 0
    }
    write_json_file(SCORE_FILE, score_data)

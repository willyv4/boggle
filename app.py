from flask import Flask, session, jsonify, request, render_template, redirect
from flask_debugtoolbar import DebugToolbarExtension
from boggle import Boggle

boggle_game = Boggle()
app = Flask(__name__)
game_count = 0

app.config['SECRET_KEY'] = "IAMCOOL1234"


@app.route("/")
def sesh():
    board = boggle_game.make_board()
    session['boards'] = []
    session['boards'].append(board)

    session.pop("guesses", None)

    return redirect('/home')


@app.route("/home", methods=["GET", "POST"])
def root():
    board = session.get('boards', [])

    return render_template("index.html", board=board[0])


@app.route("/guess", methods=["POST"])
def guess_input():
    board = session.get('boards', [])
    guess = request.json["inputVal"]

    guesses = session.get("guesses", [])
    guesses.append(guess)

    session["guesses"] = guesses
    print(guesses)

    data = boggle_game.check_valid_word(board[0], guess)
    response = {"result": data, "word": guess, "guessArr": guesses}

    return jsonify(response)


@app.route("/gameover", methods=["POST"])
def game_over():
    score = request.json["score"]
    scores = session.get("scores", [])

    scores.append(score)
    session["scores"] = scores

    return redirect('/highscore')


@app.route("/highscore")
def hi_score():

    scores = session.get("scores", [])
    rounds = len(scores) + 1
    max_score = max(scores)
    max_score_index = scores.index(max_score)

    data = {"max": max_score, "maxRound": max_score_index+1, "round": rounds}

    return jsonify(data)

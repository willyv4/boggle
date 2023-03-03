from flask import Flask, session, jsonify, request, render_template, redirect
from flask_debugtoolbar import DebugToolbarExtension
from boggle import Boggle

boggle_game = Boggle()
app = Flask(__name__)
game_count = 0

app.config['SECRET_KEY'] = "IAMCOOL1234"


@app.route("/")
def sesh():
    """
    Create a new game board and add it to the session.
    Redirects to '/home' to display the game board.
    """

    board = boggle_game.make_board()
    session['boards'] = []
    session['boards'].append(board)

    session.pop("guesses", None)

    return redirect('/home')


@app.route("/home", methods=["GET", "POST"])
def root():
    """
    Render the home page of the game.
    If a game board is stored in the session, it is passed to the template to be displayed.
    """

    board = session.get('boards', [])

    return render_template("index.html", board=board[0])


@app.route("/guess", methods=["POST"])
def guess_input():
    """
    Accept a guess from the user and update the list of guesses in the session.
    Return a JSON response indicating whether the guess was valid, and including the updated guess list.
    """
    board = session.get('boards', [])
    guess = request.json["inputVal"]

    guesses = session.get("guesses", [])
    guesses.append(guess)
    session["guesses"] = guesses

    data = boggle_game.check_valid_word(board[0], guess)
    response = {"result": data, "word": guess, "guessArr": guesses}

    return jsonify(response)


@app.route("/gameover", methods=["POST"])
def game_over():
    """
    Accept the final score from the user and add it to the list of scores in the session.
    Redirects to '/highscore' to display the updated high score list.
    """

    score = request.json["score"]
    scores = session.get("scores", [])

    scores.append(score)
    session["scores"] = scores

    return redirect('/highscore')


@app.route("/highscore")
def hi_score():
    """
    Retrieve the list of scores from the session and determine the maximum score.
    Return a JSON response including the maximum score, the round it was achieved, and the total number of rounds played.
    """

    scores = session.get("scores", [])
    rounds = len(scores) + 1
    max_score = max(scores)
    max_score_index = scores.index(max_score)

    data = {"max": max_score, "maxRound": max_score_index+1, "round": rounds}

    return jsonify(data)

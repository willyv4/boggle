from unittest import TestCase
from app import app
from flask import session


class FlaskTests(TestCase):
    def setUp(self):
        self.client = app.test_client()
        app.config['TESTING'] = True

    def set_up_session(self):
        with self.client as client:
            client.get("/")
            session['boards'] = [['A', 'B', 'C', 'D'], ['E', 'F', 'G', 'H'], [
                'I', 'J', 'K', 'L'], ['M', 'N', 'O', 'P']]

    def test_sesh(self):
        self.set_up_session()
        with self.client as client:
            response = client.get("/")
            self.assertEqual(response.status_code, 302)
            self.assertTrue(session['boards'])

    def test_root(self):
        self.set_up_session()
        with self.client as client:
            response = client.get("/home")
            self.assertEqual(response.status_code, 200)

    def test_guess_input_valid_word(self):
        with app.test_client() as client:
            with client.session_transaction() as session:
                session['boards'] = [[['a', 'b', 'c', 'd', 'e'],
                                     ['f', 'g', 'h', 'i', 'j'],
                                     ['k', 'l', 'm', 'n', 'o'],
                                     ['p', 'q', 'r', 's', 't'],
                                     ['u', 'v', 'w', 'x', 'y']]]
                session['guesses'] = []
        response = client.post('/guess', json={'inputVal': 'no'})
        data = response.get_json()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['word'], 'no')
        self.assertEqual(data['guessArr'], ['no'])

    def test_game_over(self):
        with app.test_client() as client:
            response = client.post("/gameover", json={"score": 50})
            self.assertEqual(response.status_code, 302)
            self.assertIn(b'/highscore', response.data)
            # Assert that the score was added to the session
            with client.session_transaction() as sess:
                self.assertEqual(sess['scores'], [50])

    def test_hi_score(self):
        with app.test_client() as client:
            with client.session_transaction() as sess:
                # Add some mock scores to the session
                sess['scores'] = [10, 20, 30, 40, 50]
            response = client.get("/highscore")
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.get_json(), {
                             "max": 50, "maxRound": 5, "round": 6})

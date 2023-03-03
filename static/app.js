class BoggleGame {
  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  constructor() {
    this.$form = $("#boggle-form");
    this.$input = $("#boggle-input");
    this.$message = $("#message");
    this.scoreTracker = [];
    this.timeStarted = false;
    this.countDown = 60;
    this.gameScore = 0;
    this.getHiScore();
    this.$form.on("submit", this.handleSubmit.bind(this));
    this.handleAxiosResponse = this.handleAxiosResponse.bind(this);
  }

  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  handleSubmit(event) {
    /*
     Handles the form submission event
    */
    event.preventDefault();

    // enable/disable guess if game is going or not
    if (this.countDown !== 0) {
      const guess = this.$input.val();
      this.makeGuess(guess);
    }

    if (this.countDown === 60) {
      this.makeGuess(null);
      this.$message.text("START GAME TO SUBMIT GUESSES");
    }

    // Hide the message after 2 seconds
    this.$message.css("opacity", 1);
    setTimeout(
      function () {
        this.$message.css("opacity", 0);
      }.bind(this),
      2000
    );
  }

  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  makeGuess(guess) {
    /*
    Sends a POST request to the server with the user's guess.
     */
    axios
      .post("/guess", {
        inputVal: guess,
      })
      .then(this.handleAxiosResponse);
  }

  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  getHiScore() {
    // Sends a GET request to the server to retrieve the high score and round information.

    axios.get("/highscore").then((response) => {
      this.showHiScore(response.data);
    });
  }

  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  showHiScore(data) {
    // Updates the high score and round information on the webpage.

    $("#hi-score").text(`High Score: ${data.max} points`);
    $("#round").text(`Round ${data.round}`);
  }

  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  handleAxiosResponse(response) {
    // Handles the response from the server after a guess is made and updates the score and message accordingly.

    const result = response.data.result;
    const guesses = response.data.guessArr;

    // sort the array before checking for duplicates
    const sortedGuesses = guesses.slice().sort();
    const set = new Set(sortedGuesses);

    let word = guesses[guesses.length - 1];
    let msg;

    // if the user's guess is a duplicate and displays a message
    // if the guess is a valid word or not, while updating the user's score.
    if (sortedGuesses.length !== set.size) {
      msg = `NO DUPLICATES`;
      this.handleScore(0);
    } else {
      if (result === "ok") {
        msg = `Good job, ${word.toUpperCase()} is a word!!!`;
        this.handleScore(word.length);
      } else {
        msg = `${word.toUpperCase()}, is not on board, or not word.`;
      }
    }

    this.$message.text(msg);
  }

  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  handleScore(num) {
    // Updates the game score and displays it on the webpage.

    this.gameScore += num;
    $("#score").text(`Score: ${this.gameScore}`);
  }

  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  handleTimer() {
    // Handles the game timer by decrementing the countdown and ending the game when time runs out.

    const timer = setInterval(() => {
      this.countDown--;

      // update globals when game is over
      if (this.countDown === 0) {
        this.sendGameData();
        clearInterval(timer);

        this.timeStarted = false;
        this.scoreTracker = [];

        $(".alert-container").css("display", "flex");
        $("#count-down").removeClass("pulse");
      }

      $("#count-down").text(`Time: ${this.countDown}`);
    }, 1000);
  }

  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  sendGameData() {
    // Sends the game score to the server after the game ends.
    axios.post("/gameover", {
      score: this.gameScore,
    });
  }
}

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
const handlNewGame = (event) => {
  // Handles the new game button click event and starts a new game or redirects to the home page.

  event.preventDefault;

  //If the game has not started, start the timer and mark it as started
  if (!game.timeStarted) {
    game.handleTimer();
    game.timeStarted = true;
  }

  // If the countdown is less than 60, button works as reset
  if (game.countDown < 60) {
    window.location.href = "/";
  }

  $("#count-down").addClass("pulse");
  $("#new-game").text("New Game");
  $("#game-board").css("filter", "blur(0px)");
};

const game = new BoggleGame();
$(".new-game").on("click", handlNewGame);

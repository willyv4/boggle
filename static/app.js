class BoggleGame {
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
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

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  handleSubmit(event) {
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
      3000
    );
  }

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  async makeGuess(guess) {
    //Sends a POST request to the server with the user's guess.

    axios
      .post("/guess", {
        inputVal: guess,
      })
      .then(this.handleAxiosResponse);
    console.log(axios);
  }

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  async getHiScore() {
    // Sends a GET request to the server to retrieve the high score and round information.

    axios.get("/highscore").then((response) => {
      this.showHiScore(response.data);
    });
  }

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  showHiScore(data) {
    // Updates the high score and round information on the webpage.

    $("#hi-score").text(`High Score: ${data.max} points`);
    $("#round").text(`Round ${data.round}`);
  }

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  handleAxiosResponse(response) {
    // Handles the response from the server after a guess is made and updates the score and message accordingly.

    const result = response.data.result;
    const guesses = response.data.guessArr;

    let word = guesses[guesses.length - 1];
    let msg;

    // chekcs if the user's guess is a duplicate and displays a message
    // checks if the guess is a valid word or not, while updating the user's score.
    if (this.hasDuplicate(word, guesses)) {
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

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  hasDuplicate(word, guesses) {
    //checks if the given word appears in the guesses array more than once.
    let count = 0;
    for (let i = 0; i < guesses.length; i++) {
      if (guesses[i] === word) {
        count++;
        if (count > 1) {
          return true;
        }
      }
    }
    return false;
  }

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  handleScore(num) {
    // Updates the game score and displays it on the webpage.

    this.gameScore += num;
    $("#score").text(`Score: ${this.gameScore}`);
  }

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
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

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  sendGameData() {
    // Sends the game score to the server after the game ends.
    axios.post("/gameover", {
      score: this.gameScore,
    });
  }
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
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
  $(".new-game").text("New Game");
  $(".blur").removeClass();
};

const game = new BoggleGame();
$(".new-game").on("click", handlNewGame);

class BoggleGame {
  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  constructor() {
    this.$form = $("#boggle-form");
    this.$input = $("#boggle-input");
    this.scoreTracker = [];
    this.timeStarted = false;
    this.countDown = 60;
    this.gameScore = 0;
    this.getHiScore();

    this.$form.on("submit", this.handleSubmit.bind(this));
    this.handleAxiosResponse = this.handleAxiosResponse.bind(this);
  }

  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  handleSubmit(event) {
    event.preventDefault();

    if (this.countDown !== 0) {
      const guess = this.$input.val();
      this.makeGuess(guess);
    }
  }
  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  makeGuess(guess) {
    axios
      .post("/guess", {
        inputVal: guess,
      })
      .then(this.handleAxiosResponse);
  }

  getHiScore() {
    axios.get("/highscore").then((response) => {
      this.showHiScore(response.data);
    });
  }

  showHiScore(data) {
    $("#hi-score").text(`High Score: ${data.max} points`);
    $("#round").text(`Round ${data.round}`);
  }

  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  handleAxiosResponse(response) {
    const result = response.data.result;
    const guesses = response.data.guessArr;
    const $message = $("#message");
    let msg;
    let word;

    for (let guess of guesses) {
      word = guess;
    }

    // sort the array before checking for duplicates
    const sortedGuesses = guesses.slice().sort();

    const set = new Set(sortedGuesses);

    if (sortedGuesses.length !== set.size) {
      msg = `NO DUPLICATES`;
      this.handleScore(0);
    } else {
      if (result === "ok") {
        msg = `Good job, ${word.toUpperCase()} is a word!!!`;
        this.handleScore(word.length);
      } else {
        msg = `Nice Try, ${word.toUpperCase()} is not on board or not word.`;
      }
    }

    $message.text(msg);
  }

  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  handleScore(num) {
    this.gameScore += num;
    $("#score").text(`Score: ${this.gameScore}`);
  }
  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  handleTimer() {
    const timer = setInterval(() => {
      this.countDown--;
      if (this.countDown === 0) {
        console.log(this.gameScore);
        this.sendGameData();
        clearInterval(timer);
        alert("GAMEOVER");

        $("#count-down").removeClass("pulse");
        this.timeStarted = false;
        this.scoreTracker = [];
      }
      $("#count-down").text(`Time: ${this.countDown}`);
    }, 1000);
  }

  sendGameData() {
    axios.post("/gameover", {
      score: this.gameScore,
    });
  }
}

const handlNewGame = (event) => {
  event.preventDefault;

  if (!game.timeStarted) {
    game.handleTimer();
    game.timeStarted = true;
  }

  if (game.countDown < 60) {
    window.location.href = "/";
  }

  $("#count-down").addClass("pulse");
  $("#new-game").text("New Game");
  $("#game-board").css("filter", "blur(0px)");
};

const game = new BoggleGame();
$("#new-game").on("click", handlNewGame);

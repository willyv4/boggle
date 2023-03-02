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
    const word = response.data.word.toUpperCase();
    const $message = $("#message");
    let msg;
    let arr = [];

    if (result === "ok") {
      msg = `Good job, ${word} is a word!!!`;
      arr.push(word);
    } else {
      msg = `Nice Try but ${word}, isn't on the board or it isn't a word.`;
    }

    $message.text(msg);
    this.handleScore(arr);
  }

  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  handleScore(words) {
    for (let letters of words) {
      this.scoreTracker.push(letters.length);
    }

    const total = this.scoreTracker.reduce((a, b) => {
      let answer = a + b;
      return answer;
    }, 0);

    this.gameScore = total;
    $("#score").text(`Score: ${total}`);
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

  if (game.countDown === 0) {
    window.location.href = "/";
  }

  $("#new-game").text("New Game");
  $("#game-board").css("filter", "blur(0px)");
};

const game = new BoggleGame();
$("#new-game").on("click", handlNewGame);

const prompt = require("prompt-sync")({ sigint: true });

const hat = "^";
const hole = "O";
const fieldCharacter = "░";
const pathCharacter = "*";
const holePercent = 0.4;
const maxHolePerRow = 0.35;

class Field {
  constructor() {
    this.field = [];
    this.playerY = 0;
    this.playerX = 0;
    this.fieldHeight = 1;
    this.fieldWidth = 1;
    this.hatX = 0;
    this.hatY = 0;
  }
  badNumber(number) {
    if (
      typeof number != "number" ||
      (typeof number === "number" &&
        (number < 5 || number > 15 || number % 1 != 0))
    ) {
      console.log(
        `\nInvalid Input! Please enter a whole number value between 5 and 15\n`
      );
      return true;
    } else return false;
  }
  generateField() {
    this.fieldWidth = Number(prompt("Field width (5-15): "));
    while (this.badNumber(this.fieldWidth)) {
      this.fieldWidth = Number(prompt("Field width (5-15): "));
    }
    this.fieldHeight = Number(prompt("Field height (5-15): "));
    while (this.badNumber(this.fieldHeight)) {
      this.fieldHeight = Number(prompt("Field height (5-15): "));
    }
    this.field = [];
    let fieldItem = 4;
    let rowItems = [];
    let holeTotalCount = 0;
    let holeRowCount = 0;

    this.hatX = Math.floor(Math.random() * (this.fieldWidth - 2)) + 1;
    this.hatY = Math.floor(Math.random() * (this.fieldHeight - 2)) + 1;

    for (let y = 0; y < this.fieldHeight; y++) {
      for (let x = 0; x < this.fieldWidth; x++) {
        if (x === 0 && y === 0) fieldItem = 5;
        else if (x === this.hatX && y === this.hatY) fieldItem = 4;
        else fieldItem = Math.floor(Math.random() * 4);
        switch (fieldItem) {
          case 5:
            rowItems.push(pathCharacter);
            break;
          case 4:
            rowItems.push(hat);
            break;
          case 3:
            if (holeTotalCount / (this.fieldHeight * this.fieldWidth) >= holePercent 
                || holeRowCount / this.fieldWidth >= maxHolePerRow)
              rowItems.push(fieldCharacter);
            else {
              rowItems.push(hole);
              holeTotalCount++;
              holeRowCount++;              
            }
            break;
          default:
            rowItems.push(fieldCharacter);
            break;
        }
      }
      this.field.push(rowItems);
      rowItems = [];
      holeRowCount = 0;
    }
  }
  validateField() {}
  print() {
    let row = "";
    this.field.forEach((y) => {
      y.forEach((x) => {
        row = row + x;
      });
      console.log(row);
      row = "";
    });
  }
  getInput() {
    let input = prompt("Which way? (d, u, l, or r)");
    switch (input) {
      case "d":
        this.playerY++;
        break;
      case "u":
        this.playerY--;
        break;
      case "l":
        this.playerX--;
        break;
      case "r":
        this.playerX++;
        break;
      default:
        console.log(
          "\nInvalid input, please try again!\nValid Inputs:\nd for down\nu for up\nl for left\nr for right"
        );
        break;
    }
    console.log();
  }
  movePlayer() {
    if (!this.isOutOfBounds() || !this.isHole())
      this.field[this.playerY][this.playerX] = pathCharacter;
  }
  isOutOfBounds() {
    if (
      this.playerY < 0 ||
      this.playerY >= this.field.length ||
      this.playerX < 0 ||
      this.playerX >= this.field[0].length
    ) {
      console.log("You went out of bounds. Game Over!");
      return true;
    } else return false;
  }
  isHole() {
    if (!this.isOutOfBounds) {
      return true;
    }
    if (this.field[this.playerY][this.playerX] === hole) {
      console.log("Sorry, you fell down a hole. Game Over!");
      return true;
    } else return false;
  }
  isWin() {
    if (this.field[this.playerY][this.playerX] === hat) {
      console.log("Congrats! You found your hat!");
      return true;
    } else return false;
  }
  playGame() {
    this.generateField();
    while (!this.isOutOfBounds() && !this.isWin() && !this.isHole()) {
      this.print();
      this.getInput();
      if (this.isOutOfBounds() || this.isWin() || this.isHole()) {
        break;
      }
      this.movePlayer();
    }
  }
}

const myField = new Field();

myField.playGame();

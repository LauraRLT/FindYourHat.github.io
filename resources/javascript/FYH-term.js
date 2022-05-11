const prompt = require("prompt-sync")({ sigint: true });
const term = require("terminal-kit").terminal;

const hat = "^";
const hole = "O";
const fieldCharacter = "▓";
const pathCharacter = "░";
const playerCharacter = "*";
const holePercent = 0.4;
const maxHolePerRow = 0.35;
const maxSize = 25;
const minSize = 5;

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
        (number < minSize || number > maxSize || number % 1 != 0))
    ) {
      console.log(`\nInvalid Input! Please enter a whole number value between ${minSize} and ${maxSize}\n`);
      return true;
    } else return false;
  }

  generateField() {
    this.fieldWidth = Number(prompt(`Field width (${minSize}-${maxSize}): `));
    while (this.badNumber(this.fieldWidth)) {
      this.fieldWidth = Number(prompt(`Field width (${minSize}-${maxSize}): `));
    }
    this.fieldHeight = Number(prompt(`Field height (${minSize}-${maxSize}):)`));
    while (this.badNumber(this.fieldHeight)) {
      this.fieldHeight = Number(
        prompt(`Field height (${minSize}-${maxSize}): `)
      );
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
            rowItems.push(playerCharacter);
            break;
          case 4:
            rowItems.push(hat);
            break;
          case 3:
            if (
              holeTotalCount / (this.fieldHeight * this.fieldWidth) >=
                holePercent ||
              holeRowCount / this.fieldWidth >= maxHolePerRow
            )
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
    console.log();
  }

  validateField() {}

  print() {
    console.clear();
    return new Promise((resolve, reject) => {
      let row = " ";
      //print top border
      term.bgMagenta("┌");
      for (let i = 0; i < this.fieldWidth; i++) {
        term.bgMagenta("─");
      }
      term.bgMagenta("┐");
      term("\n");
      //print main field
      this.field.forEach((y) => {
        y.forEach((x) => {
          row = row + x;
        });
        row = row + " ";
        for (let i = 0; i < this.fieldWidth + 1; i++) {
          switch (row[i]) {
            case hat:
              term.green.bgBlack(row[i]);
              break;
            case hole:
              term.red.bgBlack(row[i]);
              break;
            case fieldCharacter:
              term.black.bgWhite(row[i]);
              break;
            case playerCharacter:
              term.cyan.bgBlack(row[i]);
              break;
            case pathCharacter:
              term.black.bgWhite(row[i]);
              break;
            default:
              term.white.bgMagenta("│");
              break;
          }
        }
        term.bgMagenta("│\n");
        row = " ";
      });
      //print bottom border
      term.bgMagenta("└");
      for (let i = 0; i < this.fieldWidth; i++) {
        term.bgMagenta("─");
      }
      term.bgMagenta("┘");
      term("\n");
      resolve(true);
    });
  }
  getInput() {
    let input = prompt("Which way? (wasd)");
    switch (input) {
      case "s":
        this.field[this.playerY][this.playerX] = pathCharacter;
        this.playerY++;
        break;
      case "w":
        this.field[this.playerY][this.playerX] = pathCharacter;
        this.playerY--;
        break;
      case "a":
        this.field[this.playerY][this.playerX] = pathCharacter;
        this.playerX--;
        break;
      case "d":
        this.field[this.playerY][this.playerX] = pathCharacter;
        this.playerX++;
        break;
      default:
        console.log("\nInvalid input, please try again!\nValid Inputs:\nw for up ↑\na for left ←\ns for down ↓\nd for right →\n");
        break;
    }
    console.log();
  }
  movePlayer() {
    if (!this.isOutOfBounds() || !this.isHole())
      this.field[this.playerY][this.playerX] = playerCharacter;
  }
  isOutOfBounds() {
    if (
      this.playerY < 0 ||
      this.playerY >= this.field.length ||
      this.playerX < 0 ||
      this.playerX >= this.field[0].length
    ) {
      term.red("^+You went out of bounds. Game Over!\n\n");
      return true;
    } else return false;
  }
  isHole() {
    if (!this.isOutOfBounds) {
      return true;
    }
    if (this.field[this.playerY][this.playerX] === hole) {
      term.red("^+Sorry, you fell down a hole. Game Over!\n\n");
      return true;
    } else return false;
  }
  isWin() {
    if (this.field[this.playerY][this.playerX] === hat) {
      term.green(`^g^+                 _
               /\`_>
              / /
              |/
          ____|    __
         |    \\.-\`\`  )
         |---\`\`\\  _.'
      .-\`'---\`\`_.'
     (__...--\`\`        \n\nCongrats! You found your hat!\n\n`);
      return true;
    } else return false;
  }
  playGame() {
    term.wrap(`^mWelcome to my version of the find your hat game!\n
^bInstructions^ 
    Icons
        Player: ^c${playerCharacter}^ 
        Hat: ^g^${hat} 
        ^wHole: ^r${hole}^ 
        Field: ${fieldCharacter}
        Path: ${pathCharacter}\n
^g^+The goal is to move the Player character through the field spaces and reach the Hat without falling in any holes or going out of bounds.^
\n^bUse your keyboard to type your input and then press ENTER\n
Use wasd for movement
  w for up ↑
  a for left ←
  s for down ↓
  d for right →

^r^+Warning:^ ^r^/I can not yet guarantee that every game can be won. That code is still in development.^ 

^+^CStart by inputting the size of the field\n\n`);
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

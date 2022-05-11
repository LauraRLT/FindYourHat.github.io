const prompt = require("prompt-sync")({ sigint: true });

const hat = "^";
const hole = "O";
const fieldCharacter = "░";
const pathCharacter = "▓";
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
    this.fieldHeight = 0;
    this.fieldWidth = 0;
    this.hatX = 0;
    this.hatY = 0;
    //properties used to check if field is solvable
    this.solver = [];
    this.solverWasHere = [];
    this.booleanField = []
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
    this.field = [];
    let fieldItem = 0;
    let rowItems = [];
    let solverRowItems = [];
    let booleanRowItems = []
    let holeTotalCount = 0;
    let holeRowCount = 0;
    let minXDistance = Math.max(2,Math.floor(this.fieldWidth / 5));
    let minYDistance = Math.max(2,Math.floor(this.fieldHeight / 5));
    
    this.playerX = Math.floor(Math.random() * (this.fieldWidth));
    this.playerY = Math.floor(Math.random() * (this.fieldHeight));
    
    do {
      this.hatX = Math.floor(Math.random() * (this.fieldWidth));
      this.hatY = Math.floor(Math.random() * (this.fieldHeight));
    } while (Math.abs(this.hatX-this.playerX) < minXDistance && Math.abs(this.hatY-this.playerY) < minYDistance)

    for (let y = 0; y < this.fieldHeight; y++) {
      for (let x = 0; x < this.fieldWidth; x++) {
        if (x === this.playerX && y === this.playerY) fieldItem = 5;
        else if (x === this.hatX && y === this.hatY) fieldItem = 4;
        else fieldItem = Math.floor(Math.random() * 4);
        solverRowItems.push(false);
        switch (fieldItem) {
          case 5:
            rowItems.push(playerCharacter);
            booleanRowItems.push(false);
            break;
          case 4:
            rowItems.push(hat);
            booleanRowItems.push(false);
            break;
          case 3:
            if (
              holeTotalCount / (this.fieldHeight * this.fieldWidth) >= holePercent 
              || holeRowCount / this.fieldWidth >= maxHolePerRow
            ){
              rowItems.push(fieldCharacter);
              booleanRowItems.push(false);
            }
            else {
              rowItems.push(hole);
              booleanRowItems.push(true);
              holeTotalCount++;
              holeRowCount++;
            }
            break;
          default:
            rowItems.push(fieldCharacter);
            booleanRowItems.push(false);
            break;
        }
      }
      this.field.push(rowItems);
      this.solver.push(solverRowItems)
      this.solverWasHere.push(solverRowItems)
      this.booleanField.push(booleanRowItems)
      rowItems = [];
      solverRowItems = [];
      booleanRowItems = [];
      holeRowCount = 0;
    }
    if(this.validateField(this.playerX, this.playerY))
    console.log();
    else this.generateField()
  }

  validateField(x,y) {
    //if reached end
    if (x === this.hatX && y === this.hatY) return true 
    //if solver was already here or current coords is a hole
    if (this.booleanField[y][x] || this.solverWasHere[y][x]) return false;
    this.solverWasHere[y][x] = true;
    if (x != 0) //if not on left edge
      if (this.validateField(x-1,y)) { //checks to the left
        this.solver[y][x] = true
        return true
      }
    if (x != this.fieldWidth -1) { //if not on right edge
      if(this.validateField(x+1,y)) { //checks to the right
        this.solver[y][x] = true
        return true
      }
    }
    if (y != 0) //if not on top edge
      if (this.validateField(x,y-1)) { //checks above
        this.solver[y][x] = true
        return true
      }
    if (y != this.fieldHeight -1) { //if not on bottom edge
      if(this.validateField(x,y+1)) { //checks below
        this.solver[y][x] = true
        return true
      }
    }
    return false;
  }
  
  print() {
    //console.clear();
    let row = "┌";
    //create top border
    for (let i = 0; i < this.fieldWidth; i++) {
      row+= "─";
    }
    row+= "┐";
    console.log(row);
    row = "│";
    this.field.forEach((y) => {
      y.forEach((x) => {
        row = row + x;
      });
      row += "│";
      console.log(row);
      row = "│";
    });
    //create bottom border
    row = "└";
    for (let i = 0; i < this.fieldWidth; i++) {
      row+= "─";
    }
    row+= "┘";
    console.log(row);
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
      console.log("You went out of bounds. Game Over!\n");
      return true;
    } else return false;
  }

  isHole() {
    if (!this.isOutOfBounds) {
      return true;
    }
    if (this.field[this.playerY][this.playerX] === hole) {
      console.log("Sorry, you fell down a hole. Game Over!\n");
      return true;
    } else return false;
  }

  isWin() {
    if (this.field[this.playerY][this.playerX] === hat) {
      console.log(`                 _
               /\`_>
              / /
              |/
          ____|    __
         |    \\.-\`\`  )
         |---\`\`\\  _.'
      .-\`'---\`\`_.'
     (__...--\`\`        \n\nCongrats! You found your hat!\n`);
      return true;
    } else return false;
  }
  
  playGame() {
    console.log(`Welcome to my version of the find your hat game!\n
Instructions
    Icons
        Player: ${playerCharacter}
        Hat: ${hat} 
        Hole: ${hole}
        Field: ${fieldCharacter}
        Path: ${pathCharacter}\n
The goal is to move the Player character through the field spaces and reach the Hat without falling in any holes or going out of bounds.
\nUse your keyboard to type your input and then press ENTER\n
Use wasd for movement
  w for up ↑
  a for left ←
  s for down ↓
  d for right →

Start by inputting the size of the field\n`);  
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

  printField(array) {
    //console.clear();
    let row = "";
    array.forEach((y) => {
      y.forEach((x) => {
        row += ' ' + x;
        if(x === true) row += ' '
      });
      console.log(row);
      row = "";
    });
  }
}

const myField = new Field();
myField.playGame();
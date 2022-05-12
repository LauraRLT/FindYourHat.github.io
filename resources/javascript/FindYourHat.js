const prompt = require("prompt-sync")({ sigint: true });

const hat = "^";
const hole = "O";
const fieldCharacter = "▓";
const pathCharacter = "░";
const playerCharacter = "*";
let holePercent = 0.60;
let maxHolePerRow = 0.60;
const maxSize = 25;
const minSize = 5;

class Field {
  constructor() {
    this.field = [];
    this.playerY = 0;
    this.playerX = 0;
    this.fieldHeight = 10;
    this.fieldWidth = 10;
    this.hatX = 0;
    this.hatY = 0;
    //properties used to check if field is solvable
    this.solver = []; //boolean array with a solution to the maze
    this.solverWasHere = []; //has the solver been to this set of coordinates
    this.booleanField = [] //boolean version of the field
    //properties used for hard mode
    this.hardmode = false;
    this.play = true;
  }
  
  badNumber(number, min, max) {
    if (
      typeof number != "number" ||
      (typeof number === "number" &&
        (number < min || number > max || number % 1 != 0))
    ) {
      console.log(`\nInvalid Input! Please enter a whole number value between ${min} and ${max}\n`);
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
    if(this.hardmode)
        this.addHole()
  }

  isOutOfBounds() {
    if (
      this.playerY < 0 ||
      this.playerY >= this.field.length ||
      this.playerX < 0 ||
      this.playerX >= this.field[0].length
    ) {
      console.log("You went out of bounds. Game Over!\n");
      this.play = false;
    }
  }

  isHole() {
    if (!this.isOutOfBounds) {
      return true;
    }
    if (this.field[this.playerY][this.playerX] === hole) {
      console.log("Sorry, you fell down a hole. Game Over!\n");
      this.play = false;
    }
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
     this.play = false;
   }
  }

  settings() {
    console.log('\nSETTINGS')
    //set size of field
    if(this.ask('change the size of the field')){
      console.log(`\nSET DIMENSIONS OF THE GAME FIELD`)
      this.fieldWidth = Number(prompt(`Field width (${minSize}-${maxSize}): `));
      while (this.badNumber(this.fieldWidth, minSize, maxSize)) {
        this.fieldWidth = Number(prompt(`Field width (${minSize}-${maxSize}): `));
      }
      this.fieldHeight = Number(prompt(`Field height (${minSize}-${maxSize}): `));
      while (this.badNumber(this.fieldHeight, minSize, maxSize)) {
        this.fieldHeight = Number(prompt(`Field height (${minSize}-${maxSize}): `));
      }
    }
    //set hardmode on or off
    console.log(`\nHARD MODE: hard mode will randomly add a hole after every move you make. The game will automatically end if the game is no longer solvable.`)
    this.hardmode = this.ask('activate HARD MODE')
    //change percentage of holes
    if(this.ask('increase or decrease the amount of holes')) {
      console.log('\nSET PERCENT OF HOLES\n1= Minimum Holes, 10= Maximum Holes')
      let numHoles = Number(prompt(`Choose a number from 1-10: `))
      while (this.badNumber(numHoles, 1, 10)) {
        numHoles = Number(prompt(`Choose a number from 1-10: `))
      }
      switch (numHoles) {
        case 1:
          holePercent = 0.2
          maxHolePerRow = 0.1
          break;
        case 2:
          holePercent = 0.25
          maxHolePerRow = 0.2
          break;
        case 3:
          holePercent = 0.3
          maxHolePerRow = 0.3
          break;
        case 4:
          holePercent = 0.4
          maxHolePerRow = 0.4
          break;
        case 5:
          holePercent = 0.5
          maxHolePerRow = 0.5
          break;
        case 6:
          holePercent = 0.6
          maxHolePerRow = 0.6
          break;
        case 7:
          holePercent = 0.7
          maxHolePerRow = 0.7
          break;
        case 8:
          holePercent = 0.75
          maxHolePerRow = 0.75
          break;
        case 9:
          holePercent = 0.8
          maxHolePerRow = 0.8
          break;
        case 10:
          holePercent = 0.85
          maxHolePerRow = 0.85
          break;
      }
    }
    console.log(`Settings established. Please enjoy the game!`)
  }

  addHole(){
    let newHoleX = Math.floor(Math.random() * (this.fieldWidth));
    let newHoleY = Math.floor(Math.random() * (this.fieldHeight));
    let numEmptySpaces = 0;

    this.field.forEach((y) => {
      y.forEach((x) => {
        if(x === pathCharacter || x === fieldCharacter) numEmptySpaces ++;
      });
    })
    
    while(
      (
        this.field[newHoleY][newHoleX] === hole ||
        this.field[newHoleY][newHoleX] === playerCharacter ||
        this.field[newHoleY][newHoleX] === hat      
      ) 
      && numEmptySpaces > 0
    ) {
      newHoleX = Math.floor(Math.random() * (this.fieldWidth));
      newHoleY = Math.floor(Math.random() * (this.fieldHeight));
    }

    if (numEmptySpaces != 0) {
      this.field[newHoleY][newHoleX] = hole;
    }
    console.log(`New Hole Added!`)
    //reset values for validateField
    this.solver = []; //boolean array with a solution to the maze
    this.solverWasHere = []; //has the solver been to this set of coordinates
    this.booleanField = [] //boolean version of the field
    let solverRowItems = [];
    let booleanRowItems = []
    this.field.forEach((y) => {
     y.forEach((x) => {
        solverRowItems.push(false);
        switch (x) {
          case hole:
              booleanRowItems.push(true);
            break;
          default:
            booleanRowItems.push(false);
            break;
        }
      })
      this.solver.push(solverRowItems)
      this.solverWasHere.push(solverRowItems)
      this.booleanField.push(booleanRowItems)
      solverRowItems = [];
      booleanRowItems = [];
    })
    if(!this.validateField(this.playerX, this.playerY)) {
      this.play = false
      this.print()
      console.log('You can no longer reach the hat! Game Over!')
    }    
  }

  ask(question) {
    console.log()
    let input = prompt(`Would you like to ${question}? (y/n) `).toLowerCase()
    while (input != 'y' && input != 'n') {
      console.log(`Invalid input. Please enter y to ${question} or n to decline.`)
      input = prompt(`Would you like to ${question}? (y/n) `).toLowerCase()
    }
    if (input === 'y') return true;
    else return false
  }

  instructions() {
    console.log(`Welcome to my version of the find your hat game!\n
Instructions
    Icons
        Player: ${playerCharacter}
        Hat: ${hat} 
        Hole: ${hole}
        Field: ${fieldCharacter}
        Path: ${pathCharacter}\n
The goal is to move the Player character through the field spaces and reach the Hat without falling in any holes or going out of bounds.
Use wasd for movement
  w for up ↑
  a for left ←
  s for down ↓
  d for right →\n`)
  }
  
  playGame() {
    console.log(`Welcome to my version of the find your hat game!\n\nUse your keyboard to type your input and then press ENTER`);  

    if(this.ask('view the instructions')) this.instructions();
    
    if (this.ask('adjust the settings')) {
      console.log()  
      this.settings()
    }
    
    this.generateField();
    while (this.play) {
      this.print();
      this.getInput();
      this.isOutOfBounds()
      this.isWin()
      this.isHole() 
      if(this.play)
        this.movePlayer();
    }
    
    if (this.ask('play again')) {
      console.log()  
      this.playGame()
    }
    else console.log(`Thank you for playing! Goodbye :)`)
  }
}

const myField = new Field();
myField.playGame();
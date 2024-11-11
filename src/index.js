import './styles.css';
const optionContainer = document.querySelector('.option-container')
const flipButton = document.querySelector('#flip-button')
const gamesBoard = document.querySelector('#gamesboard-container')
const startButton = document.querySelector('#start-button')
const infoDisplay = document.querySelector('#info')
const turnDisplay = document.querySelector('#turn')


let angle = 0;
function flip(){
    const optionShips = Array.from(optionContainer.children)
    optionShips.forEach(optionShip => optionShip.style.transform = `rotate(${angle}deg)`)
    angle = angle === 0 ? 90 : 0;
}
flipButton.addEventListener('click', flip)


const width = 10; 

function createBoard(color, user) {
 const gameBoardContainer = document.createElement('div')
 gameBoardContainer.classList.add('games-board')
 gameBoardContainer.style.backgroundColor = color;
 gameBoardContainer.id = user;

 for (let i = 0; i < width * width; i++) {
    const block = document.createElement('div')
     block.classList.add('block')
     block.id = i;
    gameBoardContainer.append(block)
 }
 gamesBoard.append(gameBoardContainer)
}
createBoard('lightpink', 'player')
createBoard('lightyellow', 'computer')

class ship {
    constructor(name, length) {
        this.name = name;
        this.length = length;

    }
}

const destroyer = new ship ('destroyer', 2);
const submarine = new ship ('submarine', 3);
const cruiser = new ship ('cruiser', 3);
const battleship = new ship ('battleship', 4);
const carrier = new ship ('carrier', 5);

const ships = [
    destroyer, submarine, cruiser,
    battleship, carrier]
let notDropped;

function getValidity(allBoardBlocks, isHorizontal, startIndex, ship ) {

    let validStart = isHorizontal ? startIndex <= width * width - ship.length ? startIndex :
     width * width - ship.length :

     startIndex <= width * width - width * ship.length ? startIndex : 
      startIndex - ship.length * width + width
     

    let shipBlocks = []

    for(let i = 0; i < ship.length; i++){
        if(isHorizontal){
            shipBlocks.push(allBoardBlocks[Number(validStart) + i])
        } else {
            shipBlocks.push(allBoardBlocks[Number(validStart) + i * width])
        }
    } let valid 

    if (isHorizontal) {
        valid = shipBlocks.every((_shipBlock, index) =>
          Number(shipBlocks[0].id) % width <= width - shipBlocks.length + index
        );
      } else {
        valid = shipBlocks.every((_shipBlock, index) =>
          Number(shipBlocks[0].id) + (width * index) < width * width
        );
      }
      
      const notTaken = shipBlocks.every(shipBlock => !shipBlock.classList.contains('taken')) 


     return {shipBlocks, valid, notTaken}
 }

function addShipPiece(user, ship, startId, isHorizontal) {
    const allBoardBlocks = document.querySelectorAll(`#${user} div`)
    let randomBoolean = Math.random() < 0.5;
    isHorizontal = user == 'player' ? isHorizontal: randomBoolean;
    let randomStartIndex = Math.floor(Math.random() * width * width)

    let startIndex = startId ? startId : randomStartIndex

   const {shipBlocks, valid, notTaken} = getValidity(allBoardBlocks, isHorizontal, startIndex, ship )

     if (valid && notTaken) {
      shipBlocks.forEach(shipBlock => {
        shipBlock.classList.add(ship.name)
        shipBlock.classList.add('taken')
    })
     } else {
       if (user === 'computer') addShipPiece(user, ship, startId)
        if (user === 'player') notDropped = true;
     }
} 
ships.forEach(ship => addShipPiece('computer', ship));

let draggedShip
const optionShips = Array.from(optionContainer.children)
optionShips.forEach(optionShip => optionShip.addEventListener('dragstart', dragStart))

const allPlayerBlocks = document.querySelectorAll('#player div')
allPlayerBlocks.forEach(playerBlock => {
    playerBlock.addEventListener('dragover', dragOver)
    playerBlock.addEventListener('drop', dropShip)
})

function dragStart(e) {
 draggedShip = e.target;
 notDropped = false;
}

function dragOver(e) {
    e.preventDefault() 
   const ship = ships[draggedShip.id]
   const isHorizontal = angle === 90;
   highlightedArea(e.target.id, ship, isHorizontal)
}

function dropShip(e) {
    const startId = e.target.id
    const ship = ships[draggedShip.id]
    const isHorizontal = angle === 90;
    addShipPiece('player', ship, startId, isHorizontal);
    if(!notDropped) {
        draggedShip.remove()
    }
}

function highlightedArea(startIndex, ship, isHorizontal){
    const allBoardBlocks = document.querySelectorAll('#player div')
    const {shipBlocks, valid, notTaken} = getValidity(allBoardBlocks, isHorizontal, startIndex, ship)

    if(valid && notTaken) {
        shipBlocks.forEach(shipBlock => {
            shipBlock.classList.add('hover')
            setTimeout(() => shipBlock.classList.remove('hover'), 500)
        })
    }
}


let gameOver = false
let playerTurn

function startGame(){
     if (optionContainer.children.length != 0) {
        infoDisplay.textContent = ' Please place all your pieces first.'

     } else {
       const allBoardBlocks =  document.querySelectorAll('#computer div')
       allBoardBlocks.forEach(block => block.addEventListener('click', handleClick))
     }
}
let playerHits = []
let computerHits = []

function handleClick(e) {
    if(!gameOver) {
        if(e.target.classList.contains('taken')) {
            e.target.classList.add('boom')
            infoDisplay.textContent = ' You hit the computers ship!'
            let classes = Array.from(e.target.classList)
            classes = classes.filter(className => className !== 'block')
            classes = classes.filter(className => className !== 'boom')
            classes = classes.filter(className => className !== 'taken')
            playerHits.push(...classes)
        }
        if (e.target.classList.contain('taken')) {
            infoDisplay.textContent = 'Nothing hit this time.'
            e.target.classList.add('empty')
        }
    }
}

startButton.addEventListener('click', startGame)
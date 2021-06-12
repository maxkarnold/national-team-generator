const positions = ['GK', 'RB', 'LB', 'CB', 'LWB', 'RWB', 'DM', 'MC', 'ML', 'MR', 'AMR', 'AML', 'AMC', 'ST'];
let positionObjs = [];
for (position of positions) {
    positionObjs.push({
        position: position,
        amount: 0,
    });
}

const playerAmount = 60;

const genButton = document.querySelector('button');
const container = document.querySelector('.container')
const containerList = document.querySelector('ul');
const positionsTable = document.querySelector('table');
const selectOption = document.querySelector('select');

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
    //The maximum is inclusive and the minimum is inclusive
  }

function getRandomName() {

}

function generatePlayers(numArray) {
    let first = getRandomInt(numArray[0], numArray[1]);
    let second = getRandomInt(numArray[2], numArray[3]);
    let third = getRandomInt(numArray[4], numArray[5]);
    let fourth = getRandomInt(numArray[6], numArray[7]);
    let fifth = getRandomInt(numArray[8], numArray[9]);
    // Create players
    for (let i = 0; i < playerAmount; i++) {
        let player = document.createElement('li');
        playerAttributes = 2;
        // Each of the player attributes
        // Position
        let pos = document.createElement('div');
        let randomPos = getRandomInt(0, 13);
        // If there are 6 players in a certain position, choose a different position that doesn't have 6
        if (positionObjs[randomPos].amount > 5) {
            console.log(positionObjs[randomPos].position, positionObjs[randomPos].amount);
            let oldPos = randomPos;
            // Prioritize 3 GKs
            if (positionObjs[0].amount < 3) {
                randomPos = 0;
                console.log(`player index: ${i}\nold position: ${positions[oldPos]}\nnew position: ${positions[randomPos]}`);
            }   
            // Then prioritize 2 STs
            else if (positionObjs[13].amount < 2) {
                randomPos = 13;
                console.log(`player index: ${i}\nold position: ${positions[oldPos]}\nnew position: ${positions[randomPos]}`);
            }
            // Then prioritize 3 CBs
            else if (positionObjs[3].amount < 3) {
                randomPos = 3;
                console.log(`player index: ${i}\nold position: ${positions[oldPos]}\nnew position: ${positions[randomPos]}`);
            }
            // Then priortize 3 CMs
            else if (positionObjs[7].amount < 3) {
                randomPos = 7;
                console.log(`player index: ${i}\nold position: ${positions[oldPos]}\nnew position: ${positions[randomPos]}`);
            }
            // Otherwise add to any position
            else { 
                for (positon in positions) {
                    if (positionObjs[randomPos].amount > 5) {
                        randomPos = getRandomInt(0, 13);
                        console.log(`player index: ${i}\nold position: ${positions[oldPos]}\nnew position: ${positions[randomPos]}`);
                    }
                }
            }
            
        }
        for (obj of positionObjs) {
            if (obj.position === positions[randomPos]) {
                obj.amount++;
            }
        }
        pos.innerHTML = `${i} ${positions[randomPos]}`;
        // Rating
        let ratingDiv = document.createElement('div');
        let rating;
        if (i < first) {
            rating = Math.min(getRandomInt(85,99), getRandomInt(85, 99), getRandomInt(85, 99));
        }
        else if(i < first + second) {rating = getRandomInt(77, 84)}
        else if (i < first + second + third) {rating = getRandomInt(70, 76)}
        else if (i < first + second + third + fourth) {rating = getRandomInt(62, 69)}
        else if (i < first + second + third + fourth + fifth) {rating = getRandomInt(55, 61)}

        ratingDiv.innerHTML = rating;
        
        // Footedness
        let foot = getPlayerFoot(positions[randomPos])
        let footDiv = document.createElement('div');
        footDiv.innerHTML = `${foot} footed`;
        // Appending elements
        player.append(pos, ratingDiv, footDiv);

        containerList.appendChild(player);
    }
    // Create Table for position amounts
    for (let i = 0; i < 2; i++) {
        let row = document.createElement('tr');
        for (position in positions) {
            let cell = document.createElement('td');
            if (i === 0) {
                cell.innerHTML = positionObjs[position].position;
            }   
            else {cell.innerHTML = positionObjs[position].amount}  
            row.appendChild(cell);
        }
        positionsTable.appendChild(row);
    }
}

// Player Footedness Function

function getPlayerFoot(pos) {
    let num = getRandomInt(1, 100);
    switch (pos) {
        case 'GK':
        case 'CB':
        case 'DM':
        case 'MC':
        case 'AMC':
        case 'ST':
            if (num < 76.5) { return 'right' } 
            else if (num < 96) { return 'left' }
            else { return 'either' }
        case 'AML':
        case 'ML':
            if (num < 50) { return 'left' }
            else if (num < 96) { return 'right' }
            else {return 'either' }
        case 'LB':
        case 'LWB':
            if (num < 75) {return 'left'}
            else if (num < 96) {return 'right'}
            else {return 'either'}
        case 'AMR':
        case 'MR':
            if (num < 70) {return 'right'}
            else if (num < 96) {return 'left'}
            else {return 'either'}
        case 'RB':
        case 'RWB':
            if (num < 96) {return 'right'}
            else {return 'either'}
        
        default:
            console.log('Error in the function getPlayerFoot()');
            break;
    }
}

genButton.addEventListener('click', (e) => {
    e.preventDefault();
    // RESETS
    containerList.innerHTML = '';
    positionsTable.innerHTML = '';
    for (position of positionObjs) {
        position.amount = 0;
    }
    // Class assignments
    container.className = 'container-visible';
    positionsTable.className = 'positionsTable';
    containerList.className = 'containerList';
    // numArray represents the number of players from each rating bracket/tier
    // Every two numbers is a range for example 4,8,8,14 represents a range from 4-8 and 8-14
    let numArray = [];
    switch (selectOption.value) {
        case 's':
            numArray = [4, 8, 8, 14, 10, 20, 15, 30, 25, 35];
            generatePlayers(numArray);
            break;

        default:
            break;
    }
    
    
});
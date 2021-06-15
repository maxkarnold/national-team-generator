// IMPORTS
import {nameGenerator as nameGen, db} from '../config.js';
// *** FUNCTIONS TO ADD ***
// function generateSecondaryPositions() {
//     adds other/secondary positions to players based on their main position (not for GKs)
//     1. Will pick a random number of secondary positions between 1 and 3
//     2. Picks positions that are close in proximity
// }

// function generateAge() {
//     Picks a random age for each player based on probability
// }

async function getDatabaseNames() {
    let firstNameID = getRandomInt(0, 23354);
    let lastNameID = getRandomInt(0, 6755);

    db.collection("first_names").where("id", "==", firstNameID).limit(1)
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                // doc.data() is never undefined for query doc snapshots
                console.log(doc.id, " => ", doc.data());
            });
        })
        .catch((error) => {
            console.log("Error getting documents: ", error);
        });

    db.collection("last_names").where("id", "==", lastNameID).limit(1)
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                // doc.data() is never undefined for query doc snapshots
                console.log(doc.id, " => ", doc.data());
            });
        })
        .catch((error) => {
            console.log("Error getting documents: ", error);
        });
    
}

async function getRandomNames(index, nation) {
    
    // Params and URL
    let params = {
        ethnicity: '',
        key: nameGen.apiKey,
        number: index,
    };
    if (nation !== null) {params.ethnicity = `usage=${nation}&`};
    let url = `https://www.behindthename.com/api/random.json?gender=m&${params.ethnicity}number=${params.number}&randomsurname=yes&key=${params.key}`;
    console.log('URL: ', url);
    // return;
    // HTTP Request
    let response = await fetch(url);
    // console.log('Made an API request!');
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    };
    let namesObj =  await response.json();
    // console.log('Response: ', response);
    console.log('JS Object: ', namesObj);
    return namesObj;
//     picks a random name based on nation picked
//     1. Default name will be a totally random name with any nationality
//     2. function will accept an argument that has the nation selected

//     Will use behindthename.com API
//     Find the API key and instructions here ---> https://www.behindthename.com/api/help.php
}

// function generateRandomFace(nation) {
//     generates a random face based on ethnicity/nationaltiy
//     1. Default face will be totally random like the name
//     2. funciton will accept argument that has nation/ethnicity selected
// }

// Need to add functionality that has an accordion set up
// Need to be able to see a screen where you can drag and drop players into positions, this can be on a separate html page
// *** FUNCTIONS TO ADD ***

const positions = ['GK', 'RB', 'LB', 'CB', 'LWB', 'RWB', 'DM', 'MC', 'ML', 'MR', 'AMR', 'AML', 'AMC', 'ST'];
let positionObjs = [];
for (let position of positions) {
    positionObjs.push({
        position: position,
        amount: 0,
    });
}

const playerAmount = 60;
let resets = 0;

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

function generatePlayers(numArray) {
    let first = getRandomInt(numArray[0], numArray[1]);
    let second = getRandomInt(numArray[2], numArray[3]);
    let third = getRandomInt(numArray[4], numArray[5]);
    let fourth = getRandomInt(numArray[6], numArray[7]);
    let fifth = getRandomInt(numArray[8], numArray[9]);

    let randomNames = [];
    // Create players
    for (let i = 0; i < playerAmount; i++) {
        let player = document.createElement('li');
        // Each of the player attributes
        // PlayerName
        let nameDiv = document.createElement('div');
        let fullName = getDatabaseNames();
        nameDiv.innerHTML = fullName;
        // let indexNum;
        // if (i === 56) {indexNum = 3}
        // else if (i % 7 === 0) {indexNum = 6};

        // window.setTimeout(() => {
        //         let jsObj = getRandomNames(indexNum, null);
        //         for (const name of jsObj.names) {
        //             randomNames.push(name);
        //         }
        // }, 500);
        // console.log(randomNames[i]);
        // Position
        let pos = document.createElement('div');
        let randomPos = getRandomInt(0, 13);
        // If there are 6 players in a certain position, choose a different position that doesn't have 6
        if (positionObjs[randomPos].amount > 5) {
            // console.log(positionObjs[randomPos].position, positionObjs[randomPos].amount);
            let oldPos = randomPos;
            // Prioritize 3 GKs
            if (positionObjs[0].amount < 3) {
                randomPos = 0;
                // console.log(`player index: ${i}\nold position: ${positions[oldPos]}\nnew position: ${positions[randomPos]}`);
            }   
            // Then prioritize 2 STs
            else if (positionObjs[13].amount < 2) {
                randomPos = 13;
                // console.log(`player index: ${i}\nold position: ${positions[oldPos]}\nnew position: ${positions[randomPos]}`);
            }
            // Then prioritize 3 CBs
            else if (positionObjs[3].amount < 3) {
                randomPos = 3;
                // console.log(`player index: ${i}\nold position: ${positions[oldPos]}\nnew position: ${positions[randomPos]}`);
            }
            // Then priortize 3 CMs
            else if (positionObjs[7].amount < 3) {
                randomPos = 7;
                // console.log(`player index: ${i}\nold position: ${positions[oldPos]}\nnew position: ${positions[randomPos]}`);
            }
            // Otherwise add to any position
            else { 
                for (let j = 0; j < positions.length; j++) {
                    if (positionObjs[randomPos].amount > 5) {
                        randomPos = getRandomInt(0, 13);
                        // console.log(`player index: ${j}\nold position: ${positions[oldPos]}\nnew position: ${positions[randomPos]}`);
                    }
                }
            }
            
        }
        for (let obj of positionObjs) {
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
        player.append(nameDiv, pos, ratingDiv, footDiv);

        containerList.appendChild(player);
    }
    // Create Table for position amounts
    for (let i = 0; i < 2; i++) {
        let row = document.createElement('tr');
        for (let j = 0; j < positions.length; j++) {
            let cell = document.createElement('td');
            if (i === 0) {
                cell.innerHTML = positionObjs[j].position;
            }   
            else {cell.innerHTML = positionObjs[j].amount}  
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

async function consoleDisplay(randomNamesPromise) {
    let displayDiv = document.createElement('div');
    let namesObj = await randomNamesPromise;
    displayDiv.innerHTML = namesObj;
    container.insertBefore(displayDiv, positionsTable);
}

genButton.addEventListener('click', (e) => {
    e.preventDefault();
    // RESETS
    containerList.innerHTML = '';
    positionsTable.innerHTML = '';
    for (let position of positionObjs) {
        position.amount = 0;
    }
    // Class assignments
    container.className = 'container-visible';
    positionsTable.className = 'positionsTable';
    containerList.className = 'containerList';
    // numArray represents the number of players from each rating bracket/tier
    // Every two numbers is a range for example 4,8,8,14 represents a range from 4-8 and 8-14
    let numArray = [];
    resets++
    console.log(`Reset #${resets}`);
    switch (selectOption.value) {
        case 's':
            numArray = [4, 8, 8, 14, 10, 20, 15, 30, 25, 35];
            // consoleDisplay(getRandomNames(6, null));
            generatePlayers(numArray);
            
            break;

        default:
            break;
    }
    
    
});
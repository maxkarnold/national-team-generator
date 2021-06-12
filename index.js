const positions = ['GK', 'RB', 'LB', 'CB', 'LWB', 'RWB', 'DM', 'MC', 'ML', 'MR', 'AMR', 'AML', 'AMC', 'ST'];
const playerAmount = 60;

const genButton = document.querySelector('button');
const container = document.querySelector('ul');

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
    //The maximum is inclusive and the minimum is inclusive
  }

function getRandomName() {

}

function getRandomRating(tier) {
    switch (tier) {
        case 's':
            getRandomInt(85, 99);
            break;
        case 'a':
            getRandomInt(77, 84)
            break;
        default:
            break;
    }
}

genButton.addEventListener('click', (e) => {
    if (container.childElementCount < 60) {
        for (let i = 0; i < playerAmount; i++) {
            let player = document.createElement('li');
            player.innerHTML = positions[getRandomInt(0, 13)] + ' ' + getRandomRating();
            container.appendChild(player);
        }
    }   else {
        container.innerHTML = '';
        for (let i = 0; i < playerAmount; i++) {
            let player = document.createElement('li');
            player.innerHTML = positions[getRandomInt(0, 13)];
            container.appendChild(player);
        }
    }
    
});
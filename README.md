# national-team-generator

Website: https://maxkarnold.github.io/national-team-generator/

## Tech Stack
* Angular
* Firebase
* Express
* Nodejs

## Plan

1. Create National Team Generator
    - [ ] Reupload firstNames and lastNames JSON files to Firestore.
    - [ ] Check out larger database of names https://www.behindthename.com/submit/names.
3. Allow for saving of generated teams
    - [ ] Create a button that allows you to write the data to Firestore in a separate collection.
    - [ ] Player data can be written to the user's document in a subcollection
    - [ ] Player data then can be fetched with a load button with only one set of saved data at a time (for now)
    - [ ] Create a page or section that allows you to load the team data.
    - [ ] This can be loaded instead of the generate team html and can be closed out of.
5. Create an interface that allows for drag-drop functionality so that allows for teams to be created. (Like Football Manager)
6. Create a scoring system and leaderboard to judge the quality of teams created.
7. Create a tournament that can be entered with a generated team that will be simulated like Football Manager.

## Setup (needs to be updated)
Initiate NodeJS environment and install node modules
<br>
```
npm install firebase --save
```

Create a config.js file in the root folder.

```javascript
// IMPORTS
const firebase = require('firebase');
require('firebase/firestore');

// behindthename.com API
// Find the API key and instructions here ---> https://www.behindthename.com/api/help.php
export const nameGenerator = {
    apiKey: 'API KEY'
}

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "API KEY",
  authDomain: "national-team-generator.firebaseapp.com",
  projectId: "national-team-generator",
  storageBucket: "national-team-generator.appspot.com",
  messagingSenderId: "30261669176",
  appId: "1:30261669176:web:eca1c9103db91bab6265cd",
  measurementId: "G-QV0DJSQSL2"
};

// Initialize Firebase

firebase.initializeApp(firebaseConfig);
firebase.analytics();

export const db = firebase.firestore();
```

Create a `json-to-firestore.js` in the `data/` folder

```javascript
const first_names = require('./first_name_data.json');
const last_names = require('./last_name_data.json');

const firebase = require("firebase");
// Required for side-effects
require("firebase/firestore");

// Initialize Cloud Firestore through Firebase
firebase.initializeApp({
    apiKey: "API_KEY",
    authDomain: "national-team-generator.firebaseapp.com",
    projectId: "national-team-generator"
  });
  
var db = firebase.firestore();


first_names.forEach(function(obj) {
    db.collection("first_names").add({
        id: obj.id,
        name: obj.name,
        gender: obj.gender,
    }).then(function(docRef) {
        console.log("Document written with ID: ", docRef.id);
    })
    .catch(function(error) {
        console.error("Error adding document: ", error);
    });
});

last_names.forEach(function(obj) {
    db.collection("last_names").add({
        id: obj.id,
        surname: obj.surname,
    }).then(function(docRef) {
        console.log("Document written with ID: ", docRef.id);
    })
    .catch(function(error) {
        console.error("Error adding document: ", error);
    });
});
```



# national-team-generator

<p>Website URL: *** COMING SOON ***</p>
<p>See the <a href="https://github.com/maxkarnold/national-team-generator/wiki">Wiki</a> for more info</p>

## Tech Stack
* Angular
* Firebase
* Express
* Nodejs

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



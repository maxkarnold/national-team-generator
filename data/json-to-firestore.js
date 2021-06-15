const first_names = require('./first_name_data.json');
const last_names = require('./last_name_data.json');

const firebase = require("firebase");
// Required for side-effects
require("firebase/firestore");

// Initialize Cloud Firestore through Firebase
firebase.initializeApp({
    apiKey: "AIzaSyBo9HTsenh9tiAgLk23uuR5_9FqL0vVDzU",
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
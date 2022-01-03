// const first_names = require('./first_name_update.json');
const last_names = require('./thai-last-names.json');
const serviceAccount = require('../src/secrets/ServiceAccountKey.json');
const admin = require("firebase-admin");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const fireTimestamp = admin.firestore.FieldValue.serverTimestamp();
let maleRef = db.collection("firstNames_male");
let femaleRef = db.collection("firstNames_female");
let lastNameRef = db.collection("lastNames");

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
    //The maximum is inclusive and the minimum is inclusive
}

// first_names.forEach(function(obj) {
//     db.collection("first_names").add({
//         id: obj.id,
//         name: obj.name,
//         gender: obj.gender,
//         timestamp: fireTimestamp,
//         duplicate: obj.duplicate,
//         usages: obj.usages,
//     }).then(function(docRef) {
//         console.log("Document written with ID: ", docRef.id);
//     })
//     .catch(function(error) {
//         console.error("Error adding document: ", error);
//     });
// });


// async function addFirstNames() {
//     let firstNames = first_names;
//     firstNames.forEach( async (obj) => {
//         if (obj.gender == "f" || obj.gender == "mf") {
//             const res = await femaleRef.add({
//                 alphabeticalId: obj.id,
//                 name: obj.name,
//                 gender: obj.gender,
//                 timestamp: fireTimestamp,
//                 duplicate: obj.duplicate,
//                 usages: obj.usages,
//                 randomNum: {
//                     1: getRandomInt(0, 50000),
//                     2: getRandomInt(0, 50000),
//                     3: getRandomInt(0, 50000),
//                     4: getRandomInt(0, 50000),
//                     5: getRandomInt(0, 50000)
//                 }
        
//             });
//             console.log("Document written with ID: ", res.id);
//         }
//         // if (obj.gender == "m" || obj.gender == "mf") {
//         //     const res = await maleRef.add({
//         //         name: obj.name,
//         //         gender: obj.gender,
//         //         timestamp: fireTimestamp,
//         //         duplicate: obj.duplicate,
//         //         usages: obj.usages,
//         //         randomNum: {
//         //             1: getRandomInt(0, 50000),
//         //             2: getRandomInt(0, 50000),
//         //             3: getRandomInt(0, 50000),
//         //             4: getRandomInt(0, 50000),
//         //             5: getRandomInt(0, 50000)
//         //         }
//         //     });
//         //     console.log("Document written with ID: ", res.id);
//         // }
//     });
// }

// **** Check collection size **** 

lastNameRef.get().then(snap => {
    size = snap.size;
    console.log(size);
});


last_names.forEach(function(obj) {
    lastNameRef.add({
        alphabeticalId: obj.id,
        name: obj.name,
        duplicate: false,
        usages: obj.usages,
        timestamp: fireTimestamp,
        randomNum: {
            1: getRandomInt(0, 50000),
            2: getRandomInt(0, 50000),
            3: getRandomInt(0, 50000),
            4: getRandomInt(0, 50000),
            5: getRandomInt(0, 50000)
        }
    }).then(function(docRef) {
        console.log("Document written with ID: ", docRef.id);
    })
    .catch(function(error) {
        console.error("Error adding document: ", error);
    });
});
lastNameRef.get().then(snap => {
    size = snap.size;
    console.log(size);
});


// addFirstNames();

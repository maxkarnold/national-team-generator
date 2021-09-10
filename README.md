# National Team Generator

## Setup 

Clone the directory and use this command in the terminal:

```bash

npm i

```

In the /src folder create a folder called /secrets. Create a file called `config.js` that looks like this:

```javascript

  const firebaseConfig = {
  apiKey: "API_KEY",
  authDomain: "national-team-generator.firebaseapp.com",
  projectId: "national-team-generator",
  storageBucket: "national-team-generator.appspot.com",
  messagingSenderId: "30261669176",
  appId: "APP_ID",
  measurementId: "G-QV0DJSQSL2"
};

firebaseConfig.exports = firebaseConfig;
```

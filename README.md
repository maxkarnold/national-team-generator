# national-team-generator

<p>Website URL: *** COMING SOON ***</p>
<p>See the <a href="https://github.com/maxkarnold/national-team-generator/wiki">Wiki</a> for more info</p>

## Tech Stack
* [Angular](https://angular.io/)
  * [Angular-Material](https://material.angular.io/) 
* [Firebase](https://firebase.google.com/docs)
* [Express](https://expressjs.com/)
* [Nodejs](https://nodejs.org/en/)

## Setup (needs to be updated)
Initiate NodeJS environment and install node modules
<br>
```
npm install firebase --save
```
Angular Dependencies
```
ng add @angular/material
```
### Create or edit the environments folder in src/
<p>Firebase information can be found in your firebase console.</p>
<p>`environment.prod.ts` file</p>

```
export const environment = {
  production: true,
  firebase: {
    apiKey: "API_KEY",
    authDomain: "national-team-generator.firebaseapp.com",
    projectId: "national-team-generator",
    storageBucket: "national-team-generator.appspot.com",
    messagingSenderId: "30261669176",
    appId: "APP_ID",
    measurementId: "G-QV0DJSQSL2"
  }
};
```

<p>`environment.ts` file</p>

```javascript
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: "API_KEY",
    authDomain: "national-team-generator.firebaseapp.com",
    projectId: "national-team-generator",
    storageBucket: "national-team-generator.appspot.com",
    messagingSenderId: "30261669176",
    appId: "APP_ID",
    measurementId: "G-QV0DJSQSL2"
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.

```

### Create the secrets folder src/
<p>Go to your Firebase Console -> Project Settings -> Service Accounts -> Click "Generate new private key" -> Click "Generate key" -> Rename the new file `ServiceAccountKey.json`.</p>
<p>You should add that file to this folder and it should look something like this:</p>

```json
{
  "type": "service_account",
  "project_id": "national-team-generator",
  "private_key_id": "PRIVATE_KEY_ID",
  "private_key": "PRIVATE_KEY",
  "client_email": "CLIENT_EMAIL",
  "client_id": "CLIENT_ID",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "CLIENT_X509_CERT_URL"
}
```



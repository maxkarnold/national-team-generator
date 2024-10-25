# national-team-generator

* Website URL: https://national-team-generator.web.app/
* See the [Wiki](https://github.com/maxkarnold/national-team-generator/wiki) for more info
* Check out my [spreadsheet](https://docs.google.com/spreadsheets/d/1iUR0P_v-qPOfyR1cX4iYIAwLiMCHIRPgRx9xRRmNdwc/edit?usp=sharing) for testing

## Tech Stack
* [Angular](https://angular.io/)
  * [Angular-Material](https://material.angular.io/)
  * [Angular-Material-CDK](https://material.angular.io/cdk/categories)
* [Firebase](https://firebase.google.com/docs)
* [Express](https://expressjs.com/)
* [Nodejs](https://nodejs.org/en/)

## Setup (needs to be updated)
Initiate NodeJS environment and install node modules
<br>
```
npm install
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

<!-- ### Create the secrets folder src/
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
``` -->

### Build/Deploy the app
Delete anything in the `dist/` directory (especially the `index.html`) and build the app with:

```
ng build
```

Change the `public` property in `firebase.json`.


```json
"public": "dist/team-gen",
```

Then deploy to the website with firebase in the terminal.

```
firebase deploy
```

## CSS Styling Guide

We use BEM methodology for all SCSS files. Please refer to this [reference site](https://en.bem.info/methodology/key-concepts/) for help. For this project, we have some specific rules to follow over the BEM standards.

* Blocks can be contained within other blocks.
* Blocks can be modified just like elements using a class like: `block--modifier`.
* The class name of elements within elements should be added on. `element__element__element`.
* Global styles should only be implemented in `styles.scss`.
* Don't add class names to `ng-container`, `ng-template` and other specialized html tags unless necessary.

## Project Structure

### Core
The Core Module is where we want to put our shared singleton services. So the services that we want only one instance of while having them shared among multiple modules should live here.

The Angular injector creates a new instance of a service for each lazily loaded module it is provided.

Another piece of our application that should live in the Core Modules is app-level components. A good example of an app-level component would be the navigation bar. Only the app needs to know about our navigation component.

We do not want to put, are components used throughout the application inside of the Core Module. We have the Shared Module for that and we will look at that now.
### Models

### Pages

### Shared
The Shared Module is where we want everything to live that is shared throughout the application. Components, directives, guards, & pipes can all live in the Shared Module.

It is also common to import and export Angular built modules inside your Shared Module if you need to access them in multiple locations. Because Shared is imported into many of your Feature Modules, it's common to import/export Common Module or Angular Material modules. Import/Export the modules once in Shared Module and now anyone that imports Shared will have access to them.

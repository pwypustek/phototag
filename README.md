## photoTag
photoTag is an app designed for organizing photos by customizable tags, making it easier to capture and archive important documents (e.g., invoices) for document management. It’s also useful for tracking household expenses.

In future updates, the app will incorporate AI-powered image recognition. For instance, invoice details could be automatically extracted and saved in a table or directly added to accounting software. For budget tracking, purchases will be categorized, helping to group expenses such as groceries, home supplies, rent, and more.

The app can be accessed on a smartphone as a web page or Progressive Web App (PWA) and can also be compiled into a native Android or iOS application.

This app was initially created using [`@capacitor/create-app`](https://github.com/ionic-team/create-capacitor-app),
and comes with a very minimal shell for building an app.

### Setup
```bash
npm install
```

### Configuraton
The config.json file contains the backend address

### Setup Android / iOS
 - https://capacitorjs.com/docs/android
 - https://capacitorjs.com/docs/ios
```bash
npm run build
npx cap sync
```
### Run PWA
```bash
npm run start
```
### Run Android
```bash
npx cap run android
```
### Run iOS
```bash
npx cap run ios
```


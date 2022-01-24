# Device Management App
## Introduction
The device management app is an app designed to help with the registration and maintenance of devices on [The Things Network](https://www.thethingsnetwork.org/). The app is written in [React Native](https://reactnative.dev/) and uses the [Expo](https://expo.dev/) development platform. The app is currently available for download via [Testflight](https://testflight.apple.com/join/ZspSdWIi) (Apple's Beta Testing Program). If you wish to run the app from source code instead, please consult the quick start guide


## Quick start (Running from source)
### Install Node Package Manager (npm)

Either:

- Mac - `brew install node`
- Linux -  `sudo apt install npm`
- Windows - Download and install [node.js](https://nodejs.org/en/download/)

### Expo
- Install expo cli `npm install -g expo-cli`
- There are 3 options when it comes to what you can run the app on:
	- iPhone simulator - Requires [Xcode](https://apps.apple.com/au/app/xcode/id497799835?mt=12)
	- Android simulator - Requires [Android studio](https://developer.android.com/studio)
	- Physical Phone - Requires the expo app be installed from [app store](https://apps.apple.com/au/app/expo-go/id982107779) or [google play](https://play.google.com/store/apps/details?id=host.exp.exponent)
- In main directory of project, start expo - `expo start`
- Choose medium to run the app. i.e `a` if running on android simulator
- If running on a physical phone select `d` to bring up developer tools in your browser the scan the qr code with the device's camera


## Running iPhone simulator
- Requires a mac to run
- To run an iPhone simulator download [Xcode](https://apps.apple.com/au/app/xcode/id497799835?mt=12) from the app store
- Go to Xcode > Preferences > Locations > Command Line Tools and select a command line tool
- Open simulator application by going to Xcode > Open Devloper Tool > Simulator
- **Note:** No new GUI will pop up but you will notice the application name in top left hand side of the screen changes from Xcode to Simulator
- Next select a new simulator by navigating to File > Open Simulator > iOS > iPhone 13 (or any simulator of your choice)
- **Tip:** It is a good idea right click the simulator app on the dock and select keep on dock so you don't have to open xcode every time you wish to run the simulator
- Either:
	- Run `expo start` and then select `i` to run on iOS
	- Run `expo start --ios`

## Running Android simulator
- Can be run on any operating system
- To run an Android simulator download [Android studio](https://developer.android.com/studio)
- Go through the installation process selecting the default options
- When on the Welcome Screen select More Actions > AVD Manager
- On the bottom of the window select Create New Virtual Device > Pixel 5 > x86 Images
- Click download on the Image with the following details:

|Release Name|API Level|ABI|Target
|---|---|---|---|
|S|31|x86_64|Android 12.0 (Google APIs)|

- When image has been downloaded select Next
- Name the device whatever you wish and then click Finish, this will now create a new device
- To start the device select the green play button next to the folder icon in the right most column
- Either:
	- Run `expo start` and then select `a` to run on android
	- Run `expo start --android`  

## Publishing updated build to the Apple App Store
### Prerequisites
- [Apple Developer Account](https://developer.apple.com/) - Required to release an app on the app store or testflight
- [Transporter](https://apps.apple.com/au/app/transporter/id1450874784?mt=12) - Used to push the build to the app store, other tools can be used. For more information look [here](https://help.apple.com/app-store-connect/#/devb1c185036)
- [Expo account](https://expo.dev/) - Used to build the project and download .ipa file 


### Building
- In the app.josn file of the project, ensure the version number has been updated. (Publish to app store will fail if version numbers already taken)
- In main directory of project run `expo build:ios`
- Sign in with your expo account when prompted
- When asked for build type, select `archive`
- When asked `Do you have access to the Apple account that will be used for submitting this app to the App Store?` select `Y`
- Sign in with your apple developer account
- Expo will present a series of prompts asking if you want to provide certificates, select `Let expo handle the process` for each prompt
- The build process should now start and may take some time.
- When build has finished, download the .ipa file from the link given to you by the expo cli
- Launch Transporter and sign in with your apple developer account
- In the top left hand corner click the plus icon and select the .ipa file you just downloaded from expo
- Click deploy and go get a coffee, this can take a while
- Once deployment is complete, go to [App Store Connect](https://appstoreconnect.apple.com/) and sign in with your developer account
- Go to My Apps > Device Management App

### Publishing to Testflight
- Select the TestFlight Tab and then select iOS under the Builds section on the left column
- Your build pushed to the app store using transporter will appear here, if it doesn't wait as it often takes a while for it to appear
- Once the build appears it will be greyed out and say `(Processing)`, this can take an hour or two.
- Once build has finished processing select it
- In the Groups section click `+` and select the DPI group
- Fill in required prompts and then click `Submit for Review`

### Publishing to Public App Store
- Select the App Store Tab
- Scroll down to the Build section and click the `+` icon and select the updated build that you pushed using transporter
- If all other information is complete and valid click `Add for Review`
- The review process for a live app can take up to a couple of days
- Once approved app will be live on the app store

More information can be found [here](https://developer.apple.com/documentation/xcode/distributing-your-app-for-beta-testing-and-releases)

## Publishing build to Google Play Store
- TODO

## Useful links
- Continuous Deployment using expo https://techblog.geekyants.com/github-actions-for-automating-builds-for-your-app

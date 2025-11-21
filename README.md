# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

Week 3 Activity: Advanced Navigation

<img width="500" alt="image" src="https://github.com/user-attachments/assets/b704fe9a-7a34-4b8b-bb54-60556a50eb8e" />

The app integrates full swipe gesture support for drawer navigation with edge detection and swipe distance thresholds to ensure smooth opening and closing. Transition animations use Reanimated’s useDrawerProgress to apply scaling, translation, and dynamic border-radius effects for polished screen transitions. Navigation state is persistently stored via AsyncStorage, allowing the app to restore the last visited screen and drawer state even after restart. Validation and cleanup logic ensure corrupted saved data does not disrupt navigation flow.

Week 4: State Management
Activity 1: Spotify Playlist Builder App

<img width="500" alt="image" src="https://github.com/user-attachments/assets/82d5dc5f-284c-4c80-9342-fb1153e668da" />

Activity 2: Spotify Profile Creation Form

<img width="500" alt="image" src="https://github.com/user-attachments/assets/15b17e15-aed3-483a-9626-c27984056454" />

The playlist builder and profile screens implement intuitive tap- and gesture-based interactions for adding, removing, or reordering items, as well as entering user information. Reanimated powers fade, modal, and button animations that create smooth visual transitions across the interface. AsyncStorage persists playlist data, history stacks, and profile information separately to maintain user progress. The playlist's undo/redo system is fully saved, ensuring every action is recoverable across app sessions.

Week 5: Device Features

Activity 1: Theme Switcher

<img width="500" alt="image" src="https://github.com/user-attachments/assets/8ae1808c-dc86-4288-9c82-478fdddfe7fd" /> <img width="500" alt="image" src="https://github.com/user-attachments/assets/c8caddb5-86db-45b1-bb55-72a8549b4234" /> <img width="500" alt="image" src="https://github.com/user-attachments/assets/9188a76d-ff10-4908-8d1e-f38a17b4fd27" />

Activity 2: Camera with Filters

<img width="500" alt="image" src="https://github.com/user-attachments/assets/45499862-d464-407f-8193-4620e9ed4870" />

The camera app uses advanced PanResponder gestures for filter sliders, dragging, and crop adjustments, enabling precise and responsive editing controls. Animated transitions enhance both theme switching and filter application, providing smooth visual feedback throughout the UI. Theme settings—light, dark, or custom—are saved through Redux Toolkit with AsyncStorage integration to ensure preferences persist across sessions. Filter previews and editing animations create a dynamic and engaging user experience.

Week 6: Location-Based Map Features

<img width="500" alt="image" src="https://github.com/user-attachments/assets/e79c7144-b8b5-42ad-931b-d24e6910975d" />

-  Enhancing Your React Native App with Location-Based Map Features
-  The map screen uses native map gestures such as zoom, pan, and marker selection, along with tap interactions for switching layers and handling permissions. Transitions between map types are visually smooth,              complemented by animated markers and region movements when focusing on specific locations. Geofencing visuals update dynamically as the user moves, providing real-time feedback on proximity to key areas. While           focused on live location tracking rather than storage, map preferences can be extended for future persistence.

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.




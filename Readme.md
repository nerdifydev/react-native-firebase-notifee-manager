# Notification Manager for React Native

This guide explains how to use the Notification Manager in your React Native project to handle Firebase Cloud Messaging (FCM) and Notifee notifications. The Notification Manager displays notifications in foreground, background, and quit states, and provides event listeners for both FCM and Notifee events.

## Requirements

- @react-native-firebase/messaging: ^20.4.0 or later
- @notifee/react-native: ^7.8.2 or later

## Setup

1. Follow the documentation for initial setup [@react-native-firebase/messaging](https://rnfirebase.io/messaging/usage) and [@notifee/react-native](https://notifee.app/react-native/docs/overview)

2. Install the required dependencies as is:

   ```
   npm install @react-native-firebase/messaging@^20.4.0 @notifee/react-native@^7.8.2
   ```

3. Copy the `NotificationManager.ts` file into your project's source directory.
4. The `NotificationManager.ts` file handles notification permissions for both iOS and Android by default. You can modify the permission-related code to suit your specific needs.
5. You can modify the appearance of notifications for Android in `NotificationManager.ts` according to your needs.

## Usage

1. Initialize the Notification Manager in your main App component:

   ```typescript
   import NotificationManager from './NotificationManager';

   function App() {
     useEffect(() => {
       const initializeFCM = async () => {
         await NotificationManager.initialize();
         // Set up event listeners here
       };
       initializeFCM();
       return () => {
         NotificationManager.removeListeners();
       };
     }, []);

     // Rest of your App component
   }
   ```

2. Set up event listeners:

   ```typescript
   NotificationManager.setForegroundEventListener((type, detail) => {
     if (type === EventType.PRESS) {
       // Handle foreground notification press
     }
   });

   NotificationManager.setBackgroundEventListener((type, detail) => {
     if (type === EventType.PRESS) {
       // Handle background notification press
     }
   });

   NotificationManager.setInitialNotificationAndroidEvent(({notification, pressAction}) => {
     // Handle initial notification (app opened from a notification in android)
   });
   ```

3. Set up background handlers for Android in your root `index.js` file:

   ```javascript
   import NotificationManager from './src/NotificationManager';
   import messaging from '@react-native-firebase/messaging';
   import notifee from '@notifee/react-native';

   if (Platform.OS === 'android') {
     messaging().setBackgroundMessageHandler(async remoteMessage => {
       NotificationManager.displayNotification(remoteMessage);
     });
     notifee.onBackgroundEvent(async ({type, detail}) => {
       NotificationManager.invokeAndroidBackgroundEvent(type, detail);
     });
   }
   ```

4. Get the FCM token:

   ```typescript
   const token = await NotificationManager.getToken();
   console.log('FCM Token:', token);
   ```

## Notification Payload Structure

The backend should use the following different payload structures when sending notifications through FCM for Android and iOS:

### Android Payload

```json
{
   "message":{
      "token":"duCgs2YqTb6vpGa4Fi27j9:APA91bGmLTjCrrNu01Q-ygzJ8x9Zb3FwkUgO1fuJyNl7Lg--boWt0AcUpO1NXQtJj5twc3WYclddvFTfB6u8gY6YbRUkm6QDPE73M1DbQ1sqg5l4ztoq926bdtkv1J6FOcR8nBIp4o3I",
      "data":{
          "screen" : "List",
          "title" : "RN push message with priority high",
          "body" : "This is test message."
      },
      "android" : {
          "priority" : "high"
      }
   }
}
```

### iOS Payload

```json
{
   "message":{
      "token":"eFZHVrvLMUAPsbZ-WRACQu:APA91bHWoPXiqXix3rjaz_RMpIMfeQiCZ1o9iOGwplJ0QWX_UyvaBBiJGrcV8HeLvWruqGJgQ0CKjOqatj29-UcFb_m5I5vAJqqABtmGBYXvDMWpedard7u2_lrStHQGI_QisWBa6f2a",
      "data":{
          "screen" : "List",
          "title" : "RN iOS push message with priority high",
          "body" : "This is test message."
      },
      "notification" : {
          "title" : "RN iOS push message with priority high",
          "body" : "This is test message."
      }
   }
}
```

## Additional Resources

- See usage examples in the `ExampleApp.tsx` file.
- [Firebase Cloud Messaging Documentation](https://rnfirebase.io/messaging/usage)
- [Notifee Documentation](https://notifee.app/react-native/docs/overview)
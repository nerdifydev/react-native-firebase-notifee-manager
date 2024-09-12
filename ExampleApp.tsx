import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./screens/LoginScreen";
import HomeStackNavigator from "./HomeStackNavigator";
import { NavigationRef } from "./NavigationRef";
import NotificationManager from "./NotificationManager";
import { EventType } from "@notifee/react-native";

const Stack = createStackNavigator();

function App() {
  useEffect(() => {
    const initializeFCM = async () => {
      await NotificationManager.initialize();
      NotificationManager.setForegroundEventListener((type, detail) => {
        if (type === EventType.PRESS) {
          const { notification } = detail;
          // code here..
          console.log(
            "foreground event type: ",
            type,
            "detail: ",
            notification?.data
          );
        }
      });
      NotificationManager.setBackgroundEventListener((type, detail) => {
        if (type === EventType.PRESS) {
          const { notification } = detail;
          // code here..
          console.log(
            "background event type: ",
            type,
            "detail: ",
            notification?.data
          );
        }
      });
      NotificationManager.setInitialNotificationAndroidEvent(
        ({ notification, pressAction }) => {
          // code here..
          console.log(
            "initial event type detail: ",
            notification?.data,
            "press",
            pressAction
          );
        }
      );
      const token = await NotificationManager.getToken();
      console.log("FCM Token:", token);
    };
    initializeFCM();
    return () => {
      NotificationManager.removeListeners();
    };
  }, []);
  return (
    <NavigationContainer
      ref={NavigationRef}
      onReady={() => {
        //splunk tracking
      }}
    >
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen
          name="HomeStack"
          component={HomeStackNavigator}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;

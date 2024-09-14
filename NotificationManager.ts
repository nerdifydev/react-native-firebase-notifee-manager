// NotificationManager.ts

import messaging, {
  FirebaseMessagingTypes,
} from "@react-native-firebase/messaging";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform, PermissionsAndroid } from "react-native";
import notifee, {
  AndroidImportance,
  AndroidVisibility,
  EventDetail,
  EventType,
  InitialNotification,
} from "@notifee/react-native";

class NotificationManager {
  private notifeeForegroundHandler: (() => void) | null = null;
  private onMessageListener: (() => void) | null = null;

  private backgroundAndroidEventHandler:
    | ((type: EventType, detail: EventDetail) => void)
    | null = null;

  public async initialize(): Promise<void> {
    const hasPermission = await this.requestPermission();
    if (hasPermission) {
      await this.setupFCMListeners();
    } else {
      console.log("FCM permissions not granted");
    }
  }

  public async requestPermission(): Promise<boolean> {
    if (Platform.OS === "ios") {
      return this.requestIOSPermission();
    } else if (Platform.OS === "android") {
      return this.requestAndroidPermission();
    }
    return false;
  }

  private async requestIOSPermission(): Promise<boolean> {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log("iOS FCM authorization status:", authStatus);
      } else {
        console.log("iOS FCM permission denied");
      }

      return enabled;
    } catch (error) {
      console.error("Error requesting iOS FCM permission:", error);
      return false;
    }
  }

  private async requestAndroidPermission(): Promise<boolean> {
    try {
      if (typeof Platform.Version === "number" && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log("Android POST_NOTIFICATIONS permission denied");
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error("Error requesting Android FCM permission:", error);
      return false;
    }
  }

  public async getToken(): Promise<string | null> {
    try {
      let fcmToken = await AsyncStorage.getItem("fcmToken");
      if (!fcmToken) {
        fcmToken = await messaging().getToken();
        if (fcmToken) {
          await AsyncStorage.setItem("fcmToken", fcmToken);
        }
      }
      return fcmToken;
    } catch (error) {
      console.error("Error getting FCM token:", error);
      return null;
    }
  }

  private async setupFCMListeners(): Promise<void> {
    this.onMessageListener = messaging().onMessage(async (remoteMessage) => {
      this.displayNotification(remoteMessage);
    });
  }

  public setBackgroundEventListener(
    handler: (type: EventType, detail: EventDetail) => void
  ): void {
    if (Platform.OS === "android") {
      this.backgroundAndroidEventHandler = handler;
    }
    if (Platform.OS === "ios") {
      notifee.onBackgroundEvent(async ({ type, detail }) => {
        if (handler) {
          handler(type, detail);
        }
      });
    }
  }

  public setForegroundEventListener(
    handler: (type: EventType, detail: EventDetail) => void
  ): void {
    this.notifeeForegroundHandler = notifee.onForegroundEvent(
      async ({ type, detail }) => {
        if (handler) {
          handler(type, detail);
        }
      }
    );
  }

  public setInitialNotificationAndroidEvent(
    handler: (notification: InitialNotification) => void
  ): void {
    if (Platform.OS === "android") {
      notifee
        .getInitialNotification()
        .then((initialNotification) => {
          if (initialNotification) {
            handler(initialNotification);
          }
        })
        .catch((error: Error) => {
          console.log("error in getInitial notification", error);
        });
    }
  }

  //invoked from root index file to delegate method call
  public invokeAndroidBackgroundEvent(
    type: EventType,
    detail: EventDetail
  ): void {
    if (this.backgroundAndroidEventHandler) {
      this.backgroundAndroidEventHandler(type, detail);
    }
  }

  public async displayNotification(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage
  ): Promise<void> {
    const channelId = await notifee.createChannel({
      id: "default",
      name: "Default Channel",
      importance: AndroidImportance.HIGH,
      visibility: AndroidVisibility.PUBLIC,
    });

    // Display a notification
    await notifee.displayNotification({
      title: remoteMessage.data?.title as string,
      body: remoteMessage.data?.body as string,
      data: remoteMessage.data,
      android: {
        channelId,
        smallIcon: "ic_launcher",
        pressAction: {
          id: "default",
        },
        importance: AndroidImportance.HIGH,
        visibility: AndroidVisibility.PUBLIC,
      },
    });
  }

  public removeListeners(): void {
    if (this.onMessageListener) {
      this.onMessageListener();
    }
    if (this.notifeeForegroundHandler) {
      this.notifeeForegroundHandler();
    }
  }
}

export default new NotificationManager();

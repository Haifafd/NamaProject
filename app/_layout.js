import { Stack, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../FirebaseConfig";
import {
  scheduleDailyActivityReminder,
  cancelDailyActivityReminder,
  subscribeToNewNotifications,
  fireLocalNotification,
} from "../Services/NotificationService";

export default function RootLayout() {
  const router = useRouter();
  const newNotifsUnsubRef = useRef(null);

  useEffect(() => {
    const authUnsub = onAuthStateChanged(auth, (user) => {
      if (newNotifsUnsubRef.current) {
        newNotifsUnsubRef.current();
        newNotifsUnsubRef.current = null;
      }

      if (user) {
        scheduleDailyActivityReminder();

        // 🔔 لما يجي إشعار جديد على هذا المستخدم → أطلق Local Notification بصوت
        newNotifsUnsubRef.current = subscribeToNewNotifications((notif) => {
          fireLocalNotification({
            title: notif.title,
            body: notif.body,
            data: { ...notif.data, notifId: notif.id, type: notif.type },
          });
        });
      } else {
        cancelDailyActivityReminder();
      }
    });

    const responseSub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        if (data?.type === "activity_reminder") {
          router.push("/child/ChildModeSplash");
        } else {
          router.push("/notifications");
        }
      }
    );

    return () => {
      authUnsub();
      if (newNotifsUnsubRef.current) newNotifsUnsubRef.current();
      responseSub.remove();
    };
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}

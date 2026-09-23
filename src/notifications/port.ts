import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { notificationsText } from '@/content/notifications';
import type { PlannedNotification, ScheduledNotification } from '@/domain/notifications';
import { toDate } from '@/domain/local-time';

import type { NotificationPort, PermissionState } from './types';

/*
 * Das Gerät. Geplant wird nur mit Einmal-Auslösern und echtem Datum: Die
 * Wiederholungen rechnet die App selbst, weil die wiederholenden Auslöser je
 * Plattform verschieden sind.
 */

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/** Kennungen der Aktionen, auf die «Erledigt» und «Gegeben» hören. */
export const ACTION_DONE = 'erledigt';
export const CATEGORY_DUE = 'termin';
export const CATEGORY_DOSE = 'medikament';

function stateOf(status: Notifications.PermissionStatus, canAskAgain: boolean): PermissionState {
  if (status === 'granted') return 'granted';
  return canAskAgain && status === 'undetermined' ? 'undetermined' : 'denied';
}

async function prepare(): Promise<void> {
  await Notifications.setNotificationCategoryAsync(CATEGORY_DUE, [
    { identifier: ACTION_DONE, buttonTitle: notificationsText.actions.done },
  ]);
  await Notifications.setNotificationCategoryAsync(CATEGORY_DOSE, [
    { identifier: ACTION_DONE, buttonTitle: notificationsText.actions.given },
  ]);
  if (Platform.OS !== 'android') return;
  const channels = notificationsText.channels;
  await Notifications.setNotificationChannelAsync('dates', {
    name: channels.dates.name,
    description: channels.dates.description,
    importance: Notifications.AndroidImportance.DEFAULT,
  });
  await Notifications.setNotificationChannelAsync('medication', {
    name: channels.medication.name,
    description: channels.medication.description,
    importance: Notifications.AndroidImportance.HIGH,
  });
}

/** Was die App geplant hat: Kennung und Zeitpunkt, wie ihn der Plan schreibt. */
function scheduledFrom(
  request: Notifications.NotificationRequest,
): ScheduledNotification | undefined {
  const at = request.content.data?.at;
  return typeof at === 'string' ? { id: request.identifier, at } : undefined;
}

export const devicePort: NotificationPort = {
  prepare,

  async getPermission() {
    const permission = await Notifications.getPermissionsAsync();
    return stateOf(permission.status, permission.canAskAgain);
  },

  async requestPermission() {
    const permission = await Notifications.requestPermissionsAsync();
    return stateOf(permission.status, permission.canAskAgain);
  },

  async getScheduled() {
    const requests = await Notifications.getAllScheduledNotificationsAsync();
    return requests.flatMap((request) => scheduledFrom(request) ?? []);
  },

  async cancel(ids) {
    for (const id of ids) await Notifications.cancelScheduledNotificationAsync(id);
  },

  async schedule(plans: PlannedNotification[]) {
    for (const plan of plans) {
      await Notifications.scheduleNotificationAsync({
        identifier: plan.id,
        content: {
          title: plan.title,
          body: plan.body,
          categoryIdentifier: plan.target.kind === 'dose' ? CATEGORY_DOSE : CATEGORY_DUE,
          data: { at: plan.at, target: plan.target },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: toDate(plan.at),
          channelId: plan.channel,
        },
      });
    }
  },
};

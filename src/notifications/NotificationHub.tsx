import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { AppState } from 'react-native';

import { notificationsText } from '@/content/notifications';
import { useDb } from '@/db/DatabaseProvider';
import { completeHealthEntry } from '@/db/repositories/health';
import type { Db } from '@/db/types';
import { logDose } from '@/db/repositories/medications';
import { toLocalDate } from '@/domain/local-date';
import { nowLocal } from '@/domain/local-time';
import type { NotificationTarget } from '@/domain/notifications';
import { ConfirmDialog } from '@/ui/ConfirmDialog';
import { toast } from '@/ui/toast';

import { askOnce, closeAsk, useAskingPermission } from './ask-store';
import { ACTION_DONE, devicePort } from './port';
import { planFor, syncNotifications } from './sync';
import type { NotificationResponse } from './types';

/**
 * Hält die geplanten Benachrichtigungen am Datenstand: beim Start, nach jeder
 * Änderung und beim Zurückkommen in die App. Die Erlaubnis wird gefragt, wenn
 * die erste Erinnerung entsteht – nicht beim ersten Start. Und was jemand auf
 * dem Sperrbildschirm tippt, wirkt hier.
 */
export function NotificationHub() {
  const db = useDb();
  const client = useQueryClient();
  const asking = useAskingPermission();

  const sync = useCallback(async () => {
    const result = await syncNotifications(db, devicePort, new Date());
    if (result.skipped !== 'permission') return;
    // Erst fragen, wenn es etwas zu erinnern gibt.
    const permission = await devicePort.getPermission();
    if (permission !== 'undetermined') return;
    if (planFor(db, new Date()).length === 0) return;
    askOnce();
  }, [db]);

  const respond = useCallback(
    (response: NotificationResponse) => {
      if (response.action === ACTION_DONE) {
        act(db, response.target);
        void client.invalidateQueries();
        void sync();
        return;
      }
      open(response.target);
    },
    [client, db, sync],
  );

  useEffect(() => {
    void sync();
    void devicePort.lastResponse().then((response) => {
      if (response) respond(response);
    });
    const unsubscribeResponses = devicePort.onResponse(respond);
    const app = AppState.addEventListener('change', (state) => {
      if (state === 'active') void sync();
    });
    // Jede Änderung an den Daten kann den Plan verschieben.
    const unsubscribeMutations = client.getMutationCache().subscribe((event) => {
      if (event.type === 'updated' && event.mutation.state.status === 'success') void sync();
    });
    return () => {
      unsubscribeResponses();
      app.remove();
      unsubscribeMutations();
    };
  }, [client, respond, sync]);

  async function allow() {
    closeAsk();
    const permission = await devicePort.requestPermission();
    if (permission === 'granted') {
      await sync();
      return;
    }
    toast(notificationsText.permission.denied);
  }

  return (
    <ConfirmDialog
      visible={asking}
      title={notificationsText.permission.title}
      text={notificationsText.permission.text}
      confirmLabel={notificationsText.permission.ask}
      cancelLabel={notificationsText.permission.later}
      onConfirm={() => void allow()}
      onCancel={closeAsk}
    />
  );
}

/** «Erledigt» und «Gegeben» wirken direkt, sobald die Kennung stimmt. */
function act(db: Db, target: NotificationTarget) {
  if (target.kind === 'health') {
    completeHealthEntry(db, target.entryId, toLocalDate(new Date()));
    return;
  }
  logDose(db, target.medicationId, target.scheduledAt, nowLocal(new Date()));
}

/** Tippen öffnet den Eintrag; bei einer Gabe den Fahrplan, wo sie zu stempeln ist. */
function open(target: NotificationTarget) {
  if (target.kind === 'health') {
    router.push({ pathname: '/edit-entry/[id]', params: { id: target.entryId } });
    return;
  }
  router.push('/');
}

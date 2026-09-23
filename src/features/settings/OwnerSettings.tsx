import { useState } from 'react';
import { View } from 'react-native';

import { settingsText } from '@/content/settings';
import { validationMessage } from '@/content/validation';
import type { Owner } from '@/db/repositories/owner';
import { ownerInputSchema } from '@/domain/owner';
import { AppText } from '@/ui/AppText';
import { announce } from '@/ui/announce';
import { Button } from '@/ui/Button';
import { SectionTitle } from '@/ui/SectionTitle';
import { TextField } from '@/ui/TextField';
import { toast } from '@/ui/toast';
import { space } from '@/ui/tokens';

import { useOwner, useSaveOwner } from './owner-queries';

const t = settingsText.owner;

/** Halterangaben: lädt sie, dann das Formular mit ihren Werten. */
export function OwnerSettings() {
  const owner = useOwner();
  if (owner.isPending) return null;
  return <OwnerForm initial={owner.data ?? null} />;
}

function OwnerForm({ initial }: { initial: Owner | null }) {
  const save = useSaveOwner();
  const [name, setName] = useState(initial?.name ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [address, setAddress] = useState(initial?.address ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit() {
    // Alles leer heisst: keine Halterangaben mehr.
    if (!name.trim() && !phone.trim() && !email.trim() && !address.trim()) {
      save.mutate(null, { onSuccess: () => announceAndShow(t.removed) });
      return;
    }
    const parsed = ownerInputSchema.safeParse({ name, phone, email, address });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = String(issue.path[0] ?? '');
        next[field] ??= validationMessage(field === 'name' ? 'ownerName' : field, issue.message);
      }
      setErrors(next);
      announce(Object.values(next)[0] ?? '');
      return;
    }
    setErrors({});
    save.mutate({ name, phone, email, address }, { onSuccess: () => announceAndShow(t.saved) });
  }

  return (
    <View style={{ gap: space.s3 }}>
      <SectionTitle>{t.title}</SectionTitle>
      <AppText color="pencil">{t.hint}</AppText>
      <TextField label={t.name} value={name} onChangeText={setName} error={errors.name ?? null} />
      <TextField
        label={t.phone}
        inputMode="tel"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        error={errors.phone ?? null}
      />
      <TextField
        label={t.email}
        inputMode="email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        error={errors.email ?? null}
      />
      <TextField
        label={t.address}
        multiline
        value={address}
        onChangeText={setAddress}
        error={errors.address ?? null}
      />
      <Button label={t.save} variant="secondary" onPress={submit} disabled={save.isPending} />
    </View>
  );
}

function announceAndShow(text: string) {
  toast(text);
  announce(text);
}

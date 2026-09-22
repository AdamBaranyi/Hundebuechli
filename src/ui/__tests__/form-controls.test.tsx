import { render, screen, userEvent } from '@testing-library/react-native';
import { useState } from 'react';

import { ChoiceChips } from '../ChoiceChips';
import { ConfirmDialog } from '../ConfirmDialog';
import { EmptyState } from '../StateViews';
import { SwitchRow } from '../SwitchRow';
import { TextField } from '../TextField';
import { textSizes } from './text-sizes';

describe('Eingabefeld', () => {
  it('trägt seine Beschriftung und liest den Fehler mit vor', async () => {
    await render(
      <TextField
        label="Name"
        value=""
        onChangeText={() => undefined}
        error="Gib deinem Hund einen Namen."
      />,
    );
    const field = screen.getByLabelText('Name');
    expect(field.props.accessibilityHint).toBe('Gib deinem Hund einen Namen.');
    expect(screen.getByRole('alert')).toHaveTextContent('Gib deinem Hund einen Namen.');
  });

  it('meldet Eingaben weiter', async () => {
    const onChange = jest.fn();
    function Harness() {
      const [value, setValue] = useState('');
      return (
        <TextField
          label="Rasse"
          value={value}
          onChangeText={(next) => {
            setValue(next);
            onChange(next);
          }}
        />
      );
    }
    await render(<Harness />);
    await userEvent.setup().type(screen.getByLabelText('Rasse'), 'Whippet');
    expect(onChange).toHaveBeenLastCalledWith('Whippet');
  });
});

describe('Auswahl', () => {
  it('ist eine Gruppe von Optionsfeldern mit Zustand', async () => {
    const onSelect = jest.fn();
    await render(
      <ChoiceChips
        label="Geschlecht"
        choices={[
          { value: 'male', label: 'Rüde' },
          { value: 'female', label: 'Hündin' },
        ]}
        selected="male"
        onSelect={onSelect}
      />,
    );
    expect(screen.getByRole('radio', { name: 'Rüde' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Hündin' })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: 'Rüde' })).toHaveStyle({ minHeight: 48 });
    await userEvent.setup().press(screen.getByRole('radio', { name: 'Hündin' }));
    expect(onSelect).toHaveBeenCalledWith('female');
  });
});

describe('Schalter', () => {
  it('ist die ganze Zeile, 56 hoch, mit Zustand', async () => {
    const onChange = jest.fn();
    await render(<SwitchRow label="Kastriert" value={false} onChange={onChange} />);
    const row = screen.getByRole('switch', { name: 'Kastriert' });
    expect(row).not.toBeChecked();
    expect(row).toHaveStyle({ minHeight: 56 });
    await userEvent.setup().press(row);
    expect(onChange).toHaveBeenCalledWith(true);
  });
});

describe('Rückfrage', () => {
  it('nennt, was verschwindet, und bietet Löschen und Abbrechen', async () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    await render(
      <ConfirmDialog
        visible
        title="Bäri löschen?"
        text="Das entfernt 12 Einträge."
        confirmLabel="Bäri und alle Daten löschen"
        cancelLabel="Abbrechen"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );
    // Der Rahmen bleibt für VoiceOver durchlässig, damit die Knöpfe einzeln erreichbar sind.
    expect(screen.getByRole('heading', { name: 'Bäri löschen?' })).toBeOnTheScreen();
    expect(screen.getByText('Das entfernt 12 Einträge.')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Bäri und alle Daten löschen' })).toBeOnTheScreen();
    await userEvent.setup().press(screen.getByRole('button', { name: 'Abbrechen' }));
    expect(onCancel).toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });
});

describe('Leerer Zustand', () => {
  it('ist Hauptüberschrift, wenn er allein steht, und nie kleiner als 16 pt', async () => {
    const { container } = await render(
      <EmptyState title="Diesen Hund gibt es nicht mehr." heading={1} />,
    );
    expect(
      screen.getByRole('heading', { name: 'Diesen Hund gibt es nicht mehr.' }),
    ).toBeOnTheScreen();
    for (const { fontSize } of textSizes(container)) expect(fontSize).toBeGreaterThanOrEqual(16);
  });
});

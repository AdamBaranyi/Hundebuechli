import { render, screen, userEvent } from '@testing-library/react-native';

import { AppText } from '../AppText';
import { Button } from '../Button';
import { Notice } from '../Notice';
import { Row } from '../Row';
import { StampField } from '../StampField';
import { typeScale } from '../tokens';
import { textSizes } from './text-sizes';

describe('AppText', () => {
  it.each(Object.keys(typeScale) as (keyof typeof typeScale)[])(
    'setzt die Stufe %s nie unter 16 pt und lässt die Systemgrösse wirken',
    async (variant) => {
      await render(<AppText variant={variant}>Bäri</AppText>);
      const text = screen.getByText('Bäri');
      expect(text).toHaveStyle({ fontSize: typeScale[variant].fontSize });
      expect(typeScale[variant].fontSize).toBeGreaterThanOrEqual(16);
      expect(text.props.allowFontScaling).not.toBe(false);
    },
  );

  it('zeichnet Überschriften für VoiceOver aus', async () => {
    await render(<AppText heading={1}>Als Nächstes</AppText>);
    expect(screen.getByRole('heading', { name: 'Als Nächstes' })).toBeOnTheScreen();
  });
});

describe('Button', () => {
  it('ist ein Knopf mit Namen und löst aus', async () => {
    const onPress = jest.fn();
    await render(<Button label="Sichern" onPress={onPress} />);
    await userEvent.setup().press(screen.getByRole('button', { name: 'Sichern' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('hat als Hauptaktion 56 und als Textknopf 48 Punkte Höhe', async () => {
    await render(
      <>
        <Button label="Sichern" onPress={() => undefined} />
        <Button label="Abbrechen" variant="text" onPress={() => undefined} />
      </>,
    );
    expect(screen.getByRole('button', { name: 'Sichern' })).toHaveStyle({ minHeight: 56 });
    expect(screen.getByRole('button', { name: 'Abbrechen' })).toHaveStyle({ minHeight: 48 });
    expect(screen.getByText('Sichern')).toHaveStyle({ fontSize: 17 });
  });

  it('meldet den Zustand «deaktiviert» und löst dann nicht aus', async () => {
    const onPress = jest.fn();
    await render(<Button label="Sichern" onPress={onPress} disabled />);
    const button = screen.getByRole('button', { name: 'Sichern' });
    expect(button).toBeDisabled();
    await userEvent.setup().press(button);
    expect(onPress).not.toHaveBeenCalled();
  });
});

describe('StampField', () => {
  it('ist 56 × 56 gross und nennt, was ein Tipp tut', async () => {
    const onPress = jest.fn();
    await render(
      <StampField
        id="e-1"
        state="due"
        label="Entwurmung für Bäri als erledigt stempeln"
        onPress={onPress}
      />,
    );
    const field = screen.getByRole('button', { name: 'Entwurmung für Bäri als erledigt stempeln' });
    expect(field).toHaveStyle({ width: 56, height: 56 });
    await userEvent.setup().press(field);
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

describe('Row', () => {
  it('sagt «fällig» als Text, nicht nur über Farbe', async () => {
    await render(
      <Row
        title="Zeckenschutz"
        secondary="Mila, Bravecto"
        status={{ text: 'Seit 2 Tagen überfällig', due: true }}
        icon="shield"
      />,
    );
    expect(screen.getByText('Seit 2 Tagen überfällig')).toBeOnTheScreen();
    expect(screen.getByText('Zeckenschutz')).toHaveStyle({ fontSize: 17 });
  });

  it('wird mit onPress zur Tippfläche ab 48', async () => {
    const onPress = jest.fn();
    await render(<Row title="Gewicht" secondary="13.8 kg" onPress={onPress} />);
    const row = screen.getByRole('button');
    expect(row).toHaveStyle({ minHeight: 64 });
    await userEvent.setup().press(row);
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

describe('Notice', () => {
  it('zeigt den Hinweis in Nebentext, nicht kleiner als 16 pt', async () => {
    const { container } = await render(<Notice text="Beispieldaten: alles erfunden." />);
    expect(screen.getByText('Beispieldaten: alles erfunden.')).toBeOnTheScreen();
    for (const { fontSize } of textSizes(container)) expect(fontSize).toBeGreaterThanOrEqual(16);
  });
});

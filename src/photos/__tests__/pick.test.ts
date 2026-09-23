/**
 * @jest-environment node
 */
import * as ImagePicker from 'expo-image-picker';

import { pickPhoto } from '../pick';

jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

const picker = jest.mocked(ImagePicker);
const asset = { uri: 'file:///tmp/jupiter.jpg', width: 3024, height: 3024 };
const picked = { canceled: false, assets: [asset] } as ImagePicker.ImagePickerResult;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Foto wählen', () => {
  it('bietet den Zuschnitt des Systems an und fragt kein EXIF ab', async () => {
    picker.launchImageLibraryAsync.mockResolvedValue(picked);
    const result = await pickPhoto('library');
    expect(result).toEqual({
      status: 'picked',
      image: { uri: asset.uri, width: 3024, height: 3024 },
    });
    expect(picker.launchImageLibraryAsync).toHaveBeenCalledWith({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      exif: false,
      quality: 1,
    });
  });

  it('fragt die Kamera erst beim Aufnehmen und öffnet sie ohne Erlaubnis nicht', async () => {
    picker.requestCameraPermissionsAsync.mockResolvedValue({
      granted: false,
    } as ImagePicker.PermissionResponse);
    expect(await pickPhoto('camera')).toEqual({ status: 'denied' });
    expect(picker.launchCameraAsync).not.toHaveBeenCalled();
  });

  it('meldet den Abbruch, ohne etwas zu übernehmen', async () => {
    picker.launchImageLibraryAsync.mockResolvedValue({
      canceled: true,
      assets: null,
    } as ImagePicker.ImagePickerResult);
    expect(await pickPhoto('library')).toEqual({ status: 'cancelled' });
  });
});

import * as ImagePicker from 'expo-image-picker';

import type { PickedImage } from './import-photo';

export type PhotoSource = 'camera' | 'library';

export type PickResult =
  { status: 'picked'; image: PickedImage } | { status: 'cancelled' } | { status: 'denied' };

/**
 * Kamera oder Fotos. Die Erlaubnis wird erst gefragt, wenn jemand ein Foto
 * machen will. Die Auswahl aus den Fotos braucht unter iOS keine Erlaubnis.
 * EXIF wird gar nicht erst angefordert.
 */
export async function pickPhoto(source: PhotoSource): Promise<PickResult> {
  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    allowsEditing: false,
    exif: false,
    quality: 1,
  };
  if (source === 'camera') {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return { status: 'denied' };
  }
  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);
  const asset = result.canceled ? undefined : result.assets[0];
  if (!asset) return { status: 'cancelled' };
  return { status: 'picked', image: { uri: asset.uri, width: asset.width, height: asset.height } };
}

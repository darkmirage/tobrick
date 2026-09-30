export interface LoadedImage {
  readonly bitmap: ImageBitmap;
  readonly previewUrl: string;
  readonly width: number;
  readonly height: number;
  /** Object URL owned by this image, revoked when it is replaced. */
  readonly ownedUrl: string | null;
}

export async function loadImage(input: string | Blob): Promise<LoadedImage> {
  const blob = typeof input === 'string' ? await fetchBlob(input) : input;
  const bitmap = await createImageBitmap(blob, { imageOrientation: 'from-image' });
  const ownedUrl = typeof input === 'string' ? null : URL.createObjectURL(input);
  return {
    bitmap,
    previewUrl: ownedUrl ?? (input as string),
    width: bitmap.width,
    height: bitmap.height,
    ownedUrl,
  };
}

async function fetchBlob(url: string): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not load ${url} (${response.status})`);
  }
  return response.blob();
}

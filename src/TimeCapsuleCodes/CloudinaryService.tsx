interface CloudinaryUploadOptions {
  uri: string;
  uploadPreset: string;
  cloudName: string;
  resourceType?: 'auto' | 'image' | 'video' | 'raw';
  fileName?: string;
  folder?: string;
  tags?: string[];
  additionalParams?: Record<string, string>;
}

const MIME_TYPES: Record<string, { mime: string; resourceType: 'image' | 'video' | 'raw' }> = {
  jpg: { mime: 'image/jpeg', resourceType: 'image' },
  jpeg: { mime: 'image/jpeg', resourceType: 'image' },
  png: { mime: 'image/png', resourceType: 'image' },
  gif: { mime: 'image/gif', resourceType: 'image' },
  webp: { mime: 'image/webp', resourceType: 'image' },
  svg: { mime: 'image/svg+xml', resourceType: 'image' },
  mp4: { mime: 'video/mp4', resourceType: 'video' },
  mov: { mime: 'video/quicktime', resourceType: 'video' },
  avi: { mime: 'video/x-msvideo', resourceType: 'video' },
  webm: { mime: 'video/webm', resourceType: 'video' },
  pdf: { mime: 'application/pdf', resourceType: 'raw' },
  txt: { mime: 'text/plain', resourceType: 'raw' },
};

export const uploadToCloudinary = async (options: CloudinaryUploadOptions): Promise<string> => {
  const {
    uri,
    uploadPreset,
    cloudName,
    resourceType = 'auto',
    fileName: customFileName,
    folder,
    tags,
    additionalParams = {},
  } = options;

  const formData = new FormData();
  const fileExtension = uri.split('.').pop()?.toLowerCase() || '';
  const defaultFileName = `upload.${fileExtension || 'bin'}`;
  const detectedType = MIME_TYPES[fileExtension] || { mime: 'application/octet-stream', resourceType: 'raw' };
  const finalResourceType = resourceType === 'auto' ? detectedType.resourceType : resourceType;
  const mimeType = detectedType.mime;
  const fileName = customFileName || defaultFileName;

  formData.append('file', {
    uri,
    type: mimeType,
    name: fileName,
  } as any);

  formData.append('upload_preset', uploadPreset);
  formData.append('cloud_name', cloudName);
  if (folder) formData.append('folder', folder);
  if (tags?.length) formData.append('tags', tags.join(','));
  Object.entries(additionalParams).forEach(([key, value]) => formData.append(key, value));

  try {
    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${finalResourceType}/upload`,
      {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      }
    );

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      throw new Error(errorData.message || 'Upload failed');
    }

    const data = await uploadResponse.json();
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Upload failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};

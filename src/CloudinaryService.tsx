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
  
  // Supported file extensions and their MIME types
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
    // Add more as needed
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
    
    // Extract file extension from URI
    const fileExtension = uri.split('.').pop()?.toLowerCase() || '';
    const defaultFileName = `upload.${fileExtension || 'bin'}`;
    
    // Get MIME type and resource type if not specified
    const detectedType = MIME_TYPES[fileExtension] || { mime: 'application/octet-stream', resourceType: 'raw' };
    const finalResourceType = resourceType === 'auto' ? detectedType.resourceType : resourceType;
    const mimeType = detectedType.mime;
  
    // Convert the URI to a Blob
    const response = await fetch(uri);
    const blob = await response.blob();
    
    // Use custom filename if provided, otherwise generate one
    const fileName = customFileName || defaultFileName;
    
    formData.append('file', new File([blob], fileName, { type: mimeType }));
    formData.append('upload_preset', uploadPreset);
    formData.append('cloud_name', cloudName);
  
    // Add optional parameters
    if (folder) formData.append('folder', folder);
    if (tags && tags.length > 0) formData.append('tags', tags.join(','));
  
    // Add additional parameters
    Object.entries(additionalParams).forEach(([key, value]) => {
      formData.append(key, value);
    });
  
    try {
      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/${finalResourceType}/upload`,
        {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json',
          },
        }
      );
  
      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.message || 'Cloudinary upload failed');
      }
  
      const data = await uploadResponse.json();
      return data.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error(`Failed to upload to Cloudinary: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
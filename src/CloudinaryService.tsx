export const uploadToCloudinary = async (uri: string, uploadPreset: string, cloudName: string, resourceType: 'image' | 'video' = 'image') => {
    const formData = new FormData();
    
    // Extract file extension from URI
    const fileExtension = uri.split('.').pop()?.toLowerCase();
    let mimeType = 'image/jpeg';
    let fileName = 'upload.jpg';
  
    // Determine MIME type based on file extension
    if (fileExtension === 'mp4' || fileExtension === 'mov' || fileExtension === 'avi') {
      mimeType = 'video/mp4';
      fileName = 'upload.mp4';
      resourceType = 'video';
    } else if (fileExtension === 'png') {
      mimeType = 'image/png';
      fileName = 'upload.png';
    }

    // Convert the URI to a Blob
    const response = await fetch(uri);
    const blob = await response.blob();
    
    formData.append('file', blob, fileName);
    formData.append('upload_preset', uploadPreset);
    formData.append('cloud_name', cloudName);
  
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
        {
          method: 'POST',
          body: formData,
          // Don't set Content-Type header - let the browser set it with the boundary
          headers: {
            'Accept': 'application/json',
          },
        }
      );
      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
};
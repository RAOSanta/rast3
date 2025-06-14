/**
 * Converts an e2 bucket URL to a proxy URL that can be accessed through our API
 * @param originalUrl - The original e2 bucket URL
 * @returns Proxy URL that routes through our API
 */
export function getProxyImageUrl(originalUrl: string): string {
  try {
    const url = new URL(originalUrl);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    // Remove bucket name from path if present (first segment after domain)
    const imagePath = pathParts.slice(1).join('/');
    
    return `/api/images/${imagePath}`;
  } catch (error) {
    console.error('Failed to parse image URL:', originalUrl, error);
    return originalUrl; // Fallback to original if parsing fails
  }
}

/**
 * Handles image loading errors by hiding the image element
 * @param event - The error event from the img element
 */
export function handleImageError(event: React.SyntheticEvent<HTMLImageElement>) {
  const target = event.currentTarget;
  console.error('Failed to load image:', target.src);
  target.style.display = 'none';
}

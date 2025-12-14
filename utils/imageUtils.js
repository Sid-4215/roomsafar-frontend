export function ensureAbsoluteUrl(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `https://roomsafar.com${url.startsWith("/") ? url : "/" + url}`;
}

export function getPrimaryImage(images = []) {
  if (!Array.isArray(images) || images.length === 0) return null;

  // Prefer HALL image
  const hall = images.find(img => img.label === "HALL");
  if (hall) return hall;

  // Otherwise first image
  return images[0];
}

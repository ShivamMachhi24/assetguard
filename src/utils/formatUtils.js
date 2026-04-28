export const formatDate = (dateString) => {
  if (!dateString) return 'NEVER';
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).toUpperCase();
};

export const formatUrl = (url) => {
  if (!url) return '';
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch {
    return url;
  }
};

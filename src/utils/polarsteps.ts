export const normalizePolarstepsUrls = (input?: string | null) => {
  if (!input) {
    return { url: null, embedUrl: null };
  }

  try {
    const trimmed = input.trim();
    if (!trimmed) {
      return { url: null, embedUrl: null };
    }
    const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    if (!url.hostname.includes('polarsteps.com')) {
      return { url: trimmed, embedUrl: null };
    }

    if (url.pathname.startsWith('/embed')) {
      return { url: trimmed, embedUrl: `https://www.polarsteps.com${url.pathname}${url.search}` };
    }

    const cleanPath = url.pathname.replace(/^\//, '');
    const embedUrl = `https://www.polarsteps.com/embed/${cleanPath}${url.search}`;
    return { url: url.toString(), embedUrl };
  } catch (error) {
    console.warn('Invalid Polarsteps URL', error);
    return { url: input, embedUrl: null };
  }
};

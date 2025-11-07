/**
 * Downloads Astro code as a file
 * @param data - Astro code string to download
 * @param filename - Optional filename (defaults to index-{timestamp}.astro)
 */
export const downloadAstro = (data: string, filename: string = `index-${Date.now()}.astro`) => {
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(new Blob([data], { type: 'text/plain' })),
    download: filename
  });
  a.click();
  URL.revokeObjectURL(a.href);
};

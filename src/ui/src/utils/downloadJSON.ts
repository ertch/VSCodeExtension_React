/**
 * Downloads JSON data as a file
 * @param data - JSON string to download
 * @param filename - Optional filename (defaults to canvas-{timestamp}.json)
 */
export const downloadJSON = (data: string, filename: string = `canvas-${Date.now()}.json`) => {
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(new Blob([data], { type: 'application/json' })),
    download: filename
  });
  a.click();
  URL.revokeObjectURL(a.href);
};

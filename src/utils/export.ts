export function getGrotonExportFilename(originalFilename: string): string {
  if (!originalFilename) return "export-groton.png";

  const lastDotIndex = originalFilename.lastIndexOf(".");
  if (lastDotIndex === -1) {
    if (originalFilename.endsWith("-groton")) return originalFilename;
    return `${originalFilename}-groton`;
  }

  const name = originalFilename.substring(0, lastDotIndex);
  const ext = originalFilename.substring(lastDotIndex);

  if (name.endsWith("-groton")) {
    return originalFilename;
  }

  return `${name}-groton${ext}`;
}

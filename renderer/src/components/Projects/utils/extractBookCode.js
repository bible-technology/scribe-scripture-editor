export const extractBookCode = (text) => {
  const idMatch = text.match(/\\id\s+([A-Za-z0-9]{3})/);
  return idMatch ? idMatch[1].toUpperCase() : null;
};

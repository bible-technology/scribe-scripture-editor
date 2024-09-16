export const isUSFM = (filename) => {
  const extension = filename.split('.');
  if (extension[1]?.toLowerCase() === ('usfm' || 'sfm')) {
    return true;
  }
  return false;
};
export const getId = (lines) => {
  let bookCode;
  for (let i = 0; i < 5; i++) {
    if (lines[i]) {
      const splitLine = lines[i].split(/ +/);
      if (splitLine[0] === '\\id') {
        bookCode = splitLine[1];
        break;
      }
    }
  }
  return bookCode;
};

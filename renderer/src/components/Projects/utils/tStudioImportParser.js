const fixIdMarker = (content) => content.replace(/\\id (\w+)/g, (match, bookId) => `\\id ${bookId.toUpperCase()}`);
const fixVersesNewLine = (content) => content.replace(/(\\v \d+)/g, '\n$1');
const fixToc3Uppercase = (content) => content.replace(/\\toc3 (\w+)/g, (match, bookId) => `\\toc3 ${bookId.toUpperCase()}`);
const fixCMarkerFormat = (content) => content.replace(/\\c (\d+)(?![\s\S]*\\c)/g, (match, chapterNumber) => `\\c ${chapterNumber}`);
const fixPBeforeFirstVerse = (content) => content.replace(/\\c (\d+)[\s\S]*?(\\v 1)/g, (match, chapterNumber, verseTag) => `\\c ${chapterNumber}\n\\p\n${verseTag}`);
const fixIdeMarker = (content) => content.replace(/\\ide usfm/g, '\\ide UTF-8\n\\usfm 3.0');
const fixtStudioUsfm = (usfm) => {
    try {
      let content = fixIdMarker(usfm);
      content = fixIdeMarker(content);
      content = fixVersesNewLine(content);
      content = fixToc3Uppercase(content);
      content = fixCMarkerFormat(content);
      content = fixPBeforeFirstVerse(content);
      return content;
    } catch (error) {
      console.error(`Error fixing tStudio import : ${error}`);
    }
};

export {
  fixtStudioUsfm, fixCMarkerFormat, fixIdMarker, fixIdeMarker, fixPBeforeFirstVerse, fixToc3Uppercase, fixVersesNewLine,
};

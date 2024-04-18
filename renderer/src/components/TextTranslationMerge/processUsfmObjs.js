async function processAndIdentiyVerseChangeinUSFMJsons(currentJson, IncomingJson) {
  // process USFM JSONs and generate comparaison object
  const mergeTempJson = JSON.parse(JSON.stringify(currentJson));
  const conflictedChapters = [];

  return new Promise((resolve, reject) => {
    const comparisonResult = async () => {
      mergeTempJson.chapters.forEach((chapter, index) => {
        const IncomingChap = IncomingJson.chapters[index];
        chapter.contents.forEach((content) => {
          if (content.verseNumber) {
            const IncomingVerse = IncomingChap.contents.find((ch) => ch.verseNumber === content.verseNumber);
            // console.log(IncomingVerse);
            if (content.verseText !== IncomingVerse.verseText) {
              // add incoming data
              content.current = JSON.parse(JSON.stringify(content));
              content.incoming = IncomingVerse;
              content.resolved = { status: false, resolvedContent: null };
              !conflictedChapters.includes(chapter.chapterNumber) && conflictedChapters.push(chapter.chapterNumber);
            }
          }
        });
      });
      // console.log({ mergeTempJson, conflictedChapters });
    };
    comparisonResult().then(() => resolve([mergeTempJson, conflictedChapters])).catch((err) => reject(err));
  });
}

export { processAndIdentiyVerseChangeinUSFMJsons };

async function processAndIdentiyVerseChangeinUSFMJsons(currentJson, IncomingJson) {
  // process USFM JSONs and generate comparaison object

  return new Promise((resolve, reject) => {
    const compareVerses = async (incomingVerse, currentVerse, chapter) => new Promise((resolve, reject) => {
      try {
        resolve(incomingVerse.verseText === currentVerse.verseText);
      } catch (err) {
        console.log({ incomingVerse, currentVerse, chapter });
        reject(err);
      }
    });

    const processChapter = async (incomingChapter, currentChapter) => {
      const versesComparisonPromises = incomingChapter.contents.map(async (incomingVerse, i) => {
        const currentVerse = currentChapter.contents[i];
        const versesAreEqual = await compareVerses(incomingVerse, currentVerse, currentChapter.chapterNumber);
        return { [incomingVerse.verseNumber]: { versesAreEqual } };
      });
      const data = await Promise.all(versesComparisonPromises);
      const reducedObj = data.reduce((final, item) => {
          const key = Object.keys(item)[0];
          final[key] = item[key];
          return final;
        }, {});
      return reducedObj;
    };

    const comparisonResult = async () => {
      const chapterComparisonPromises = IncomingJson.chapters.map(async (incomingChapter, index) => {
        const currentChapter = currentJson.chapters[index];
        const data = await processChapter(incomingChapter, currentChapter);
        return { [currentChapter.chapterNumber]: data };
      });
      const data = await Promise.all(chapterComparisonPromises);
      const reducedObj = data.reduce((final, item) => {
          const key = Object.keys(item)[0];
          final[key] = item[key];
          return final;
        }, {});
      return reducedObj;
    };

    comparisonResult().then((out) => resolve(out)).catch((err) => reject(err));
  });
}

export { processAndIdentiyVerseChangeinUSFMJsons };

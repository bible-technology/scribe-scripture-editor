// split any string into array items based on last occurence of something
// both inputs should be string

export async function splitStringByLastOccurence(text, splitter) {
    const lastOccurenceIndex = text.lastIndexOf(splitter);

    if (lastOccurenceIndex !== -1) {
      const prefix = text.substring(0, lastOccurenceIndex);
      const suffix = text.substring(lastOccurenceIndex + 1);
      return [prefix, suffix];
    }

    // No Occurence found
    return [text];
  }

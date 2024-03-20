import {
  insertVerseNumber, insertChapterNumber, insertFootnote, insertXRef,
} from '@/util/cursorUtils';

export const functionMapping = {
  insertVerseNumber: {
    title: 'Insert Verse', function: insertVerseNumber, icon: 'V', pholder: 'Verse number',
  },
  insertChapterNumber: {
    title: 'Insert Chapter', function: insertChapterNumber, icon: 'C', placeholder: 'Chapter number',
  },
  insertFootnote: {
    title: 'Insert Footnote', function: insertFootnote, icon: 'FN', placeholder: 'Footnote',
  },
  insertXRef: {
    title: 'Insert Cross Reference', function: insertXRef, icon: 'XR', placeholder: 'Cross Reference',
  },
};

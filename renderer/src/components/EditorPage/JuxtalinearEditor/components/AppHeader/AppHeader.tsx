import React, { useContext, useEffect } from "react";
import { IonHeader, IonToolbar } from "@ionic/react";
import { ProjectContext } from '@/components/context/ProjectContext';
import { ReferenceContext } from '@/components/context/ReferenceContext';

import {
  IoArrowBackCircleOutline,
  IoArrowForwardCircleOutline,
} from "react-icons/io5";
import { Button, Box, Stack, Input } from "@mui/material";

import { SentenceContext } from "../../index";
import saveAs from "file-saver";

export const AppHeader: React.FC = () => {
  const {
    // fileName,
    sentences,
    // itemArrays,
    curIndex,
    setFileName,
    setGlobalTotalSentences,
    setItemArrays,
    setOriginText,
    setCurIndex,
  } = useContext(SentenceContext);

  const {
    state: {
      bookId,
      bookList,
      bookName,
      chapter,
      verse,
      chapterList,
      verseList,
      languageId,
      folderPath,
      refName,
      closeNavigation,
    }, actions: {
      onChangeBook,
      onChangeChapter,
      onChangeVerse,
      setFolderPath,
      applyBooksFilter,
      setCloseNavigation,
      setRefName,
    },
  } = useContext(ReferenceContext);

  const onPrevHandler = () => {
    if (curIndex > 0) {
      setCurIndex(curIndex - 1);
    }
  };

  const onNextHandler = () => {
    if (curIndex < sentences.length - 1) {
      setCurIndex(curIndex + 1);
    }
  };

  useEffect(() => {
    setCurIndex(getSentenceFromCV());
  }, [closeNavigation]);

  const getSentenceFromCV = () => {
    if (
      !sentences.length ||
      !sentences[curIndex].chunks[0]?.source.length ||
      sentences[curIndex].chunks[0]?.source[0] === null
    ) {
      return 0;
    }

    let chap: number, vers: number;
    let doBreak: boolean;
    for(let i = 0; i < sentences.length; i++) {
      doBreak = false;
      for(let chunk of sentences[i].chunks) {
        for(let src of chunk.source) {
          [chap, vers] = src.cv.split(":").map((digit) => parseInt(digit));
          if(chap < chapter && vers < verse) {
            doBreak = true;
            break;
          }
          if(chap == chapter && vers == verse) return i;
        }
        if(doBreak) break;
      }
    }
    return 0;
  }

  const firstSource = () => {
    if (
      !sentences.length ||
      !sentences[curIndex].chunks[0]?.source.length ||
      sentences[curIndex].chunks[0]?.source[0] === null
    ) {
      return null;
    }
    return sentences[curIndex].chunks[0]?.source[0];
  };

  const lastSource = () => {
    if (
      !sentences.length ||
      !sentences[curIndex].chunks.slice(-1)[0]?.source.length ||
      sentences[curIndex].chunks.slice(-1)[0]?.source[0] === null
    ) {
      return null;
    }
    return sentences.length
      ? sentences[curIndex].chunks.slice(-1)[0]?.source.slice(-1)[0]
      : null;
  };

  const currentChapter = () => firstSource()?.cv.split(":")[0] ?? 0;

  const startVerse = () => firstSource()?.cv.split(":")[1] ?? 0;

  const endVerse = () => lastSource()?.cv.split(":")[1] ?? 0;
  
  const indexChangeHandler = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const index = parseInt(e.target.value);
    if (index > 0 && index <= sentences.length) {
      setCurIndex(index - 1);
    }
  };

  return (
    <IonHeader>
      <IonToolbar>
        <Stack flexDirection="row" justifyContent="center" alignItems="center">
          <Button onClick={onPrevHandler}>
            <IoArrowBackCircleOutline size={32} color="#FF5500" />
          </Button>
          <Stack alignItems="center">
            {/* <Box sx={{ color: "white", fontStyle: "italic" }}>{fileName}</Box> */}
            <Box sx={{ color: "#4B5563", fontSize: "14px" }}>
              Sentence&nbsp;
              <Input
                value={sentences.length ? curIndex + 1 : 0}
                sx={{ width: "30px" }}
                inputProps={{ style: { textAlign: "center", color: "black" } }}
                onChange={indexChangeHandler}
              />
              &nbsp;of {sentences.length} (ch:{currentChapter()}, v{startVerse()} -{" "}
              {endVerse()})
            </Box>
          </Stack>
          <Button onClick={onNextHandler} color="primary">
            <IoArrowForwardCircleOutline size={32} color="#FF5500" />
          </Button>
        </Stack>
      </IonToolbar>
    </IonHeader>
  );
};

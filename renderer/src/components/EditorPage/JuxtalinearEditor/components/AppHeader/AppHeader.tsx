import React, { useContext, useRef, useEffect, useState } from "react";

import { IonHeader, IonToolbar } from "@ionic/react";
import { ProjectContext } from '@/components/context/ProjectContext';
import packageInfo from '../../../../../../../package.json';

import {
  IoArrowBackCircleOutline,
  IoArrowForwardCircleOutline,
} from "react-icons/io5";
import { Button, Box, Stack, Input } from "@mui/material";
// import SentenceContext from "@/components/context/SentenceContext";
// import { ISentence, ISentenceContext, ISource } from '../../types.d.ts';

import { SentenceContext } from "../../index";
import { readUsfm } from "../../utils/readUsfm";
import saveAs from "file-saver";
// import { readFile } from '../../../../../core/editor/readFile';
import localforage from 'localforage';
import { useReadUsfmFile } from "../../../JuxtaTextEditor/hooks/useReadUsfmFile";

export const AppHeader: React.FC = () => {
  const usfmOpenRef = useRef<HTMLInputElement>(null);
  const jsonOpenRef = useRef<HTMLInputElement>(null);
  const [loadOnce, setLoadOnce] = useState<boolean>(false);
  const { usfmData, bookAvailable } = useReadUsfmFile();

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

  useEffect(() => {
    if(!loadOnce) {
      tryLoadSentences();
      setLoadOnce(true);
    }
  }, [usfmData, bookAvailable]);

  const getItems = (res: ISentence[]) => {
    return res[0].chunks
      .map(({ source, gloss }, index: number) => {
        return {
          chunk: source
            .filter((s) => s)
            .map((s: ISource, n: number) => {
              return {
                id: `item-${index * 1000 + n}`,
                content: s.content,
                index: s.index,
              };
            }),
          gloss,
        };
      })
      .filter(({ chunk }) => chunk.length);
  };

  const remakeSentences = (stcs: ISentence[]) => {
    return stcs.map((stc) => {
      const counts: { [key: string]: any } = {};
      const chunks = stc.chunks.filter(({source}) => source[0]).map((chunk) => {
        const source = chunk.source.map((src) => {
          if (counts[src.content] === undefined) {
            counts[src.content] = 0;
          } else {
            counts[src.content]++;
          }
          return { ...src, index: counts[src.content] };
        });
        return {
          source,
          gloss: chunk.gloss,
        };
      });
      return {
        originalSource: stc.originalSource,
        chunks,
        sourceString: stc.sourceString,
      };
    });
  };

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

  const openUsfm = () => {
    usfmOpenRef.current?.click();
  };

  const openJson = () => {
    jsonOpenRef.current?.click();
  };

  const openClickHandler = (
    e: React.MouseEvent<HTMLInputElement, MouseEvent>
  ) => {
    const element = e.target as HTMLInputElement;
    element.value = "";
  };

  const tryLoadSentences = () => {
    // const projectName = await localforage.getItem('currentProject');
    // const blob = new Blob([usfmData[0] as string], { type: 'application/json' });
    // saveAs(blob, 'cake.json');
    if(usfmData[0] && usfmData[0].data) {
      const blob = new Blob([usfmData[0].data as string], { type: 'application/json' });
      saveAs(blob, 'cake.json');
      const res = readUsfm(usfmData[0].data);
      setFileName(usfmData[0].bookCode);
      setCurIndex(0);
      setGlobalTotalSentences(remakeSentences(res));
      setOriginText(res.map((sentence) => sentence.sourceString));
      if (res.length) {
        setItemArrays([getItems(res)]);
      }
    }
    // readFile({ projectname: projectName, filename: "ingredients/57-TIT.usfm", username: "danielc-n" })
    //   .then((content) => {
    //     // const fse = window.require('fs-extra');
    //     // const content = fse.readFileSync("/home/daniel/Desktop/57-TIT.usfm").toString();
    //     const blob = new Blob([content], { type: 'application/json' });
    //     saveAs(blob, 'cake.json');
    //     if(content) {
    //       const res = readUsfm(content);
    //       setFileName("57-TIT.usfm");
    //       setCurIndex(0);
    //       setGlobalTotalSentences(remakeSentences(res));
    //       setOriginText(res.map((sentence) => sentence.sourceString));
    //       if (res.length) {
    //         setItemArrays([getItems(res)]);
    //       }
    //     }
    // }).catch((err) => {
    //   const blob = new Blob([err as string], { type: 'application/json' });
    //   saveAs(blob, 'cake.json');
    // });
  }

  const openUsfmHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.item(0)) {
      return;
    }
    const item = e.target.files.item(0);
    if (!item) {
      return;
    }

    setFileName(item.name);
    let srcUsfm;
    try {
      srcUsfm = await e.target.files.item(0)?.text();
    } catch (err) {
      throw new Error(`Could not load srcUsfm: ${err}`);
    }

    const res = readUsfm(srcUsfm);
    setCurIndex(0);
    setGlobalTotalSentences(remakeSentences(res));
    setOriginText(res.map((sentence) => sentence.sourceString));
    if (res.length) {
      setItemArrays([getItems(res)]);
    }
  };

  const openJsonHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.item(0)) {
      return;
    }
    const item = e.target.files.item(0);
    if (!item) {
      return;
    }

    setFileName(item.name);
    const data = await e.target.files.item(0)?.text();
    if (data) {
      const stcs = JSON.parse(data);
      setCurIndex(0);
      setGlobalTotalSentences(remakeSentences(stcs));
      setOriginText(stcs.map((sentence: any) => sentence.sourceString));
      if (stcs.length) {
        setItemArrays([getItems(stcs)]);
      }
    }
  };

  const saveJsonHandler = () => {
    sentences[0].chunks.filter(({source}) => source[0]).forEach(({ source }) => {
      source.filter(e => e);
    });
    const json = JSON.stringify(sentences);
    const blob = new Blob([json], { type: "application/json" });

    saveAs(blob, "data.json");
  };
  
  const indexChangeHandler = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const index = parseInt(e.target.value);
    if (index > 0 && index <= sentences.length) {
      setCurIndex(index - 1);
    }
  };

  // const [mode, setMode] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light");

  // useEffect(() => {
  //   window.matchMedia('(prefers-color-scheme: dark)')
  //     .addEventListener('change', event => {
  //       const colorScheme = event.matches ? "dark" : "light";
  //       setMode(colorScheme);
  //     });
  // }, []);

  return (
    <IonHeader>
      <IonToolbar>
        <Stack flexDirection="row" justifyContent="center" alignItems="center">
          {/* <Stack flexDirection="row" justifyContent="center" gap={1}>
            <Button variant="contained" onClick={openUsfm}>
              Open usfm
            </Button>
            <Button variant="contained" onClick={openJson}>
              Open json
            </Button>
            <input
              type="file"
              ref={usfmOpenRef}
              onClick={openClickHandler}
              onChange={openUsfmHandler}
              hidden
            />
            <input
              type="file"
              ref={jsonOpenRef}
              onClick={openClickHandler}
              onChange={openJsonHandler}
              hidden
            />
          </Stack> */}
          <Button onClick={onPrevHandler}>
            <IoArrowBackCircleOutline size={32} color="#111827" />
          </Button>
          <Stack alignItems="center">
            {/* <Box sx={{ color: "white", fontStyle: "italic" }}>{fileName}</Box> */}
            <Box sx={{ color: "white", fontSize: "14px" }}>
              Sentence
              <Input
                value={sentences.length ? curIndex + 1 : 0}
                sx={{ width: "30px" }}
                inputProps={{ style: { textAlign: "center", color: "black" } }}
                onChange={indexChangeHandler}
              />
              of {sentences.length} (ch:{currentChapter()}, v{startVerse()} -{" "}
              {endVerse()})
            </Box>
          </Stack>
          <Button onClick={onNextHandler} color="primary">
            <IoArrowForwardCircleOutline size={32} color="#111827" />
          </Button>
          {/* <Stack flexDirection="row" justifyContent="center" gap={1}>
            <Button variant="contained">
              <div id="download-link" onClick={saveJsonHandler}>
                Save json
              </div>
            </Button>
            <Button variant="contained" disabled>
              Save usfm
            </Button>
          </Stack> */}
        </Stack>
      </IonToolbar>
    </IonHeader>
  );
};

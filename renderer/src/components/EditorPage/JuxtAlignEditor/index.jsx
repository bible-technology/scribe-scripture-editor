/* eslint-disable */
import React, { useState, useEffect, useContext } from 'react';

// import { setupIonicReact } from '@ionic/react'
// import { useTranslation } from 'react-i18next';
import { SentenceContext } from '@/components/context/SentenceContext';
// import { ReferenceContext } from '@/components/context/ReferenceContext';
// import Home from '../JuxtalinearEditor/pages/Home';

/* Core CSS required for Ionic components to work properly */
// import '@ionic/react/css/core.css';

import Help from '../../../../../public/icons/sundesmos/alignHelp.png';
import Information from '../../../../../public/icons/circle-info-solid.svg';
import Close from '../../../../../public/icons/x-solid.svg';

// import { ISentence, IChunk } from './types';
import plse from './plse.json';
// import jxt from './jxtl.json';

export default function JuxtAlignEditor() {
  const {
    sentences,
    // originText,
    // itemArrays,
    curIndex,
    // fileName,
    // setFileName,
    // setGlobalTotalSentences,
    // setItemArrays,
    // setOriginText,
    setCurIndex,
    // setGlobalSentences,
    // setGlobalItemArrays,
  } = useContext(SentenceContext);

  // const {
  //   state: {
  //     bookId,
  //     bookList,
  //     bookName,
  //     chapter,
  //     verse,
  //     chapterList,
  //     verseList,
  //     fontSize,
  //     selectedFont,
  //     languageId,
  //     folderPath,
  //     refName,
  //     //  closeNavigation,
  //   }, actions: {
  //     onChangeChapter,
  //     onChangeVerse,
  //   },
  // } = useContext(ReferenceContext);

  const [open, setOpen] = useState(true);
  const [ctrlPressed, setCtrlPressed] = useState(false);
  const [currentChuncksId, setCurrentChuncksId] = useState(
    sentences[curIndex].chunks[0].checksum,
  );
  const [elemSelected, setElemSelected] = useState('none');
  const [currentBlockid, setCurrentBlockId] = useState(0);
  const [blocksSentenceId, setBlockSentenceId] = useState(
    plse.blocks[0].sentences,
  );
  const [currentSetenceId, setcurrentSentenceId] = useState(
    blocksSentenceId[0],
  );

  const [currentWords, setCurrentWords] = useState([]);
  const [idsWord, setIdsWord] = useState([]);

  const [hoverNotSelectedWord, setHoverNotSelectedWord] = useState([]);


  const mapSentencesToBlocks = () => {
    let res = {};
    for(let i = 0; i < plse.blocks.length; i++) {
      for(let sents = 0; sents < plse.blocks[i].sentences.length; sents++) {
        res[plse.blocks[i].sentences[sents]] = i;
      }
    }

    return res;
  }

  const [sentencesToBlocksMap, setSentencesToBlocksMap] = useState(mapSentencesToBlocks());

  const modifyPLSE = () => {
    if (plse.blocks[currentBlockid].alignments.length > 0) {
      for (let i = 0; i < plse.blocks[currentBlockid].alignments.length; i++) {
        if (
          currentChuncksId
          === plse.blocks[currentBlockid].alignments[i].md5Chunck
        ) {
          plse.blocks[currentBlockid].alignments[i] = {
            sentences: currentSetenceId,
            words: currentWords,
            md5Chunck: currentChuncksId,
          };
          return;
        }
      }
      plse.blocks[currentBlockid].alignments.push({
        sentences: currentSetenceId,
        words: currentWords,
        md5Chunck: currentChuncksId,
      });
    } else {
      plse.blocks[currentBlockid].alignments.push({
        sentences: currentSetenceId,
        words: currentWords,
        md5Chunck: currentChuncksId,
      });
    }
  };

  useEffect(() => {
    if (currentChuncksId != '') {
      for (let i = 0; i < plse.blocks[currentBlockid].alignments.length; i++) {
        if (
          currentChuncksId
          === plse.blocks[currentBlockid].alignments[i].md5Chunck
        ) {
          setCurrentWords(plse.blocks[currentBlockid].alignments[i].words);
          return;
        }
      }
    }
    setCurrentWords([]);
  }, [currentChuncksId]);

  const changeBlockId = (bid) => {
    if (bid >= 0 && bid < plse.blocks.length) {
      modifyPLSE();
      setCurrentBlockId(bid);
    }
  };

  useEffect(() => {
    if (sentences.length && sentences[curIndex]) {
      setcurrentSentenceId(curIndex);
      changeBlockId(sentencesToBlocksMap[curIndex]);
    }
  }, [curIndex, sentences, setCurIndex]);

  useEffect(() => {
    const tabl = [];
    for (
      let i = 0;
      i <= plse.blocks[currentBlockid].tradText.split(' ').length;
      i++
    ) {
      tabl.push(i);
    }
    for (let i = 0; i < plse.blocks[currentBlockid].alignments.length; i++) {
      plse.blocks[currentBlockid].alignments[i].words.map((w) => {
        tabl.splice(tabl.indexOf(w), 1);
      });
    }
    setIdsWord(tabl);
    setBlockSentenceId(plse.blocks[currentBlockid].sentences);
    setCurrentChuncksId(
      sentences[plse.blocks[currentBlockid].sentences[0]].chunks[0].checksum,
    );
  }, [currentBlockid]);

  const myFunctionTrue = () => {
    setCtrlPressed(true);
  };
  const myFunctionFalse = () => {
    setCtrlPressed(false);
  };

  useEffect(() => {
    const keyDownHandler = (event) => {
      if (event.key === 'Control') {
        event.preventDefault();
        myFunctionTrue();
      }
    };
    const keyUphandler = (event) => {
      if (event.key === 'Control') {
        event.preventDefault();
        myFunctionFalse();
      }
    };
    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUphandler);

    return () => {
      document.removeEventListener('keydown', keyDownHandler);
    };
  }, []);

  return (
    <div style={{ margin: 20, height: '100vh' }}>
      {/* <div
        style={{
          flexDirection: "row",
          display: "flex",
          justifyContent: "space-between",
          margin: 20,
        }}
      > */}
      {/* <div
          className="Button"
          style="cursor: pointer;"
          onClick={() => {
            modifyPLSE();
            changeBlockId(currentBlockid - 1);
          }}
        >
          block precedent
        </div>
        <div style={{ fontSize: "2em" }}>
          {currentBlockid + 1}/{plse.blocks.length}
        </div>

        <div
          className="Button"
          style="cursor: pointer;"
          onClick={() => {
            modifyPLSE();
            changeBlockId(currentBlockid + 1);
          }}
        >
          block suivant
        </div> */}
      {/* </div> */}
      <div style={{ flexDirection: 'row', display: 'flex', height: '100%' }}>
        <div className="diva" style={{ overflowY: 'scroll', flex: 1 }}>
          {blocksSentenceId.map((ids) => sentences[ids].chunks.map((c, i) => (
            <div
              key={c.checksum}
              className="sentencesWrapper"
              onMouseEnter={() => {
                  if (c.checksum !== currentChuncksId) {
                    for (
                      let i = 0;
                      i < plse.blocks[currentBlockid].alignments.length;
                      i++
                    ) {
                      if (
                        c.checksum
                        === plse.blocks[currentBlockid].alignments[i].md5Chunck
                      ) {
                        console.log(
                          plse.blocks[currentBlockid].alignments,
                        );

                        setHoverNotSelectedWord(
                          plse.blocks[currentBlockid].alignments[i].words,
                        );
                      }
                    }
                  }
                }}
              onMouseLeave={() => {
                  setHoverNotSelectedWord([]);
                }}
              data-hasBeenDone={JSON.stringify(
                  plse.blocks[currentBlockid].alignments
                    .map(
                      (a) => a.md5Chunck === c.checksum && a.words.length > 0,
                    )
                    .indexOf(true) >= 0,
                )}
              data-isSelected={currentChuncksId === c.checksum}
              onClick={() => {
                  modifyPLSE();
                  setcurrentSentenceId(ids);
                  setCurrentChuncksId(c.checksum);
                }}
              role="button"
              tabIndex={0}
            >
              <div
                id={c.checksum}
                data-isSelected={currentChuncksId === c.checksum}
                className="chunck"
              >
                {c.gloss === "" ? "No text!" : c.gloss}
              </div>
            </div>
            )))}
        </div>
        <div className="divb" id="wrapper" style={{ overflowY: 'scroll', flex: 1 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', margin: 15 }}>
            {plse.blocks[currentBlockid].tradText.split(' ').map((w, id) => (
              <p
                onClick={() => {
                  if (idsWord.includes(id)) {
                    if (!currentWords.includes(id)) {
                      setCurrentWords((prev) => {
                        const prev2 = [...prev];
                        prev2.push(id);
                        return prev2;
                      });
                      setIdsWord((prev) => {
                        const prevIdsWord = [...prev];
                        prevIdsWord.splice(prevIdsWord.indexOf(id), 1);
                        return prevIdsWord;
                      });
                    } else {
                    }
                  } else if (currentWords.includes(id)) {
                      setIdsWord((prev) => {
                        const prev2 = [...prev];
                        prev2.push(id);
                        return prev2;
                      });
                      setCurrentWords((prev) => {
                        const prevIdsWord = [...prev];
                        prevIdsWord.splice(prevIdsWord.indexOf(id), 1);
                        return prevIdsWord;
                      });
                    }
                }}
                onMouseDown={() => {
                  setElemSelected([id, [...currentWords]]);
                }}
                onMouseUp={() => {
                  setElemSelected('none');
                }}
                onMouseOver={() => {
                  if (elemSelected != 'none') {
                    for (let wid = 0; wid < currentWords.length; wid++) {
                      if (
                        elemSelected[1].indexOf(currentWords[wid]) < 0
                        && (currentWords[wid] < elemSelected[0]
                          || currentWords[wid] > id)
                      ) {
                        setIdsWord((prev) => {
                          const prev2 = [...prev];
                          prev2.push(currentWords[wid]);
                          return prev2;
                        });
                        setCurrentWords((prev) => {
                          const prevIdsWord = [...prev];
                          prevIdsWord.splice(wid, 1);
                          return prevIdsWord;
                        });
                      }
                    }
                    for (let i = parseInt(elemSelected[0]); i <= id; i++) {
                      if (idsWord.includes(i)) {
                        if (!currentWords.includes(i)) {
                          setCurrentWords((prev) => {
                            const prev2 = [...prev];
                            prev2.push(i);
                            return prev2;
                          });
                          setIdsWord((prev) => {
                            const prevIdsWord = [...prev];
                            prevIdsWord.splice(prevIdsWord.indexOf(i), 1);
                            return prevIdsWord;
                          });
                        } else {
                        }
                      }
                    }
                  }
                }}
                // onMouseOver={() => {
                //   console.log(ctrlPressed)
                //   if (ctrlPressed) {
                //
                className="Word"
                id="Word"
                data-selected={currentWords.includes(id)}
                data-ctrl={ctrlPressed}
                data-notSelectedBuHover={hoverNotSelectedWord.includes(id)}
                data-notCLicable={
                  !currentWords.includes(id) && !idsWord.includes(id)
                }
              >
                {w}
              </p>
            ))}
          </div>
        </div>
      </div>
      <div style={{ position: 'fixed', bottom: 60, right: 60 }}>
        {open ? (
          <>
            <div
              style={{
                flexDirection: 'column',
                justifyContent: 'flex-end',
                display: 'flex',
                background: '#ebebeb',
                borderRadius: 10,
              }}
            >
              <div className="container">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="btn"
                  style={{
                    alignSelf: 'flex-end', marginTop: 16, marginRight: 16, cursor: 'pointer',
                  }}
                >
                  {/* <img
                    // style={{ alignSelf: 'flex-end', marginTop: 16, marginRight: 16 }}
                    // onClick={() => setOpen(false)}
                    /> */}
                  <Close
                    // src={close}
                    width="24"
                    height="24"
                    alt="information"
                  />
                </button>
              </div>
              <img src={Help.src} height={307} width={581} alt="align helper" />

            </div>
            <div className="container">
              <Information 
                onClick={() => setOpen(false)}
                style={{ position: 'fixed', bottom: 35, right: 35, cursor: 'pointer' }}
                width="40"
                height="40"
                alt="information"
              />
            </div>
          </>
        ) : (
          <div className="container">
            <Information 
              onClick={() => setOpen(true)}
              style={{ position: 'fixed', bottom: 35, right: 35, cursor: 'pointer' }}
              width="40"
              height="40"
              alt="information"
            />
          </div>
        )}
      </div>
    </div>
  );
}

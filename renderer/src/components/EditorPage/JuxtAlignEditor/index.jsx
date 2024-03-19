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

import { ModalSureEverythingAlign } from "./modalSureEverythingAlign";
import { AlignedButton } from "./AlignedButton";

import { lexingRegexes } from "proskomma-core";
import XRegExp from "xregexp";
import { readUserSettings, saveUserSettings } from '@/core/projects/userSettings';

// import { ISentence, IChunk } from './types';
import plse from './plse.json';

export default function JuxtAlignEditor() {
  const {
    sentences,
    // originText,
    // itemArrays,
    curIndex,
    // fileName,
    helpAldearyOpenedOnce,
    zoomLeftJuxtalign,
    zoomRightJuxtalign,
    // setFileName,
    // setGlobalTotalSentences,
    // setItemArrays,
    // setOriginText,
    setCurIndex,
    // setGlobalSentences,
    // setGlobalItemArrays,
    setHelpAldearyOpenedOnce,
    setZoomLeftJuxtalign,
    setZoomRightJuxtalign,
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

  const mapSentencesToBlocks = () => {
    let res = {};
    for (let i = 0; i < plse.blocks.length; i++) {
      for (let sents = 0; sents < plse.blocks[i].sentences.length; sents++) {
        res[plse.blocks[i].sentences[sents]] = i;
      }
    }

    return res;
  }
  const [sentencesToBlocksMap, setSentencesToBlocksMap] = useState(mapSentencesToBlocks());

  const mainRegex = XRegExp.union(lexingRegexes.map((x) => x[2]));
  // ****
  // * Need to put this in a context
  const [optionDontShowAlignModal, setOptionDontShowAlignModal] = useState(false);
  // ****
  const [isAlignModalOpen, setIsAlignModalOpen] = useState(false);
  const [isCurrentSentenceAlign, setIsCurrentSentenceAlign] = useState(false);

  const [openHelp, setOpenHelp] = useState(!helpAldearyOpenedOnce);
  const [left, setLeft] = useState('none');
  const [ctrlPressed, setCtrlPressed] = useState(false);
  const [currentChuncksId, setCurrentChuncksId] = useState('none');
  const [elemSelected, setElemSelected] = useState('none');
  const [currentBlockid, setCurrentBlockId] = useState(sentencesToBlocksMap[curIndex]);
  const [blocksSentenceId, setBlockSentenceId] = useState(
    plse.blocks[0].sentences
  );
  const [currentSetenceId, setcurrentSentenceId] = useState(
    blocksSentenceId[0]
  );
  const [userSettingsJson, setUserSettingsJson] = useState(null);

  const [currentWords, setCurrentWords] = useState([]);
  const [idsWord, setIdsWord] = useState([]);

  const [hoverNotSelectedWord, setHoverNotSelectedWord] = useState([]);

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
    async function getUserSettings() {
      console.log('userSettingsJson== ', userSettingsJson);
      if (!helpAldearyOpenedOnce) {
        let tmpUsrSet = await readUserSettings();
        setUserSettingsJson(tmpUsrSet);
      }
    }
    getUserSettings();
  }, [helpAldearyOpenedOnce]);

  useEffect(() => {
    if (openHelp && !helpAldearyOpenedOnce) {
      setHelpAldearyOpenedOnce(true);
    }
    if (userSettingsJson && !userSettingsJson.juxtalignHelperOpened) {
      userSettingsJson.juxtalignHelperOpened = true;
      // write file back
      saveUserSettings(userSettingsJson);
    }
  }, [openHelp]);

  useEffect(() => {
    if (currentChuncksId != '') {
      for (let i = 0; i < plse.blocks[currentBlockid].alignments.length; i++) {
        if (currentChuncksId === plse.blocks[currentBlockid].alignments[i].md5Chunck) {
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
    modifyPLSE()
  }, [isCurrentSentenceAlign])

  useEffect(() => {
    if (sentences.length && sentences[curIndex]) {
      setcurrentSentenceId(curIndex);
      changeBlockId(sentencesToBlocksMap[curIndex]);
      setCurIndex(curIndex);
    }
  }, [curIndex, sentences, setCurIndex]);

  useEffect(() => {
    let tabl = [];
    for (
      let i = 0;
      i <=
      XRegExp.match(plse.blocks[currentBlockid].tradText, mainRegex, "all")
        .length;
      i++
    ) {
      tabl.push(i);
    }
    for (let i = 0; i < plse.blocks[currentBlockid].alignments.length; i++) {
      plse.blocks[currentBlockid].alignments[i].words.map((w) => {
        tabl.splice(tabl.indexOf(w), 1);
      });
    }


    if (!plse.blocks[currentBlockid].chunckAlign) {
      let chunckAlign = {}
      for (let i = 0; i < plse.blocks[currentBlockid].sentences.length; i++) {
        sentences[plse.blocks[currentBlockid].sentences[i]].chunks.map(c => chunckAlign[c.checksum] = false)
      }
      plse.blocks[currentBlockid].chunckAlign = chunckAlign

    }

    if (!plse.blocksAlign) {
      let blocksAlign = []
      for (let i = 0; i < plse.blocks.length; i++) {
        blocksAlign.push(false)
      }
      plse.blocksAlign = blocksAlign
    } else {
      setIsCurrentSentenceAlign(plse.blocksAlign[currentBlockid])
    }
    setIdsWord(tabl);
    setBlockSentenceId(plse.blocks[currentBlockid].sentences);
    setCurrentChuncksId(
      sentences[plse.blocks[currentBlockid].sentences[0]].chunks[0].checksum
    );
  }, [currentBlockid]);

  const myFunctionPlusTrue = () => {
    if (left) {
      setZoomLeftJuxtalign((prev) => prev + 2);
    }
    if (!left) {
      setZoomRightJuxtalign((prev) => prev + 2);
    }
  };
  const myFunctionMinusFalse = () => {
    if (left) {
      setZoomLeftJuxtalign((prev) => prev - 2);
    }
    if (!left) {
      setZoomRightJuxtalign((prev) => prev - 2);
    }
  };
  const myFunctionControlFalse = () => {
    setCtrlPressed(false);
  };
  const myFunctionControlTrue = () => {
    setCtrlPressed(true);
  };

  const onWheel = e => {
    if (ctrlPressed) {
      if (e.deltaY < 0) myFunctionPlusTrue();
      else myFunctionMinusFalse();
    }
  }

  useEffect(() => {
    const keyDownHandler = (event) => {
      if (event.key === "Control") {
        event.preventDefault();
        myFunctionControlTrue();
      }
      if (ctrlPressed && event.key === "(") {
        event.preventDefault();
        myFunctionPlusTrue();
      }
      if (ctrlPressed && event.key === "'") {
        event.preventDefault();
        myFunctionMinusFalse();
      }
    };
    const keyUphandler = (event) => {
      if (event.key === "Control") {
        event.preventDefault();
        myFunctionControlFalse();
      }
    };
    document.addEventListener("keydown", keyDownHandler);
    document.addEventListener("keyup", keyUphandler);

    return () => {
      document.removeEventListener("keydown", keyDownHandler);
    };
  }, [ctrlPressed, zoomLeftJuxtalign, left]);

  return (
    <div style={{ height: "100vh", overflow: "hidden" }}>
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
      <div
        style={{
          flexDirection: "row",
          display: "flex",
          height: "90%",
          zIndex: 0,
        }}
      >
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div
            className="diva"
            onWheel={onWheel}
            onMouseOver={() => {
              setLeft(true);
            }}
            onClick={() => {
              modifyPLSE();
              setCurrentChuncksId("none");
            }}
            style={{ overflowY: "scroll", width: "100%", resize: "horizontal" }}
          >
            <div
              style={
                isCurrentSentenceAlign
                  ? { padding: 24, background: "#b9f3bd" }
                  : { padding: 24 }
              }
            >
              {blocksSentenceId.map((ids) =>
                sentences[ids].chunks.map((c) => (
                  <div
                    style={{ cursor: 'pointer' }}
                    className="sentencesWrapper"
                    data-isCurrentSentenceAlignAndChunck={isCurrentSentenceAlign}
                    onMouseEnter={() => {
                      if (c.checksum != currentChuncksId) {
                        for (
                          let i = 0;
                          i < plse.blocks[currentBlockid].alignments.length;
                          i++
                        ) {
                          if (
                            c.checksum ===
                            plse.blocks[currentBlockid].alignments[i].md5Chunck
                          ) {


                            setHoverNotSelectedWord(
                              plse.blocks[currentBlockid].alignments[i].words
                            );
                          }
                        }
                      }
                    }}
                    onMouseLeave={() => {
                      setHoverNotSelectedWord([]);
                    }}
                    data-hasBeenDone={plse.blocks[currentBlockid]?.chunckAlign ? plse.blocks[currentBlockid]?.chunckAlign[c.checksum] : false}
                    data-isSelected={currentChuncksId === c.checksum}
                    onClick={(e) => {
                      e.stopPropagation();
                      modifyPLSE();
                      setcurrentSentenceId(ids);
                      setCurrentChuncksId(c.checksum);
                    }}
                  >
                    <div
                      fontSize={zoomLeftJuxtalign}
                      id={c.checksum}
                      data-isSelected={currentChuncksId === c.checksum}
                      className="sentences"
                      style={{ fontSize: zoomLeftJuxtalign }}
                    >
                      {c.gloss}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div
            style={
              !isCurrentSentenceAlign
                ? { justifyContent: "center", display: "flex", cursor: 'pointer', }
                : {
                  background: "#b9f3bd",
                  justifyContent: "center",
                  display: "flex",
                  cursor: 'pointer',
                }
            }
          >
            <AlignedButton
              isCurrentSentenceAlign={isCurrentSentenceAlign}
              onClick={() => {
                setIsCurrentSentenceAlign(!isCurrentSentenceAlign);
                if (!optionDontShowAlignModal) {
                  setIsAlignModalOpen(true);
                }
              }}
            />
          </div>
        </div>
        <div
          className="divb"
          id="wrapper"
          onWheel={onWheel}
          onClick={() => {
            modifyPLSE();
          }}
          onMouseOver={() => {
            setLeft(false);
          }}
          style={{ overflowY: "scroll", flex: 1 }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", margin: 15 }}>
            {XRegExp.match(
              plse.blocks[currentBlockid].tradText,
              mainRegex,
              "all"
            )
              .map((w) => {
                if (
                  XRegExp(
                    "([\\p{Letter}\\p{Number}\\p{Mark}\\u2060]{1,127})"
                  ).test(w)
                ) {
                  return [w, true];
                } else {
                  return [w, false];
                }
              })
              .map((wt, id) =>
                wt[1] ? (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      if (currentChuncksId != "none") {
                        if (idsWord.includes(id)) {
                          if (!currentWords.includes(id)) {
                            setCurrentWords((prev) => {
                              let prev2 = [...prev];
                              prev2.push(id);
                              return prev2;
                            });
                            setIdsWord((prev) => {
                              let prevIdsWord = [...prev];
                              prevIdsWord.splice(prevIdsWord.indexOf(id), 1);
                              return prevIdsWord;
                            });
                          } else {
                          }
                        } else {
                          if (currentWords.includes(id)) {
                            setIdsWord((prev) => {
                              let prev2 = [...prev];
                              prev2.push(id);
                              return prev2;
                            });
                            setCurrentWords((prev) => {
                              let prevIdsWord = [...prev];
                              prevIdsWord.splice(prevIdsWord.indexOf(id), 1);
                              return prevIdsWord;
                            });
                          }
                        }
                      }
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      if (currentChuncksId != "none") {
                        setElemSelected([id, [...currentWords]]);
                      }
                    }}
                    onMouseUp={(e) => {
                      e.stopPropagation();
                      if (currentChuncksId != "none") {
                        setElemSelected("none");
                      }
                    }}
                    onMouseOver={(e) => {
                      e.stopPropagation();
                      if (currentChuncksId != "none") {
                        if (elemSelected != "none") {
                          let p = [...currentWords];
                          let t = [...idsWord];
                          for (let wid = 0; wid < currentWords.length; wid++) {
                            if (
                              elemSelected[1].indexOf(currentWords[wid]) < 0 &&
                              (currentWords[wid] < elemSelected[0] ||
                                currentWords[wid] > id)
                            ) {
                              t.push(currentWords[wid]);

                              p.splice(p.indexOf(currentWords[wid]), 1);
                            }
                          }
                          setIdsWord(t);
                          setCurrentWords(p);

                          for (let i = elemSelected[0]; i <= id; i++) {
                            if (idsWord.includes(i)) {
                              if (!currentWords.includes(i)) {
                                setCurrentWords((prev) => {
                                  let prev2 = [...prev];
                                  prev2.push(i);
                                  return prev2;
                                });
                                setIdsWord((prev) => {
                                  let prevIdsWord = [...prev];
                                  prevIdsWord.splice(prevIdsWord.indexOf(i), 1);
                                  return prevIdsWord;
                                });
                              } else {
                              }
                            }
                          }
                        }
                      }
                    }}

                    className="Word"
                    id="Word"
                    style={{ fontSize: zoomRightJuxtalign, cursor: !currentWords.includes(id) && !idsWord.includes(id) ? 'default' : 'pointer' }}
                    data-selected={currentWords.includes(id)}
                    data-ctrl={ctrlPressed}
                    data-notSelectedBuHover={hoverNotSelectedWord.includes(id)}
                    data-notCLicable={
                      !currentWords.includes(id) && !idsWord.includes(id)
                    }
                  >
                    {wt[0]}
                  </div>
                ) : (
                  <div className="notUsedWord" style={{ fontSize: zoomRightJuxtalign }}>
                    {wt[0]}
                  </div>
                )
              )}
          </div>
        </div>
      </div>
      <div style={{ position: 'fixed', bottom: 60, right: 60 }}>
        {openHelp ? (
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
                  onClick={() => setOpenHelp(false)}
                  className="btn"
                  style={{
                    alignSelf: 'flex-end', marginTop: 16, marginRight: 16, cursor: 'pointer',
                  }}
                >
                  <Close
                    width="24"
                    height="24"
                    alt="closeInformation"
                  />
                </button>
              </div>
              <img src={Help.src} height={307} width={581} alt="align helper" />

            </div>
            <div className="container">
              <Information
                onClick={() => setOpenHelp(false)}
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
              onClick={() => setOpenHelp(true)}
              style={{ position: 'fixed', bottom: 35, right: 35, cursor: 'pointer' }}
              width="40"
              height="40"
              alt="information"
            />
          </div>
        )}
      </div>
      <ModalSureEverythingAlign
        setOptionDontShowAlignModal={setOptionDontShowAlignModal}
        optionDontShowAlignModal={optionDontShowAlignModal}
        isAlignModalOpen={isAlignModalOpen}
        setIsAlignModalOpen={setIsAlignModalOpen}
        shouldOpen={plse.blocks[currentBlockid].chunckAlign}
      />
    </div>
  );
}

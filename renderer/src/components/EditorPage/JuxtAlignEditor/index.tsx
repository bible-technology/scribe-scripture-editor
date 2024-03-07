import React, { useState, useEffect } from 'react';

// import { setupIonicReact } from '@ionic/react'
// import { useTranslation } from 'react-i18next';
import Home from '../JuxtalinearEditor/pages/Home';

/* Core CSS required for Ionic components to work properly */
// import '@ionic/react/css/core.css';

import { Layout } from '../JuxtalinearEditor/components/Layout';
import SentenceContextProvider from '@/components/context/SentenceContext';
// import { ISentence, IChunk } from './types';
import plse from "./plse.json";
import jxt from "./jxtl.json";

const JuxtAlignEditor: React.FC<any> = ({
  // plse,
  // jxt,
}) => {
  const [ctrlPressed, setCtrlPressed] = useState(false);
  const [currentChuncksId, setCurrentChuncksId] = useState(
    jxt.sentences[0].chunks[0].checksum
  );
  const [currentBlockid, setCurrentBlockId] = useState(0);
  const [blocksSentenceId, setBlockSentenceId] = useState(
    plse.blocks[0].sentences
  );
  const [currentSetenceId, setcurrentSentenceId] = useState(
    blocksSentenceId[0]
  );

  const [currentWords, setCurrentWords] = useState([]);
  const [idsWord, setIdsWord] = useState([]);

  const changeBlockId = (num) => {
    if(num >= 0) {
      setCurrentBlockId(num);
    }
  }

  const modifyPLSE = () => {
    if (plse.blocks[currentBlockid].alignments.length > 0) {
      for (let i = 0; i < plse.blocks[currentBlockid].alignments.length; i++) {
        if (
          currentChuncksId ===
          plse.blocks[currentBlockid].alignments[i].md5Chunck
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
    if (currentChuncksId != "") {
      for (let i = 0; i < plse.blocks[currentBlockid].alignments.length; i++) {
        if (
          currentChuncksId ===
          plse.blocks[currentBlockid].alignments[i].md5Chunck
        ) {
          setCurrentWords(plse.blocks[currentBlockid].alignments[i].words);
          return;
        }
      }
    }
    setCurrentWords([]);
  }, [currentChuncksId]);



  useEffect(() => {
    
    let tabl = [];
    for (
      let i = 0;
      i <= plse.blocks[currentBlockid].tradText.split(" ").length;
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
    setBlockSentenceId(plse.blocks[currentBlockid].sentences)
    setCurrentChuncksId(jxt.sentences[plse.blocks[currentBlockid].sentences[0]].chunks[0].checksum)
  }, [currentBlockid]);

  const myFunctionTrue = () => {
    setCtrlPressed(true);
  };
  const myFunctionFalse = () => {
    setCtrlPressed(false);
  };

  useEffect(() => {
    const keyDownHandler = (event) => {
      if (event.key === "Control") {
        event.preventDefault();
        myFunctionTrue();
      }
    };
    const keyUphandler = (event) => {
      if (event.key === "Control") {
        event.preventDefault();
        myFunctionFalse();
      }
    };
    document.addEventListener("keydown", keyDownHandler);
    document.addEventListener("keyup", keyUphandler);

    return () => {
      document.removeEventListener("keydown", keyDownHandler);
    };
  }, []);

  return (
    <div>
      <p>chunks selected : {currentChuncksId}</p>
      <p>sentence selected: {currentSetenceId}</p>
      <div
        onClick={() => {
          modifyPLSE();
          changeBlockId(currentBlockid + 1);
        }}
      >
        chunck suivant {currentBlockid}/{plse.blocks.length - 1}
      </div>
      <div
        onClick={() => {
          modifyPLSE();
          changeBlockId(currentBlockid - 1);
        }}
      >
        chunck precedent {currentBlockid}/{plse.blocks.length - 1}
      </div>
      <div onClick={() => setcurrentSentenceId((prev) => prev + 1)}>
        phrase suivant {currentSetenceId}/{jxt.sentences.length - 1}
      </div>

      <div style={{ display: "flex" }}>
        words id selected [
        {currentWords.map((i) => (
          <div> {i},</div>
        ))}
        ]
      </div>
      <div style={{ display: "flex" }}>
        all words id [
        {idsWord.map((i) => (
          <div> {i},</div>
        ))}
        ]
      </div>
      <div style={{ flexDirection: "row", display: "flex" }}>
        <div className="diva">
          {blocksSentenceId.map((ids) =>
            jxt.sentences[ids].chunks.map((c) => (
              <div
                className="sentencesWrapper"
                data-isSelected={currentChuncksId === c.checksum}
              >
                <div
                  id={c.checksum}
                  data-isSelected={currentChuncksId === c.checksum}
                  className="sentences"
                  onClick={() => {
                    modifyPLSE();
                    setcurrentSentenceId(ids);
                    setCurrentChuncksId(c.checksum);
                  }}
                >
                  {c.gloss}
                </div>
              </div>
            ))
          )}
        </div>
        <div className="divb" id="wrapper">
          <div style={{ display: "flex", flexWrap: "wrap", margin: 15 }}>
            {plse.blocks[currentBlockid].tradText.split(" ").map((w, id) => (
              <div
                onClick={() => {
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
                }}
                onMouseOver={() => {
                  if (ctrlPressed) {
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
                className="Word"
                id="Word"
                data-selected={currentWords.includes(id)}
                data-ctrl={ctrlPressed}
                // data-notCLicable={!currentWords.includes(id) && !idsWord.includes(id)}
              >
                {w}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JuxtAlignEditor;

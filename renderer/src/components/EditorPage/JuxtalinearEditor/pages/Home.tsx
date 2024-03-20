import React, { useContext, useCallback, useEffect, useRef, useState } from 'react';
import {
  DragDropContext,
  StrictModeDroppable,
  Draggable,
  DropResult,
  DraggableLocation,
} from '../components/Droppable';
import { Box, Button, Grid, Stack } from '@mui/material';
import { IoCaretUp, IoCaretDown } from 'react-icons/io5';
import { saveToFile } from '../../JuxtaTextEditor/hooks/saveToFile';

// import SentenceContext from '@/components/context/SentenceContext';
// import { ISentenceContext,ISource, ISentence } from '../types.d.ts';
import { MarkdownInput } from '../components/MarkdownInput';
// import { SentenceContext } from '../index';
import { SentenceContext } from '@/components/context/SentenceContext';
import { ReferenceContext } from '@/components/context/ReferenceContext';
import { useReadJuxtaFile } from '../../JuxtaTextEditor/hooks/useReadJuxtaFile';
import md5 from 'md5';
import { normalizeString } from '@/components/Projects/utils/updateJsonJuxta.js';
// import { readUsfm } from '../utils/readUsfm';

const grid = 3;

const getItemStyle = (isDragging: boolean, draggableStyle: any) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',
  padding: grid * 2,
  margin: `0 ${grid}px 0 0`,

  // change background colour if dragging
  background: isDragging ? 'lightgreen' : 'lightgrey',

  // styles we need to apply on draggables
  ...draggableStyle,
});

const getListStyle = (isDraggingOver: boolean) => ({
  background: isDraggingOver ? 'lightblue' : 'lightgrey',
  display: 'flex',
  padding: grid,
  overflow: 'auto',
});

const Home: React.FC = () => {
  const {
    sentences,
    originText,
    itemArrays,
    curIndex,
    fileName,
    jsonFileContent,
    setFileName,
    setGlobalTotalSentences,
    setItemArrays,
    setOriginText,
    setCurIndex,
    setGlobalSentences,
    setGlobalItemArrays,
    setJsonFileContent,
    getItems,
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
      fontSize,
      selectedFont,
      languageId,
      folderPath,
      refName,
      //  closeNavigation,
    }, actions: {
      onChangeBook,
      onChangeChapter,
      onChangeVerse,
    },
  } = useContext(ReferenceContext);

  const clickRef = useRef(0);
  // const usfmOpenRef = useRef<HTMLInputElement>(null);
  // const jsonOpenRef = useRef<HTMLInputElement>(null);
  const [editStates, setEditStates] = useState<boolean[]>(new Array(1).fill(false));

  // const [mode, setMode] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  useEffect(() => {
    if (sentences.length && sentences[curIndex]) {
      setEditStates(new Array(sentences[curIndex].chunks.length).fill(false));
    }
  }, [setCurIndex, curIndex]);

  useEffect(() => {
    if (sentences.length) {
      setGlobalItemArrays(curIndex, getItems())
    }
  }, [sentences, curIndex]);

  const handleTabPress = useCallback(() => {
    if (itemArrays[curIndex]) {
      const contTrue = editStates.indexOf(true);
      if (contTrue != -1) {
        setEditState(contTrue, false);
        setEditState((contTrue + 1) % editStates.length, true);
      } else {
        setEditState(0, true);
      }
    }
  }, [itemArrays, curIndex, editStates]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        event.preventDefault();
        handleTabPress();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleTabPress]);

  const setEditState = (index: number, value: boolean) => {
    const newStates = [...editStates];
    setEditStates(newStates.map((state, i) => (i === index ? value : false)));
    return editStates[index];
  };

  const remakeSentence = (stc: ISentence) => {
    let checksumChuncks = '';
    let currentCs = '';
    const counts: { [key: string]: any } = {};
    const chunks = stc.chunks.filter(({ source }) => source[0]).map((chunk) => {
      const source = chunk.source.map((src) => {
        if (!counts[src.content]) {
          counts[src.content] = 0;
        } else {
          counts[src.content] += 1;
        }
        return { ...src, index: counts[src.content] };
      });
      currentCs = md5(normalizeString(JSON.stringify(source) + chunk.gloss)) as string;
      checksumChuncks += currentCs;
      return {
        source,
        gloss: chunk.gloss,
        checksum: currentCs,
      };
    });
    return {
      originalSource: stc.originalSource,
      chunks,
      sourceString: stc.sourceString,
      checksum: md5(checksumChuncks),
    };
  }

  useEffect(() => {
    if (sentences[0] !== undefined && jsonFileContent) {
      sentences[0].chunks.filter(({ source }) => source[0]).forEach((chunck) => {
        chunck.source.filter(e => e);
      });
      jsonFileContent.sentences = sentences;
      const jsonStr = JSON.stringify(jsonFileContent);
      saveToFile(jsonStr, bookId);
    }
  }, [setGlobalItemArrays]);

  const reorder = (list: Array<any>, startIndex: number, endIndex: number) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  }

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    // dropped outside the list
    if (!destination) {
      return;
    }

    const sInd = +source.droppableId;
    const dInd = +destination.droppableId;

    if (sInd === dInd) {
      const newSource = reorder(
        sentences[curIndex].chunks[sInd].source,
        source.index,
        destination.index,
      );

      const newChunks = [...sentences[curIndex].chunks];
      newChunks[sInd].source = newSource;

      const newSentence = remakeSentence({
        originalSource: sentences[curIndex].originalSource,
        chunks: newChunks,
        sourceString: sentences[curIndex].sourceString,
        checksum: '',
      });
      setGlobalSentences(curIndex, newSentence);
      setEditStates(new Array(newChunks.length).fill(false));
    } else {

      const sentenceRes = move(
        sentences[curIndex].chunks[sInd].source,
        sentences[curIndex].chunks[dInd].source,
        source,
        destination,
      );

      const newChunks = [...sentences[curIndex].chunks];
      newChunks[sInd].source = sentenceRes[sInd];
      newChunks[dInd].source = sentenceRes[dInd];

      const newSentence = remakeSentence({
        originalSource: sentences[curIndex].originalSource,
        chunks: newChunks,
        sourceString: sentences[curIndex].sourceString,
        checksum: '',
      });
      setGlobalSentences(curIndex, newSentence);
      setEditStates(new Array(newChunks.length).fill(false));
    }
  }

  const handleDoubleClick = (item: any, rowN: number, colN: number) => {
    clickRef.current += 1;

    if (clickRef.current === 1) {
      setTimeout(() => {
        if (clickRef.current === 2) {
          // Double click logic
          let newChunks = [...sentences[curIndex].chunks];
          if (
            colN === itemArrays[curIndex][rowN].chunk.length ||
            (colN === 0 && rowN === 0)
          ) {
            // first col in first row
            return;
          }
          if (colN === 0) {
            // merge with previous row
            newChunks[rowN - 1].source = [
              ...newChunks[rowN - 1].source,
              ...newChunks[rowN].source,
            ];
            // newChunks[rowN - 1].gloss = '';
            newChunks[rowN].source = [];
            newChunks[rowN].gloss = '';
            newChunks[rowN].checksum = '';
            newChunks = newChunks.filter((c) => c.source.length);
          } else {
            // Make new row
            newChunks = [
              ...newChunks.slice(0, rowN),
              { source: newChunks[rowN].source.slice(0, colN), gloss: '', checksum: '' },
              { source: newChunks[rowN].source.slice(colN), gloss: newChunks[rowN].gloss, checksum: '' },
              ...newChunks.slice(rowN + 1),
            ];
          }

          const newSentence = remakeSentence({
            originalSource: sentences[curIndex].originalSource,
            chunks: newChunks,
            sourceString: sentences[curIndex].sourceString,
            checksum: '',
          });
          setGlobalSentences(curIndex, newSentence);
          setEditStates(new Array(newChunks.length).fill(false));
        }

        clickRef.current = 0;
      }, 300);
    }
  }

  /**
   * Moves an item from one chunk to another chunk.
   */
  const move = (
    source: Iterable<unknown> | ArrayLike<unknown>,
    destination: Iterable<unknown> | ArrayLike<unknown>,
    droppableSource: DraggableLocation,
    droppableDestination: DraggableLocation
  ) => {
    const sourceClone = Array.from(source);
    const destClone = Array.from(destination);
    const [removed] = sourceClone.splice(droppableSource.index, 1);

    destClone.splice(droppableDestination.index, 0, removed);

    const result: { [key: string]: any } = {};
    result[droppableSource.droppableId] = sourceClone;
    result[droppableDestination.droppableId] = destClone;

    return result;
  }

  const chunkUpHandler = (n: number) => {
    const newChunks = [...sentences[curIndex].chunks];
    ;[newChunks[n - 1], newChunks[n]] = [newChunks[n], newChunks[n - 1]];

    const newSentence = remakeSentence({
      originalSource: sentences[curIndex].originalSource,
      chunks: newChunks,
      sourceString: sentences[curIndex].sourceString,
      checksum: '',
    });
    setGlobalSentences(curIndex, newSentence);
    setEditStates(new Array(newChunks.length).fill(false));
  }

  const chunkDownHandler = (n: number) => {
    const newChunks = [...sentences[curIndex].chunks];
    ;[newChunks[n], newChunks[n + 1]] = [newChunks[n + 1], newChunks[n]];

    const newSentence = remakeSentence({
      originalSource: sentences[curIndex].originalSource,
      chunks: newChunks,
      sourceString: sentences[curIndex].sourceString,
      checksum: '',
    });
    setGlobalSentences(curIndex, newSentence);
    setEditStates(new Array(newChunks.length).fill(false));
  }

  const glossChangeHandler = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    n: number
  ) => {
    const newItemArrays = [...itemArrays[curIndex]];
    newItemArrays[n].gloss = e.target.value;
    const newChunks = [...sentences[curIndex].chunks];
    newChunks[n].gloss = e.target.value;
    setGlobalItemArrays(curIndex, newItemArrays)
    setGlobalSentences(curIndex, remakeSentence({
      originalSource: sentences[curIndex].originalSource,
      chunks: newChunks,
      sourceString: sentences[curIndex].sourceString,
      checksum: '',
    }));
  }

  return (
    <div>
      <Grid container>
        <Grid item sm={12} p={2} pl={0} width="100%">
          <DragDropContext onDragEnd={onDragEnd}>
            {itemArrays[curIndex]?.map((items, n) => (
              <Grid container key={n} className="chunk-row">
                <Grid item sm={true} px={2} py={1}>
                  <Stack flexDirection="row">
                    <Stack
                      height={36}
                      justifyContent="center"
                    >
                      <Button
                        sx={{ minWidth: '30px', height: '14px' }}
                        onClick={() => chunkUpHandler(n)}
                        disabled={!n}
                      >
                        <IoCaretUp />
                      </Button>
                      <Button
                        sx={{ minWidth: '30px', height: '14px' }}
                        onClick={() => chunkDownHandler(n)}
                        disabled={n === itemArrays[curIndex].length - 1}
                      >
                        <IoCaretDown />
                      </Button>
                    </Stack>
                    <StrictModeDroppable
                      droppableId={`${n}`}
                      direction="horizontal"
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          style={getListStyle(snapshot.isDraggingOver)}
                          {...provided.droppableProps}
                        >
                          {items.chunk.map((item, index) => (
                            <Draggable
                              key={item.id}
                              draggableId={item.id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  className="draggable"
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={getItemStyle(
                                    snapshot.isDragging,
                                    provided.draggableProps.style
                                  )}
                                  onClick={() =>
                                    handleDoubleClick(item, n, index)
                                  }
                                >
                                  <Stack flexDirection={'row'} gap={'6px'}>
                                    <Box>{item.content}</Box>
                                    {item.index ? (
                                      <Box sx={{ fontSize: '10px' }}>
                                        {item.index + 1}
                                      </Box>
                                    ) : (
                                      <></>
                                    )}
                                  </Stack>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </StrictModeDroppable>
                  </Stack>
                </Grid>
                <Grid item sx={{ height: '50px' }} sm={true} px={2} py={1}>
                  <MarkdownInput
                    value={items.gloss}
                    onChange={(e) => glossChangeHandler(e, n)}
                    isEditing={editStates[n]}
                    setIsEditing={(value) => setEditState(n, value)}
                    fontSize={fontSize}
                    selectedFont={selectedFont}
                  />
                </Grid>
              </Grid>
            ))}
          </DragDropContext>
        </Grid>
      </Grid>
    </div>
  )
}

export default Home

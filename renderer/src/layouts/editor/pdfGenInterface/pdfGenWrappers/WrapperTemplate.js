import { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import i18n from '../../../../translations/i18n';
import { AccordionPicker } from './SectionAccordion';
import Trash from '../../../../../public/icons/trash.svg';
import { OBSWrapperSortableList } from './HeaderWrapper/OBSHeaderWrapper';
import { BCVWrapperSortableList } from './HeaderWrapper/BCVHeaderWrapper';

const fixPath = (source) => {
  const isWindows = process.platform === 'win32';
  if (isWindows) {
    // Convert to Windows style paths
    return source.replace(/\//g, '\\');
  }
  // Convert to Unix style paths
  return source.replace(/\\/g, '/');
};

function firstElem(projectInfo) {
  const obj = {
    0: {
      id: uuidv4(),
      type: projectInfo.type === 'Juxtalinear' ? 'jxlSimple' : 'null',
      source: projectInfo.path === undefined ? 'null' : fixPath(projectInfo.path),
      content: {},
    },
  };
  return JSON.stringify(obj);
}

export function WrapperTemplate({
  doReset,
  setFinalPrint,
  projectInfo,
  wrapperType,
  keyWrapper,
  setUpdate,
  advanceMode,
  changePrintData,
  changePrintOrder,
  showTrashButton,
}) {
  const [orderSections, setOrderSelections] = useState([0]);
  const updateElemOrder = (items) => {
    const t = [];
    items.forEach((item) => {
      t.push(parseInt(item.id, 10));
    });
    setOrderSelections(t);
  };
  const [sections, setSections] = useState(
    firstElem(projectInfo),
  );
  // choice is the possible section by wrapper

  const getSectionType = (key) => {
    let ret;
    if (sections) {
      try {
        const parseSection = JSON.parse(sections);
        if (parseSection[key]) {
          ret = parseSection[key].type;
        } else {
          ret = 'null';
        }
      } catch {
        ret = 'null';
      }
    } else {
      ret = 'null';
    }
    return ret;
  };

  useEffect(() => {
    const fePI = firstElem(projectInfo);
    setSections(fePI);
  }, [projectInfo]);

  const [loopMode, setLoopMode] = useState(false);

  const sortableListClassName = `sortable-${keyWrapper}-list`;
  const itemClassName = `sortable-${keyWrapper}-item`;

  // update Order selection
  useEffect(() => {
    setFinalPrint((prev) => {
      const t = { ...prev };
      t[keyWrapper].content.order = orderSections;
      return t;
    });
  }, [orderSections]);

  // update final print Json
  useEffect(() => {
    setFinalPrint((prev) => {
      const t = { ...prev };
      if (!t[keyWrapper]) {
        t[keyWrapper] = { content: {} };
      }
      if (!t[keyWrapper].content) {
        t[keyWrapper].content = {};
      }

      // Clear the existing content
      t[keyWrapper].content.content = {};

      // Update with new sections
      try {
        t[keyWrapper].content.content = JSON.parse(sections);
      // eslint-disable-next-line
      } catch {}

      return t;
    });
  }, [sections]);
  // Sortable list logic
  useEffect(() => {
    const sortableList = document.querySelector(
      `.${sortableListClassName}`,
    );
    const items = sortableList.querySelectorAll(`.${itemClassName}`);
    items.forEach((item) => {
      item.addEventListener('dragstart', () => {
        setTimeout(() => item.classList.add('dragging'), 0);
      });
      item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
      });
    });

    const initSortableList = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const draggingItem = document.querySelector(
        `.${itemClassName}.dragging`,
      );
      if (!draggingItem) {
        return;
      }
      const siblings = [
        ...sortableList.querySelectorAll(
          `.${itemClassName}:not(.dragging)`,
        ),
      ];
      const nextSibling = siblings.find((sibling) => e.clientY <= sibling.offsetTop + sibling.offsetHeight);
      sortableList.insertBefore(draggingItem, nextSibling);
    };

    sortableList.addEventListener('dragend', () => updateElemOrder(sortableList.querySelectorAll(`.${itemClassName}`)));
    sortableList.addEventListener('dragover', initSortableList);
    sortableList.addEventListener('dragenter', (e) => e.preventDefault());

    return () => {
      sortableList.removeEventListener('dragover', initSortableList);
      items.forEach((item) => {
        item.removeEventListener('dragstart', () => {
          setTimeout(() => item.classList.add('dragging'), 0);
        });
        item.removeEventListener('dragend', () => {
          item.classList.remove('dragging');
          updateElemOrder();
        });
      });
    };
  }, [sections]);

  return (
    <div
      style={{
        width: '100%',
        borderStyle: 'solid',
        borderColor: '#EEEEEE',
        borderWidth: 1,
        backgroundColor: '#FCFAFA',
        padding: 15,
        borderRadius: 10,
      }}
    >
      {wrapperType === 'bcvWrapper' ? (
        <BCVWrapperSortableList
          keyWrapper={keyWrapper}
          advanceMode={advanceMode}
          changePrintData={changePrintData}
          setLoopMode={setLoopMode}
          loopMode={loopMode}
        />
      ) : (
        <div />
      )}
      {wrapperType === 'obsWrapper' ? (
        <OBSWrapperSortableList
          keyWrapper={keyWrapper}
          advanceMode={advanceMode}
          changePrintData={changePrintData}
          setLoopMode={setLoopMode}
          loopMode={loopMode}
        />
      ) : (
        <div />
      )}
      {wrapperType === 'jxlWrapper' ? (
        <BCVWrapperSortableList
          keyWrapper={keyWrapper}
          advanceMode={advanceMode}
          changePrintData={changePrintData}
          setLoopMode={setLoopMode}
          loopMode={loopMode}
        />
      ) : (
        <div />
      )}
      <div
        style={
          loopMode
            ? {
              backgroundColor: '#FFEEE5',
            }
            : {
              backgroundColor: '#EEEEEE',
            }
        }
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'end',
          }}
        >
          <div style={{ display: 'flex' }}>
            {advanceMode && showTrashButton && (
              <Button
                style={{
                  borderStyle: 'solid',
                  color: 'white',
                }}
                onClick={() => {
                  changePrintOrder((prev) => {
                    const t = [...prev];
                    t.splice(
                      t.indexOf(parseInt(keyWrapper, 10)),
                      1,
                    );
                    return t;
                  });

                  changePrintData((prev) => {
                    const updatedSelected = JSON.parse(
                      JSON.stringify(prev),
                    );
                    // Remove the last key in the map as it's not required
                    delete updatedSelected[
                      parseInt(keyWrapper, 10)
                    ];
                    return updatedSelected;
                  });
                }}
              >
                <Trash
                  color="black"
                  style={{ height: 35, width: 35 }}
                />
              </Button>
            )}
          </div>
        </div>

        <ul className={sortableListClassName}>
          {/* eslint-disable-next-line */}
          {Object.keys(JSON.parse(sections)).map((k, index) => (
            <li
              id={index}
              className={itemClassName}
              draggable="true"
              // eslint-disable-next-line
              key={`${k }_${ index}`}
              onDragStart={() => setUpdate(false)}
              onDragEnd={() => setUpdate(true)}
              style={{ padding: 5 }}
            >
              <div
                style={{
                  flexDirection: 'row',
                  display: 'flex',
                }}
              >
                <AccordionPicker
                  doReset={doReset}
                  language={i18n.language}
                  wrapperType={wrapperType}
                  projectInfo={projectInfo}
                  advanceMode={advanceMode}
                  setSelected={setSections}
                  setOrderSelections={setOrderSelections}
                  keySpecification={getSectionType(k)}
                  idjson={k}
                  removeButton={
                    advanceMode && Object.keys(JSON.parse(sections)).length > 1 ? (
                      <Button
                        onClick={() => {
                          setOrderSelections(
                            (prev) => {
                              const t = [...prev];
                              t.splice(t.indexOf(index), 1);
                              for (let i = 0; i < t.length; i++) {
                                if (t[i] > index) {
                                  t[i] -= 1;
                                }
                              }
                              return t;
                            },
                          );
                          setSections((prev) => {
                            const updatedSelected = {
                              ...JSON.parse(
                                prev,
                              ),
                            };
                            const up = {};

                            Object.keys(updatedSelected).forEach((key) => {
                              if (parseInt(key, 10) > index) {
                                const newIndex = parseInt(key, 10) - 1;
                                up[newIndex] = updatedSelected[key];
                              } else if (parseInt(key, 10) < index) {
                                up[key] = updatedSelected[key];
                              }
                            });

                            return JSON.stringify(
                              up,
                            );
                          });
                        }}
                      >
                        <Trash
                          color="black"
                          style={{
                            fill: 'black',
                            height: 35,
                            width: 35,
                          }}
                        />
                      </Button>
                    ) : (
                      <div />
                    )
                  }
                />
              </div>
            </li>
          ))}
        </ul>

        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            paddingLeft: 22,
            paddingRight: 22,
            paddingTop: 10,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {advanceMode && loopMode ? (
            <Button
              style={{
                borderRadius: 4,
                backgroundColor: '#F50',
                borderStyle: 'solid',
                borderColor: '#F50',
                color: 'white',
              }}
              onClick={() => {
                setOrderSelections((prev) => [
                  ...prev,
                  prev.length,
                ]);
                setSections((prev) => {
                  // eslint-disable-next-line
                  let prevParsed = JSON.parse(prev);
                  const len = Object.keys(prevParsed).length;
                  prevParsed[len] = {
                    id: uuidv4(),
                    type: 'null',
                    content: {},
                  };
                  return JSON.stringify(prevParsed);
                });
              }}
            >
              Add
            </Button>
          ) : (
            <div
              style={{
                padding: 17,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

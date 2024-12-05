import { useState, useEffect, useContext } from 'react';
import localForage from 'localforage';
import readLocalResources from '@/components/Resources/useReadLocalResources';
import 'react-pdf/dist/Page/TextLayer.css';
import { Modal, Button, Input } from '@mui/material';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { v4 as uuidv4 } from 'uuid';
import { ProjectContext } from '@/components/context/ProjectContext';
import { AutographaContext } from '@/components/context/AutographaContext';
import { useTranslation } from 'react-i18next';
import { generate } from 'random-words';
import {
  TextOnlyTooltip,
  StyledSwitch,
} from './pdfGenInterface/pdfGenWrappers/fieldPicker/customMuiComponent';
import { WrapperTemplate } from './pdfGenInterface/pdfGenWrappers/WrapperTemplate';
import ExpandMore from '../../../../public/icons/expand_more.svg';
import { SelectOption } from './SelectOptions';
import packageInfo from '../../../../package.json';
import * as logger from '../../logger';

export function findProjectInfo(meta, autoGrapha) {
  return autoGrapha?.filter((a) => `${a.name}_${a.id}` === meta)[0];
}

const fixPath = (source) => {
  const isWindows = process.platform === 'win32';
  if (isWindows) {
    // Convert to Windows style paths
    return source.replace(/\//g, '\\');
  }
  // Convert to Unix style paths
  return source.replace(/\\/g, '/');
};

function changeMetaDataToWrapperSection(meta, autoGrapha) {
  const projInfo = findProjectInfo(meta, autoGrapha);
  if (projInfo.type === 'Text Translation') {
    return {
      0: {
        type: 'bcvWrapper',
        id: uuidv4(),
        content: {
          content: { 0: { type: 'null', content: {} } },
          order: [0],
        },
      },
    };
  } if (projInfo.type === 'OBS') {
    return {
      0: {
        type: 'obsWrapper',
        id: uuidv4(),
        content: {
          content: { 0: { type: 'null', content: {} } },
          order: [0],
        },
      },
    };
  } if (projInfo.type === 'Juxtalinear') {
    return {
      0: {
        type: 'bcvWrapper',
        id: uuidv4(),
        content: {
          content: { 0: { type: 'null', content: {} } },
          order: [0],
        },
      },
    };
  }
}

function messageToPeople(json) {
  let message = '';
  for (let i = 0; i < json.level; i++) {
    message += '\t';
  }
  if (json.type === 'step') {
    message += `Starting step ${json.args[0]}`;
  } else if (json.type === 'section') {
    message += `Starting to prepare ${json.args[0]}`;
  } else if (json.type === 'wrappedSection') {
    message += `Preparing section of type ${json.args[0]} from ${json.args[1].split('-')[0]}`;
    if (json.args[1].split('-')[1]) {
      message += ` to ${json.args[1].split('-')[1]}`;
    }
  } else if (json.type === 'pdf') {
    message += `Writing pdf of ${json.args[1]}`;
  } else {
    findProjectInfo();
    message += json.msg;
  }
  return message;
}

function createSection(folder, pickerJson) {
  const path = require('path');
  const fs = window.require('fs');
  const fixedPath = fixPath(folder);

  let projects;
  try {
    if (!fs.existsSync(fixedPath)) {
      fs.mkdirSync(fixedPath);
    }
    projects = fs.readdirSync(fixedPath);
  } catch (err) {
    logger.error('InnerFramePopup.js', `Error reading project dir: ${err}`);
  }

  let currentMetadataPath = '';
  // eslint-disable-next-line
  for (const project of projects) {
    currentMetadataPath = fixPath(path.join(fixedPath, project, 'metadata.json'));
    if (fs.existsSync(currentMetadataPath)) {
      const jsontest = fs.readFileSync(currentMetadataPath, 'utf-8');
      const jsonParse = JSON.parse(jsontest);
      // let projectS, jsonParseIngre;

      // if (jsonParse.identification?.name.en) {
      //   jsonParseIngre = jsonParse.ingredients;
      //   projectS = `[${ jsonParse.identification.name.en }]`;
      // } else {
      //   jsonParseIngre = jsonParse.meta.ingredients;
      //   projectS = `[${ jsonParse.meta.full_name }]`;
      // }

      let fileName;
      if (jsonParse?.type?.flavorType?.flavor?.name === 'textTranslation') {
        if (jsonParse.resourceMeta) {
          pickerJson.book[jsonParse.resourceMeta?.full_name] = {
            description: `${jsonParse.resourceMeta?.full_name}`,
            language: `${jsonParse.resourceMeta?.language}`,
            src: {
              type: 'fs',
              path: fixedPath.includes('projects')
                ? path.join(`${fixedPath}`, `${project}`, 'ingredients')
                : path.join(`${fixedPath}`, `${project}`),
            },
            books: [],
          };
        } else if (jsonParse.identification) {
          pickerJson.book[jsonParse.identification.name[jsonParse.languages[0].tag]] = {
            description: `${jsonParse.identification.name[jsonParse.languages[0].tag]}`,
            language: `${jsonParse.languages[0].tag}`,
            src: {
              type: 'fs',
              path: fixedPath.includes('projects')
                ? path.join(`${fixedPath}`, `${project}`, 'ingredients')
                : path.join(`${fixedPath}`, `${project}`),
            },
            books: [],
          };
        }
      } else if (jsonParse?.type?.flavorType?.flavor?.name === 'textStories') {
        fileName = 'content';
        pickerJson.OBS[`OBS ${jsonParse.resourceMeta?.full_name}`] = {
          description: `OBS ${jsonParse.resourceMeta?.full_name}`,
          language: jsonParse.meta.defaultLocale,
          src: {
            type: 'fs',
            path: fixedPath.includes('projects')
              ? path.join(`${fixedPath}`, `${project}`, 'ingredients')
              : path.join(`${fixedPath}`, `${project}`, `${fileName}`),
          },
          books: [],
        };
      } else if (jsonParse?.meta?.repo?.flavor_type === 'parascriptural') {
        fileName = 'content';
        pickerJson.tNotes[`tNotes ${jsonParse.meta.repo.full_name}`] = {
          description: `tNotes ${jsonParse.meta.repo.full_name}`,
          language: jsonParse.meta.defaultLocale,
          src: {
            type: 'fs',
            path: fixedPath.includes('projects')
              ? path.join(`${fixedPath}`, `${project}`, 'ingredients')
              : path.join(`${fixedPath}`, `${project}`),
          },
          books: [],
        };
      } else if (jsonParse?.type?.flavorType?.flavor?.name === 'x-juxtalinear') {
        fileName = 'content';
        pickerJson.jxl[Object.values(jsonParse.identification.name)[0]] = {
          description: `${Object.values(jsonParse.identification.name)[0]}`,
          language: jsonParse.languages[0] ? jsonParse.languages[0].name.en : 'French',
          src: {
            type: 'fs',
            path: fixedPath.includes('projects')
              ? path.join(`${fixedPath}`, `${project}`, 'ingredients')
              : path.join(`${fixedPath}`, `${project}`),
          },
          books: jsonParse.type.flavorType.currentScope ? Object.keys(jsonParse.type.flavorType.currentScope) : [],
        };
      }
    }
  }
}

function transformPrintDataToKitchenFaucet(jsonData) {
  // console.log("jsonData ==", jsonData)
  const kitchenFaucet = [];
  if (jsonData.content) {
    for (let i = 0; i < jsonData.order.length; i++) {
      const currentWrapper = jsonData.content[jsonData.order[i]];

      const elem = { ...currentWrapper };
      if (!elem.ranges) {
        if (elem.type === 'obsWrapper') {
          elem.ranges = ['1-50'];
        }
      }
      delete elem.content;
      elem.sections = [];
      if (currentWrapper.content.order) {
        for (let j = 0; j < currentWrapper.content.order.length; j++) {
          const section = {
            ...currentWrapper.content.content[
              currentWrapper.content.order[j]
            ],
          };
          const source = section.source;
          delete section.source;
          if (section.type === 'bookNote') {
            section.notes = source;
          } else if (
            section.type === 'bcvBible'
            || section.type === 'paraBible'
          ) {
            section.content.scriptureSrc = source;
          } else if (section.type === 'obs') {
            section.content.obs = source;
          }

          elem.sections.push(section);
        }
      }

      kitchenFaucet.push(elem);
    }
  }
  return { global: jsonData.metaData, sections: kitchenFaucet };
}

export default function InnerFramePopup() {
  const {
    states: { listResourcesForPdf },
    actions: { setListResourcesForPdf },
  } = useContext(ProjectContext);

  const init = { bcvWrapper: ['bcvBible'], obsWrapper: ['obs'] };
  const initNames = { bcvWrapper: 'Book/Chapter/Verse', obsWrapper: 'OBS' };

  const jsonWithHeaderChoice = global.PdfGenStatic.pageInfo();
  // use to know if we can drag or not
  const [update, setUpdate] = useState(true);
  const [doReset, setDoReset] = useState(true);
  // the order Of The Selected choice
  const [orderSelection, setOrderSelection] = useState([0]);
  // is the json is validate or not
  const [isJsonValidate, setIsJsonValidate] = useState(true);
  const [jsonValidation, setJsonValidation] = useState({});
  const [messagePrint, setMessagePrint] = useState('');
  // the actual kitchenFaucet
  const pdfCallBacks = (json) => {
    setMessagePrint((prev) => `${prev}\n${messageToPeople(json)}`);
  };
  const {
    states: { selectedProject },
  } = useContext(ProjectContext);

  const {
    states: { projects },
  } = useContext(AutographaContext);
  const [selected, setSelected] = useState(
    changeMetaDataToWrapperSection(selectedProject, projects),
  );

  const { t } = useTranslation();

  // advenceMode allow adding new Wrapper
  const [advanceMode, setAdvanceMode] = useState(false);
  const [infoProject, setInfoProject] = useState(
    findProjectInfo(selectedProject, projects),
  );

  // the selected headerInfo
  const [headerInfo, setHeaderInfo] = useState('{"sizes":"9on11","fonts":"allGentium","pages":"EXECUTIVE", "verbose":"false"}');
  // const [headerInfo, setHeaderInfo] = useState('{}');
  const [nameFile, setNameFile] = useState('');
  const [folder, setFolder] = useState(null);
  // zoom of the preview
  const [kitchenFaucet, setKitchenFaucet] = useState('{}');
  const [openModalAddWrapper, setOpenModalAddWrapper] = useState(false);

  const handleOpenModalAddWrapper = (isOpen) => {
    setOpenModalAddWrapper(isOpen);
  };
  const handleChangeHeaderInfo = (type, value) => {
    const data = JSON.parse(headerInfo);
    data[type] = value;
    setHeaderInfo(JSON.stringify(data));
  };

  const sortableListClassName = 'sortable-TESTWRAPPER-list';
  const itemClassName = 'sortable-test1-item';

  // This useEffect Allow the user to drag end drop element in a list (here the wrapper themSelf)
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
      if (update) {
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

        const nextSibling = siblings.find((sibling) => (
          e.clientY <= sibling.offsetTop + sibling.offsetHeight
        ));

        sortableList.insertBefore(draggingItem, nextSibling);
      }
    };

    sortableList.addEventListener('dragover', initSortableList);
    sortableList.addEventListener('dragenter', (e) => e.preventDefault());
    return () => {
      sortableList.removeEventListener('dragover', initSortableList);
      items.forEach((item) => {
        item.removeEventListener('dragstart', () => {
          setTimeout(() => item.classList.add('dragging'), 0);
        });
      });
    };
  }, [update]);
  useEffect(() => {
    const pickerJson = Object.keys(listResourcesForPdf).reduce(
      (a, v) => ({ ...a, [v]: {} }),
      {},
    );
    localForage
      .getItem('userProfile')
      .then(async (user) => {
        const path = require('path');
        const newpath = localStorage.getItem('userPath');
        const currentUser = user?.username;
        const folderProject = path.join(
          newpath,
          packageInfo.name,
          'users',
          `${currentUser}`,
          'projects',
        );
        setInfoProject((prev) => {
          const p = { ...prev };
          p.path = path.join(
            newpath,
            packageInfo.name,
            'users',
            `${currentUser}`,
            'projects',
            `${p.name}_${p.id[0]}`,
            'ingredients',
          );
          return p;
        });
        const folderRessources = path.join(
          newpath,
          packageInfo.name,
          'users',
          `${currentUser}`,
          'resources',
        );
        createSection(folderProject, pickerJson);
        createSection(folderRessources, pickerJson);
        return currentUser;
      })
      .then((currentUser) => {
        setListResourcesForPdf(pickerJson);
        return currentUser;
      })
      .then((currentUser) => readLocalResources(currentUser, () => { }));
  }, []);

  useEffect(() => {
    setKitchenFaucet(
      JSON.stringify(
        transformPrintDataToKitchenFaucet({
          order: orderSelection,
          metaData: JSON.parse(headerInfo),
          content: selected,
        }),
      ),
    );
  }, [selected, headerInfo, orderSelection]);

  useEffect(() => {
    const validationJson = global.PdfGenStatic.validateConfig(JSON.parse(kitchenFaucet));
    setJsonValidation(validationJson);
    if (validationJson.length === 0) {
      const header = JSON.parse(headerInfo);
      if (
        header.workingDir
        && folder
        && header.sizes
        && header.fonts
        && header.pages
      ) {
        if (!header.outputPath && folder) {
          const path = window.require('path');
          setHeaderInfo((prev) => {
            const data = { ...JSON.parse(prev) };
            data.outputPath = path.join(`${folder}`, `${generate({ exactly: 5, wordsPerString: 1 }).join('-')}.pdf`);
            data.verbose = false;
            return JSON.stringify(data);
          });
        }
        setIsJsonValidate(true);
      }
    } else {
      setIsJsonValidate(true);
    }
  }, [selected, headerInfo, orderSelection, folder, kitchenFaucet]);

  const openFileDialogSettingData = async () => {
    try {
      const options = {
        properties: ['openDirectory'],
      };
      const { dialog } = window.require('@electron/remote');
      const chosenFolder = await dialog.showOpenDialog(options);
      if (chosenFolder.canceled) {
        // Handle dialog cancel case
        // eslint-disable-next-line
        console.error('Dialog was canceled');
        return;
      }
      if (chosenFolder.filePaths.length > 0) {
        setFolder(chosenFolder.filePaths[0]);
      } else {
        // Handle case where no folder was selected
        // eslint-disable-next-line
        console.error('No folder was selected');
      }
    } catch (error) {
      // eslint-disable-next-line
      console.error('Error opening file dialog:', error);
    }
  };

  useEffect(() => {
    const path = window.require('path');
    if (folder && nameFile === '') {
      setHeaderInfo((prev) => {
        const data = { ...JSON.parse(prev) };
        data.outputPath = path.join(`${folder}`, `${generate({ exactly: 5, wordsPerString: 1 }).join('-')}.pdf`);
        data.verbose = false;
        return JSON.stringify(data);
      });
    } else if (folder && nameFile !== '') {
      setHeaderInfo((prev) => {
        const data = { ...JSON.parse(prev) };
        data.outputPath = path.join(`${folder}`, `${nameFile}.pdf`);
        data.verbose = false;
        return JSON.stringify(data);
      });
    }
  }, [folder]);

  useEffect(() => {
    if (folder && nameFile !== '') {
      const path = window.require('path');
      setHeaderInfo((prev) => {
        const data = { ...JSON.parse(prev) };
        data.outputPath = path.join(`${folder}`, `${nameFile}.pdf`);
        data.verbose = false;
        return JSON.stringify(data);
      });
    }
  }, [nameFile]);

  useEffect(() => {
    const fs = window.require('fs');
    const os = window.require('os');
    const path = window.require('path');

    // Get the temporary directory of the system
    const tmpDir = os.tmpdir();
    fs.mkdtemp(`${tmpDir}${path.sep}`, (err, folder) => {
      if (err) {
        // eslint-disable-next-line
        console.error(err);
      } else {
        setHeaderInfo((prev) => {
          const data = { ...JSON.parse(prev) };
          data.workingDir = folder;
          return JSON.stringify(data);
        });
      }
    });
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    const regex = /^[a-zA-Z_-]*$/; // Regular expression to allow only letters, underscores and dashes

    if (regex.test(value)) {
      setNameFile(value); // Update state only if the input matches the regex
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        backgroundColor: '#FFFFFF',
        width: '100%',
        borderBottomWidth: 2,
        borderStyle: 'solid',
        borderColor: '#EEEEEE',
      }}
    >
      <div
        style={{
          width: '60%',
          borderLeft: '2px solid gray',
          overflowY: 'scroll',
          padding: 20,
        }}
      >
        <div
          style={{
            padding: 20,
            borderBottomWidth: 1,
            borderStyle: 'solid',
            borderColor: '#575757',
          }}
        >
          {SelectOption(
            'Paper size',
            'pages',
            jsonWithHeaderChoice.pages,
            handleChangeHeaderInfo,
          )}
          {SelectOption(
            'Font',
            'fonts',
            jsonWithHeaderChoice.fonts,
            handleChangeHeaderInfo,
          )}
          {SelectOption(
            'Font size',
            'sizes',
            jsonWithHeaderChoice.sizes,
            handleChangeHeaderInfo,
          )}
        </div>
        <div style={{ padding: 5 }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div
                style={{
                  fontWeight: 'regular',
                  display: 'flex',
                  fontSize: 18,
                  color: 'Black',
                  justifyContent: 'left',
                }}
              >
                Content
              </div>
              <div
                style={{
                  backgroundColor: '#F50',
                  borderRadius: 25,
                  justifyContent: 'center',
                  color: 'white',
                  alignContent: 'center',
                  justifyItems: 'center',
                  textAlign: 'center',
                  alignItems: 'center',
                  paddingTop: 5,
                  paddingBottom: 5,
                  paddingLeft: 11,
                  paddingRight: 11,
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setDoReset(!doReset);
                }}
              >
                {t('label-reset')}
              </div>
            </div>
            <TextOnlyTooltip
              placement="top-end"
              title={(
                <div>
                  <div
                    style={{
                      fontSize: 14,
                      fontStyle: 'normal',
                      fontWeight: 600,
                    }}
                  >
                    Advanced mode
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontStyle: 'normal',
                      fontWeight: 400,
                    }}
                  >
                    Merge projects into a single
                    export, access more print types, and use
                    loop mode.
                  </div>
                </div>
              )}
              arrow
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    color: 'black',
                    fontFamily: 'Lato',
                    fontWeight: 400,
                    fontSize: 20,
                  }}
                >
                  Advanced mode
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                  }}
                >
                  <StyledSwitch
                    onChange={() => setAdvanceMode((prev) => !prev)}
                  />
                  <div
                    style={{
                      alignSelf: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      color: 'black',
                      fontFamily: 'Lato',
                      fontWeight: 400,
                      fontSize: 20,
                    }}
                  >
                    {advanceMode ? 'On' : 'Off'}
                  </div>
                </div>
              </div>
            </TextOnlyTooltip>
          </div>
          <ul className="sortable-TESTWRAPPER-list">
            {Object.keys(selected).map((k, i, arraySel) => (
              <li
                id={k}
                className="sortable-test1-item"
                draggable="true"
                key={k}
                style={{ margin: 10 }}
              >
                <WrapperTemplate
                  doReset={doReset}
                  setFinalPrint={setSelected}
                  projectInfo={infoProject}
                  wrapperType={selected[k].type}
                  keyWrapper={k}
                  setUpdate={setUpdate}
                  advanceMode={advanceMode}
                  changePrintData={setSelected}
                  changePrintOrder={setOrderSelection}
                  showTrashButton={arraySel.length > 1}
                />
              </li>
            ))}
          </ul>
          {advanceMode ? (
            <div
              style={{
                borderRadius: 6,
                borderWidth: 1,
                borderStyle: 'solid',
                borderCollor: '#EEEEEE',
                display: 'flex',
                padding: 1,
                flexDirection: 'column',
                alignItems: 'flexStart',
                alignSelf: 'stretch',
                backgroundColor: '#FCFAFA',
                margin: 12,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  width: 80,
                  height: 28,
                  paddingLeft: 12,
                  borderRadius: 4,
                  paddingRight: 6,
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#F50',
                  color: 'white',
                  cursor: 'pointer',
                }}
                onClick={() => handleOpenModalAddWrapper(true)}
              >
                Add
                <ExpandMore />
              </div>
            </div>
          ) : (
            <div />
          )}

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: 15,
              gap: 12,
            }}
          >
            <Button
              style={{
                borderRadius: 4,
                backgroundColor: '#F50',
                borderStyle: 'solid',
                borderColor: '#F50',
                color: 'white',
                margin: 'auto',
                padding: 15,
              }}
              onClick={() => {
                openFileDialogSettingData();
              }}
            >
              Choose an export folder
            </Button>
            <div>{folder ? `Folder selected : ${folder}` : 'Please choose an export folder'}</div>
            <Input
              onChange={(e) => {
                handleInputChange(e);
              }}
              value={nameFile}
              placeholder="your file name here (no special characters allowed)"
            />
            <Button
              style={
                isJsonValidate
                  ? {
                    borderRadius: 4,
                    backgroundColor: '#F50',
                    borderStyle: 'solid',
                    margin: 'auto',
                    borderColor: '#F50',
                    color: 'white',
                    padding: 15,
                  }
                  : {
                    borderRadius: 4,
                    backgroundColor: 'grey',
                    borderStyle: 'solid',
                    borderColor: '#F50',
                    margin: 'auto',
                    color: 'white',
                    padding: 15,
                  }
              }
              onClick={async () => {
                const executablePath = await global.ipcRenderer.invoke('get-browser-path');
                let browser;
                if (jsonValidation.length === 0) {
                  try {
                    browser = await global.puppeteer.launch({
                      headless: 'new',
                      args: [
                        '--disable-web-security',
                      ],
                      executablePath,
                    });
                  } catch (err) {
                    logger.error('InnerFramePopup.js', 'Puppeteer falling back to no-sandbox');
                    browser = await global.puppeteer.launch({
                      headless: 'new',
                      args: [
                        '--disable-web-security',
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                      ],
                      executablePath,
                    });
                  }
                  setMessagePrint('');
                  setMessagePrint('Generating Pdf ...');
                  try {
                    setMessagePrint((prev) => `${prev}\nInstanciating pdfGen`);
                    const pdfGen = new global.PdfGenStatic(
                      { ...JSON.parse(kitchenFaucet), browser },
                      pdfCallBacks,
                    );
                    await pdfGen.doPdf();
                  } catch (pdfError) {
                    setMessagePrint((prev) => `${prev}\nPDF generation failed: ${pdfError.message}`);
                    return;
                  }
                  setMessagePrint((prev) => `${prev}\nSuccessful pdf generation.`);
                } else {
                  const cleanerMessage = jsonValidation.map(
                    (txt) => {
                      let theText = txt;
                      if (txt.includes('outputPath')) {
                        theText = 'Please choose an export folder';
                      } else if (txt.includes('Unknown section type')) {
                        theText = 'Please choose at least one "Print type"';
                      } else if (txt.includes('requires ranges')) {
                        theText = 'Canon specification : please choose at least one book';
                      }
                      return theText;
                    },
                  ).join('\n');
                  setMessagePrint(`# Error\n${cleanerMessage}`);
                }
              }}
            >
              print
            </Button>
          </div>
        </div>
        <Modal
          open={openModalAddWrapper}
          onClose={() => handleOpenModalAddWrapper(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              width: '50%',
              borderRadius: 10,
            }}
          >
            <div>
              {Object.keys(init).map((c) => (
                // eslint-disable-next-line
                <div
                  className="pdfChoice"
                  onClick={() => {
                    const i = Math.max(orderSelection) + 1;
                    setSelected((prev) => {
                      const data = { ...prev };
                      data[i] = { type: c, content: {} };
                      return data;
                    });
                    setOrderSelection((prev) => [
                      ...prev,
                      i,
                    ]);
                    handleOpenModalAddWrapper(false);
                  }}
                >
                  {initNames[c]}
                </div>
              ))}
            </div>
          </div>
        </Modal>
      </div>
      <div
        style={{
          width: '40%',
          height: '100%',
          whiteSpace: 'pre-wrap',
          overflow: 'scroll',
          padding: 12,
        }}
      >
        {messagePrint}
      </div>
    </div>
  );
}

import localforage from 'localforage';
import { splitStringByLastOccurance } from '@/util/splitStringByLastMarker';
import isBackendProjectExist from '../projects/existProjectInBackEnd';
import * as logger from '../../logger';

const checkResourceExist = async (ProjectDir) => {
    if (ProjectDir) {
      const existResource = await isBackendProjectExist(ProjectDir);
      return existResource;
    }
  };

const checkRefObjisEmpty = async (refs, index, historyColumn) => new Promise((resolve) => {
    logger.debug('fetchSettingsResourceHistory.js', 'in check function for resource data empty or not');
    if (refs && refs?.length > 0) {
      // console.log('in check : ', refs[0][index]);
      const checkFields = ['language', 'name', 'resouceId'];
      let resolveDone = false;
      Object.entries(refs?.[historyColumn][index]).forEach(([key, ref]) => {
        if (checkFields.includes(key) && (ref === '' || ref === undefined || ref === null)) {
          resolveDone = true;
          resolve(false);
        }
      });
      if (!resolveDone) {
        resolve(true);
      }
    } else {
      resolve(false);
    }
  });

export async function fetchSettingsResourceHistory(
    setRemovingSection,
    setReferenceColumnData1,
    setReferenceColumnData2,
    referenceColumnData1,
    referenceColumnData2,
    setLayout,
    setLoadResourceR1,
    setLoadResourceR2,
    setOpenResourceR1,
    setOpenResourceR2,
    setSectionNum,
    setNotify,
    setSnackText,
    setOpenSnackBar,
    addNotification,
    sectionPlaceholderNum,
) {
    return new Promise((resolve) => {
        // common values based on section Placeholder- by default 1
        logger.debug('fetchSettingsResourceHistory.js', 'in get resource history on load');
        let historyColumn = '0';
        if (sectionPlaceholderNum === '2') {
          historyColumn = '1';
        }
        logger.debug('fetchSettingsResourceHistory.js', `call from placeholder : ${sectionPlaceholderNum}`);
        const refsHistory = [];
        const rows = [];
        localforage.getItem('currentProject').then(async (projectName) => {
        const _projectname = await splitStringByLastOccurance(projectName, '_');
        // const _projectname = projectName?.split('_');
        // looping through all projects to get the history
        localforage.getItem('projectmeta').then((value) => {
          Object.entries(value).forEach(
            ([, _value]) => {
              Object.entries(_value).forEach(
                ([, resources]) => {
                    // idenitfying current project
                  if (resources.identification.name.en === _projectname[0]) {
                    refsHistory.push(resources.project[resources.type.flavorType.flavor.name].refResources);
                  }
                },
              );
            },
          );
        }).then(() => {
          logger.debug('fetchSettingsResourceHistory.js', `found ref history for project ${_projectname}`);
          if (refsHistory[0]) {
            Object.entries(refsHistory[0]).forEach(
              ([_columnnum, _value]) => {
              if (_columnnum === historyColumn && _value) {
                Object.entries(_value).forEach(
                  ([_rownum, _value]) => {
                    // rows can be 1 ,2 or both
                    rows.push(_rownum);
                      // check existing the dir of resource in backend
                      // helps resurce : offline TRUE , others resourceId == obs/bible/audio _value.resouceId
                        if (_value.offline?.offline || ['obs', 'bible', 'audio'].includes(_value.resouceId.toLowerCase())) {
                          logger.debug('fetchSettingsResourceHistory.js', 'exist check for the loading resource');
                          let projectDirName;
                          if (_value.offline.offline) {
                            projectDirName = _value.offline.data.projectDir;
                          } else {
                            projectDirName = _value.name;
                          }
                          // offline resource exist check fucntion not awaiting always comes false in resouceExistcheck
                          checkResourceExist(projectDirName)
                          .then(async (resourceStatus) => {
                            if (!resourceStatus) {
                              // setRemovingSection(row);1 2 3 4
                              if (_columnnum === historyColumn && _rownum === '1') {
                                if (sectionPlaceholderNum === '1') {
                                  setRemovingSection('1');
                                }
                                if (sectionPlaceholderNum === '2') {
                                  setRemovingSection('3');
                                }
                                setReferenceColumnData1((prev) => ({
                                  ...prev,
                                  languageId: '',
                                  selectedResource: '',
                                  refName: '',
                                  header: '',
                                  owner: '',
                                  offlineResource: { offline: false },
                                  font: '',
                                  fontSize: 1,
                                }
                                ));
                              } else if (_columnnum === historyColumn && _rownum === '2') {
                                if (sectionPlaceholderNum === '1') {
                                  setRemovingSection('2');
                                }
                                if (sectionPlaceholderNum === '2') {
                                  setRemovingSection('4');
                                }
                                setReferenceColumnData2((prev) => ({
                                  ...prev,
                                  languageId: '',
                                  selectedResource: '',
                                  refName: '',
                                  header: '',
                                  owner: '',
                                  offlineResource: { offline: false },
                                  font: '',
                                  fontSize: 1,
                                }
                                ));
                              }
                              setNotify('failure');
                              setSnackText(`${projectDirName} is no longer available. Please download again.`);
                              setOpenSnackBar(true);
                              await addNotification(
                                'Reference Resource',
                                `${projectDirName} is no longer available \n. Please download again.`,
                                'failure',
                              );
                            }
                          });
                        }
                        if (_rownum === '1') {
                          setReferenceColumnData1({
                            ...referenceColumnData1,
                            languageId: _value?.language,
                            selectedResource: _value?.resouceId,
                            refName: _value?.name,
                            header: _value?.name,
                            owner: _value?.owner,
                            offlineResource: _value?.offline,
                            font: _value?.font,
                            fontSize: _value?.fontSize || 1,
                          });
                      }
                      if (_rownum === '2') {
                          setReferenceColumnData2({
                            ...referenceColumnData2,
                            languageId: _value?.language,
                            selectedResource: _value?.resouceId,
                            refName: _value?.name,
                            header: _value?.name,
                            owner: _value?.owner,
                            offlineResource: _value?.offline,
                            font: _value?.font,
                            fontSize: _value?.fontSize || 1,
                          });
                      }
                  },
                );
              }
            },
          );
          } else { resolve(); }
        }).then(async () => {
          logger.debug('fetchSettingsResourceHistory.js', 'show or hide pane row based on history');
          if (refsHistory[0]) {
            let refs = refsHistory[0];
            refs = refs.filter((x) => x != null);
            setLayout(refs.length);
            if (rows.length > 1) {
              // setLoadResource1(true);
              if (refs && refs.length > 0) {
                setLoadResourceR1(await checkRefObjisEmpty(refs, 1, historyColumn));
                setLoadResourceR2(await checkRefObjisEmpty(refs, 2, historyColumn));
              }
              setOpenResourceR1(false);
              setOpenResourceR2(false);
            }
            if (rows.length === 1) {
              if (refs && refs.length > 0) {
                setLoadResourceR1(await checkRefObjisEmpty(refs, 1, historyColumn));
              }
              setOpenResourceR1(false);
            }
            setSectionNum(rows.length);
            resolve();
          }
        });
      });
    });
}

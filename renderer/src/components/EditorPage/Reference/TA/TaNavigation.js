import PropTypes from 'prop-types';
import {
  useState, useEffect, useContext,
} from 'react';
import { ReferenceContext } from '@/components/context/ReferenceContext';
import localForage from 'localforage';
import * as logger from '../../../../logger';
import MultiComboBox from '../MultiComboBox';
import packageInfo from '../../../../../../package.json';
import { environment } from '../../../../../environment';

export default function TaNavigation({ languageId, referenceResources }) {
  const [selected, setSelected] = useState('');
  const [options, setoptions] = useState([]);
  const [selectedOption, setselectedOption] = useState(null);

  // const [hovered, setHovered] = useState(null);
  const [taList, setTaList] = useState([]);
  const BaseUrl = `${environment.GITEA_API_ENDPOINT}/repos/`;

  const {
    state: {
      owner,
      // taNavigationPath,
    },
    actions: {
      setTaNavigationPath,
    },
  } = useContext(ReferenceContext);

  useEffect(() => {
    if (referenceResources && referenceResources?.offlineResource?.offline) {
      // offline
      const taArrayOffline = [];
      const { offlineResource } = referenceResources;
      // console.log('offline data : ', { taList, offlineResource });
      localForage.getItem('userProfile').then(async (user) => {
        logger.debug('TaNavigation.js', 'reading offline helps ', offlineResource.data?.projectDir);
        const fs = window.require('fs');
        const path = require('path');
        const newpath = localStorage.getItem('userPath');
        const currentUser = user?.username;
        const folder = path.join(newpath, packageInfo.name, 'users', `${currentUser}`, 'resources');
        const projectName = `${offlineResource?.data?.value?.meta?.name}_${offlineResource?.data?.value?.meta?.owner}_${offlineResource?.data?.value?.meta?.release?.tag_name}`;
        // multiple books or options
        if (offlineResource?.data?.value?.meta?.books.length > 0) {
          setoptions(offlineResource.data.value.meta.books);
        }
        // if (fs.existsSync(path.join(folder, projectName, 'translate'))) {
        if (selectedOption && fs.existsSync(path.join(folder, projectName, selectedOption))) {
          fs.readdir(path.join(folder, projectName, selectedOption), async (err, folderNames) => {
            if (err) {
              // console.log(`Unable to scan directory: ${ err}`);
              logger.debug('TaNavigation.js', `Unable to scan directory: ${err}`);
            }
            let foldersCount = 0;
            if (folderNames.length > 0) {
              await folderNames.forEach(async (folderName) => {
                if (fs.lstatSync(path.join(folder, projectName, selectedOption, folderName)).isDirectory()) {
                  foldersCount += 1;
                  const title = await fs.readFileSync(path.join(folder, projectName, selectedOption, folderName, 'title.md'), 'utf8');
                  const subTitle = await fs.readFileSync(path.join(folder, projectName, selectedOption, folderName, 'sub-title.md'), 'utf8');
                  taArrayOffline.push({ folder: folderName, title, subTitle });
                }
                if (taArrayOffline.length === foldersCount) {
                  setTaList(taArrayOffline);
                  setSelected(taArrayOffline[0]);
                }
              });
            }
          });
        }
      });
    } else {
      // online
      const taArray = [];
      // fetch(`${BaseUrl}${owner}/${languageId}_ta/contents/translate/`)
      fetch(`${BaseUrl}${owner}/${languageId}_ta/`)
        .then((response) => response.json())
        .then((actualData) => {
          // get avaialble books/ingredients
          const optionsList = actualData?.ingredients?.map((item) => item.identifier);
          if (optionsList?.length > 0 && !options.length > 0) {
            setoptions(optionsList);
          }
          // get data function
          const fetchData = async () => {
            await fetch(`${BaseUrl}${owner}/${languageId}_ta/contents/${selectedOption}/`)
              .then((response) => response.json())
              .then((folderData) => {
                // console.log({ folderData });
                !folderData?.message && folderData?.forEach((element) => {
                  const pattern = /^.*\.(yml|yaml)/gm;
                  if (!pattern.test(element.name.toLowerCase())) {
                    const tempObj = {};
                    tempObj.folder = element.name;
                    fetch(`${BaseUrl}${owner}/${languageId}_ta/raw/${selectedOption}/${element.name}/title.md`)
                      .then((response) => response.text())
                      .then((data) => {
                        tempObj.title = data;
                      });
                    fetch(`${BaseUrl}${owner}/${languageId}_ta/raw/${selectedOption}/${element.name}/sub-title.md`)
                      .then((response) => response.text())
                      .then((data) => {
                        tempObj.subTitle = data;
                      });
                    taArray.push(tempObj);
                  }
                });
              });
          };

          const getData = async () => {
            await fetchData();
            setTaList(taArray);
            setSelected(taArray[0]);
          };
          // console.log({ selectedOption });
          selectedOption && getData();
        })
        .catch((err) => {
          logger.debug('In Fetch TA Content.js', `Error in Fetch : ${err.message}`);
        });
    }
  }, [BaseUrl, languageId, options, owner, referenceResources, selectedOption]);

  useEffect(() => {
    if (referenceResources?.offlineResource?.offline) {
      // setTaNavigationPath(`${selectedOption}/${selected?.folder}`);
      setTaNavigationPath({ option: selectedOption, path: selected?.folder });
    } else {
      // setTaNavigationPath(selected?.folder);
      setTaNavigationPath({ option: selectedOption, path: selected?.folder });
    }
  }, [referenceResources, selected, selectedOption, setTaNavigationPath]);
  return (
    <div className="flex fixed">
      <div className="bg-grey text-danger py-0 uppercase tracking-wider text-xs font-semibold">
        <div aria-label="resource-bookname" className="px-1" />
        {languageId && owner && (
          <MultiComboBox
            selected={selected}
            setSelected={setSelected}
            data={taList}
            options={options}
            selectedOption={selectedOption}
            setselectedOption={setselectedOption}
          />
        )}
      </div>
    </div>
  );
}

TaNavigation.propTypes = {
  languageId: PropTypes.string,
  referenceResources: PropTypes.object,
};

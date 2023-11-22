import React, {
  Fragment, useContext, useState,
} from 'react';
import PropTypes from 'prop-types';

import { FolderOpenIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import * as localforage from 'localforage';
import { useTranslation } from 'react-i18next';
import { SnackBar } from '@/components/SnackBar';
import { ReferenceContext } from '@/components/context/ReferenceContext';
import ConfirmationModal from '@/layouts/editor/ConfirmationModal';
import * as logger from '../../logger';
import { viewBurrito } from '../../core/burrito/importBurrito';
import packageInfo from '../../../../package.json';
import { uploadLocalHelpsResources } from './ResourceUtils/uploadLocalHelpsResources';

export default function ImportResource({
  closePopUp, setOpenResourcePopUp, setLoading, selectResource,
}) {
  const [valid, setValid] = useState(false);
  const [snackBar, setOpenSnackBar] = useState(false);
  const [snackText, setSnackText] = useState('');
  const [notify, setNotify] = useState();
  const [openModal, setOpenModal] = useState(false);
  const [dataForImport, setDataForImport] = useState();
  const { t } = useTranslation();
  const {
    state: {
      folderPath,
    },
    actions: {
      setFolderPath,
      openResourceDialog,
    },
  } = useContext(ReferenceContext);

  function close() {
    closePopUp(false);
    setValid(false);
  }
  const importReference = async (projectsDir, name, burritoType) => {
    const fs = window.require('fs');
    const fse = window.require('fs-extra');
    const path = require('path');
    let dirPath;
    // Identify the projects with 'audio' folder (projects with Text will have 'audio' folder)
    if (burritoType === 'scripture / audioTranslation' && !fs.existsSync(path.join(folderPath, 'audio'))) {
      dirPath = path.join(projectsDir, name, 'audio');
    } else {
      dirPath = path.join(projectsDir, name);
    }
    await fse.copy(folderPath, dirPath, { overwrite: true })
      .then(async () => {
        if (burritoType === 'scripture / audioTranslation' && !fs.existsSync(path.join(folderPath, 'audio'))) {
          await fs.renameSync(path.join(projectsDir, name, 'audio', 'metadata.json'), path.join(projectsDir, name, 'metadata.json'));
        }
        setOpenSnackBar(true);
        setNotify('success');
        setSnackText(t('dynamic-msg-import-resource-snack'));
      }).then(() => {
        close();
        setOpenResourcePopUp(false);
      }).then(() => {
        setOpenResourcePopUp(true);
      })
      .catch((err) => {
        logger.debug('ImportResource.js', 'error in uploading resource to specified location');
        setNotify(err);
      });
      setFolderPath('');
  };
  const uploadRefBible = async () => {
    const fs = window.require('fs');
    const path = require('path');
    try {
      const user = await localforage.getItem('userProfile');
      const newpath = localStorage.getItem('userPath');
      fs.mkdirSync(path.join(newpath, packageInfo.name, 'users', user?.username, 'resources'), {
        recursive: true,
      });
      const projectsDir = path.join(newpath, packageInfo.name, 'users', user?.username, 'resources');
      // Adding 'resources' to check the duplication in the user reference list

      // section for upload local door43 helps resource (upload and convert to burrito type)
      if (selectResource === 'local-helps') {
        await uploadLocalHelpsResources(fs, path, projectsDir, folderPath);
      } else {
        // section for burrito based local resource for bible, obs and audio
        const result = await viewBurrito(folderPath, user?.username, 'resources');
        if (result.fileExist === false) {
          setOpenSnackBar(true);
          setNotify('error');
          setSnackText(t('dynamic-msg-unable-find-buritto-snack'));
          logger.warn('ImportResource.js', 'Unable to find burrito file (metadata.json).');
        } else if (result.validate) {
          // path.basename is not working for windows
          // const name = path.basename(folderPath);
          const name = (folderPath.split(/[(\\)?(/)?]/gm)).pop();
          setDataForImport({ projectsDir, name });
          if (fs.existsSync(path.join(projectsDir, result.projectName))) {
            logger.warn('ImportResource.js', 'Project already available');
            setOpenModal(true);
          } else {
            setLoading(true);
            logger.debug('ImportResource.js', 'Its a new project');
            importReference(projectsDir, name, result.burritoType);
          }
        } else {
          setOpenSnackBar(true);
          setNotify('error');
          logger.error('ImportResource.js', 'Invalid burrito file (metadata.json).');
          setSnackText(t('dynamic-msg-unable-invalid-buritto-snack'));
        }
      }
    } catch (err) {
      logger.debug('ImportResource.js', 'error in loading resource');
      setNotify(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="uppercase text-sm">{t('label-import-resource')}</h2>
      <h4 className="text-xs text-primary tracking-wide leading-4 font-light flex items-center py-2 gap-2">
        {t('label-burrito-resource-path')}
        <button title={t('msg-select-dir-for-SB')} type="button" disabled>
          <InformationCircleIcon className="h-6 w-6 text-primary" />
        </button>
      </h4>
      <div className="flex gap-2 items-center">
        <input
          type="text"
          name="location"
          id=""
          value={folderPath}
          onChange={(e) => setFolderPath(e.target.value)}
          className="bg-white w-52 lg:w-80 block rounded shadow-sm sm:text-sm focus:border-primary border-gray-300"
        />
        <button
          type="button"
          title={t('tooltip-import-open-file-location')}
          onClick={() => openResourceDialog()}
          className="py-2 px-4 flex gap-2 items-center rounded shadow bg-gray-200 border border-gray-300 text-gray-600 uppercase text-xs tracking-wider"
        >
          {t('label-select-folder')}
          <FolderOpenIcon className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <h4 className="text-red-500">{valid === true ? 'Enter location' : ''}</h4>

      <div className="flex gap-6 mx-5 justify-end">
        {/* <button type="button" className="py-2 px-6 rounded shadow bg-error text-white uppercase text-xs tracking-widest font-semibold" onClick={close}>{t('btn-cancel')}</button> */}
        <button
          onClick={() => uploadRefBible()}
          type="button"
          className="py-2 px-7 rounded shadow bg-success text-white uppercase text-xs tracking-widest font-semibold"
        >
          {t('btn-upload')}
        </button>
      </div>
      <SnackBar
        openSnackBar={snackBar}
        snackText={snackText}
        setOpenSnackBar={setOpenSnackBar}
        setSnackText={setSnackText}
        error={notify}
      />
      <ConfirmationModal
        openModal={openModal}
        title={t('modal-title-replace-resource')}
        setOpenModal={setOpenModal}
        confirmMessage={t('dynamic-msg-confirm-replace-resource')}
        buttonName={t('btn-replace')}
        closeModal={() => importReference(dataForImport.projectsDir, dataForImport.name)}
      />
    </>
  );
}

ImportResource.propTypes = {
  closePopUp: PropTypes.func,
  setOpenResourcePopUp: PropTypes.func,
  setLoading: PropTypes.func,
  selectResource: PropTypes.string,
};

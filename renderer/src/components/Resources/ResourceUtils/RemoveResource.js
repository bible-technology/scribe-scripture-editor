import React, { useContext } from 'react';
import PropTypes from 'prop-types';
// import localforage, * as localForage from 'localforage';
import { useTranslation } from 'react-i18next';
import { SnackBar } from '@/components/SnackBar';
import ConfirmationModal from '@/layouts/editor/ConfirmationModal';
import localForage from 'localforage';
import { ReferenceContext } from '@/components/context/ReferenceContext';
import { TrashIcon } from '@heroicons/react/24/outline';
import { splitStringByLastOccurence } from '@/util/splitStringByLastMarker';
import * as logger from '../../../logger';
import packageInfo from '../../../../../package.json';
// import TrashSvg from '@/icons/basil/Outline/Interface/Trash.svg';

const path = require('path');

// function to check same resource active on multiple reference panes
const ResourceResetAfterCheckSameOnRefResourceAgSettings = async (setResetResourceOnDeleteOffline, resource) => {
  logger.debug('RemoveResource.js', 'Search for multiple pane open same resource before download');
  const refsHistory = [];
  localForage.getItem('currentProject').then(async (projectName) => {
    const _projectname = await splitStringByLastOccurence(projectName, '_');
    // const _projectname = projectName?.split('_');
    localForage.getItem('projectmeta').then((value) => {
      Object.entries(value).forEach(
        ([, _value]) => {
          Object.entries(_value).forEach(
            ([, resources]) => {
              if (resources.identification.name.en === _projectname[0]) {
                refsHistory.push(resources.project[resources.type.flavorType.flavor.name].refResources);
              }
            },
          );
        },
      );
    }).then(() => {
      // console.log({ refsHistory, resource });
      if (refsHistory[0]) {
        const resourcePane = [];
        Object.entries(refsHistory[0]).forEach(
          ([_columnnum, _value]) => {
            Object.entries(_value).forEach(
              ([_rownum, _value]) => {
                // console.log(_columnnum.toString() + _rownum.toString());
                const resourceName = _value?.offline?.offline ? _value?.offline?.data?.projectDir.toLowerCase() : _value?.name.toLowerCase();
                // console.log('equal check : ', resourceName === resource?.projectDir.toLowerCase());
                if (resourceName === resource?.projectDir.toLowerCase()) {
                  resourcePane.push(_columnnum.toString() + _rownum.toString());
                }
              },
            );
          },
        );
        if (resourcePane.length > 0) {
          // read Scribe-settings
          if (resourcePane.includes('01')) {
            logger.debug('RemoveResource.js', 'Referesh pane 01 contains current  deleted resource');
            setResetResourceOnDeleteOffline((prev) => ({
              ...prev,
              referenceColumnOneData1Reset: true,
            }
            ));
          }
          if (resourcePane.includes('02')) {
            logger.debug('RemoveResource.js', 'Referesh pane 02 contains current deleted resource');
            setResetResourceOnDeleteOffline((prev) => ({
              ...prev,
              referenceColumnOneData2Reset: true,
            }
            ));
          }
          if (resourcePane.includes('11')) {
            logger.debug('RemoveResource.js', 'Referesh pane 11 contains current deleted resource');
            setResetResourceOnDeleteOffline((prev) => ({
              ...prev,
              referenceColumnTwoData1Reset: true,
            }
            ));
          }
          if (resourcePane.includes('12')) {
            logger.debug('RemoveResource.js', 'Referesh pane 12 contains current deleted resource');
            setResetResourceOnDeleteOffline((prev) => ({
              ...prev,
              referenceColumnTwoData2Reset: true,
            }
            ));
          }
        }
      }
    });
  });
};

function RemoveResource({
  resource, selectResource, setRenderApp,
}) {
  logger.warn('removeResource.js', 'inside remove resource');
  const { t } = useTranslation();
  const [snackBar, setOpenSnackBar] = React.useState(false);
  const [snackText, setSnackText] = React.useState('');
  // eslint-disable-next-line no-unused-vars
  const [notify, setNotify] = React.useState();
  const [openModal, setOpenModal] = React.useState(false);

  // React.useEffect(() => {
  // }, []);

  const {
    // state: {
    //   resetResourceOnDeleteOffline,
    // },
    actions: {
      setResetResourceOnDeleteOffline,
    },
  } = useContext(ReferenceContext);

  const handleRemoveResourceResources = async () => {
    logger.warn('removeResource.js', 'inside removing resource call');
    localForage.getItem('userProfile').then(async (user) => {
      logger.debug('DownloadResourcePopUp.js', 'In resource download user fetch - ', user?.username);
      const fs = window.require('fs');
      const newpath = localStorage.getItem('userPath');
      const folder = path.join(newpath, packageInfo.name, 'users', `${user?.username}`, 'resources');
      let resourceName = null;
      switch (selectResource) {
      case 'obs':
      case 'bible':
      case 'audio':
        resourceName = resource?.projectDir;
        break;
      case 'tn':
      case 'tw':
      case 'ta':
      case 'tq':
      case 'obs-tn':
      case 'obs-tq':
        resourceName = resource?.projectDir;
        break;
      default:
        break;
      }
      await fs.rmdir(path.join(folder, resourceName), { recursive: true }, async (err) => {
        if (err) {
          setOpenSnackBar(true);
          setNotify('failure');
          setSnackText('Remove Resource Failed');
          // throw new Error(`Remove Resource failed :  ${err}`);
        }
        // console.log('resource remove success');
        // read Scribe-settings of the project
        await ResourceResetAfterCheckSameOnRefResourceAgSettings(setResetResourceOnDeleteOffline, resource);
        // handleRowSelect(null, null, null, null, '');
        setRenderApp(true);
        setOpenSnackBar(true);
        setNotify('success');
        setSnackText('Removed Resource Successfully');
      });
    });
  };

  return (
    <>
      <div
        className="text-xs cursor-pointer focus:outline-none hover:"
        role="button"
        tabIndex={0}
        title={t('modal-title-remove-resource')}
        onClick={() => setOpenModal(true)}
      >
        <TrashIcon
          className="w-4 h-4"
        />
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
        title={t('modal-title-remove-resource')}
        setOpenModal={setOpenModal}
        confirmMessage={t('msg-remove-resource')}
        buttonName={t('btn-remove')}
        closeModal={() => handleRemoveResourceResources()}
      />

    </>
  );
}

RemoveResource.propTypes = {
  resource: PropTypes.object,
  selectResource: PropTypes.string,
  setRenderApp: PropTypes.func,
};

export default RemoveResource;

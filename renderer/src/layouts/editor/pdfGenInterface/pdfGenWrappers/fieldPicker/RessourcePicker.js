import { useState, useEffect, useContext } from 'react';
import { ProjectContext } from '@/components/context/ProjectContext';
import { Button, Modal } from '@mui/material';
// eslint-disable-next-line
import ScriptureContentPicker from '@/components/ScriptureContentPicker/ScriptureContentPicker.tsx';

function keyToRessource(elem) {
  if (elem === 'translationText' || elem === 'lhs') {
    return 'book';
  }
  if (elem === 'html') {
    return 'html';
  }
  if (elem === 'md') {
    return 'md';
  }
  if (elem === 'obs') {
    return 'OBS';
  }
  if (elem === 'obsNotes') {
    return 'OBS-TN';
  }
  if (elem === 'juxta') {
    return 'jxl';
  }

  if (elem === 'tNotes') {
    return 'tNotes';
  }
  return elem;
}

export function RessourcePicker({
  doReset, setJsonSpec, fieldInfo, ressourceKey, ressourceName, open = true,
}) {
  const [selected, setSelected] = useState('');
  const [infoDisplay, setInfoDiplay] = useState('');

  useEffect(() => {
    if (selected !== '') {
      setJsonSpec((prev) => {
        const j = JSON.parse(prev);

        j[fieldInfo.id] = selected;
        return JSON.stringify(j);
      });
    }
  }, [selected]);

  const resetField = () => {
    setSelected('');
    setInfoDiplay('');
  };

  useEffect(() => {
    resetField();
  }, [doReset]);

  const {
    states: { listResourcesForPdf },
  } = useContext(ProjectContext);

  const [searchText, setSearchText] = useState('');
  const [openModal, setOpenModal] = useState(false);

  const handleInputSearch = (e) => {
    setSearchText(e.target.value);
  };
  const [localListResourcesForPdf, setLocalListResourcesForPdf] = useState(
    Object.keys(listResourcesForPdf).reduce(
      (a, v) => ({ ...a, [v]: {} }),
      {},
    ),
  );

  const handleOpenModal = (isOpen) => {
    setOpenModal(isOpen);
    setSearchText('');
  };

  useEffect(() => {
    if (searchText.length > 2) {
      const contentTypes = Object.keys(listResourcesForPdf);
      const newListResources = contentTypes.reduce(
        (a, v) => ({ ...a, [v]: {} }),
        {},
      );
      const regexSearch = new RegExp(`.*${searchText}.*`, 'i');
      let entries;
      contentTypes.forEach((contentType) => {
        entries = Object.entries(listResourcesForPdf[contentType]).sort();
        // eslint-disable-next-line
        for (const [pathKey, val] of entries) {
          if (
            regexSearch.test(
              pathKey.replace('[', '').replace(']', ''),
            )
          ) {
            newListResources[contentType][pathKey] = val;
          }
        }
      });
      setLocalListResourcesForPdf(newListResources);
    } else {
      setLocalListResourcesForPdf(listResourcesForPdf);
    }
  }, [searchText, setSearchText, openModal, setOpenModal]);

  return (
    <div
      style={open ? {
        display: 'flex',
        flexDirection: 'column',
        paddingLeft: 22,
        paddingRight: 22,
        paddingTop: 10,
        alignItems: 'center',
        justifyContent: 'space-between',

      } : { display: 'none' }}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
      }}
      >
        <div>
          {ressourceName}
          {' '}
        </div>
        <Button
          style={{
            borderRadius: 4,
            backgroundColor: '#F50',
            borderStyle: 'solid',
            borderColor: '#F50',
            color: 'white',
          }}
          onClick={() => handleOpenModal(true)}
        >
          {infoDisplay === '' ? 'Choose' : 'Choose another source'}
        </Button>
      </div>
      <div>{infoDisplay}</div>

      <Modal
        open={openModal}
        onClose={() => handleOpenModal(false)}
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
            height: '50%',
          }}
        >
          <div className="picker-container">
            <div className="searchContainer">
              <input
                className="searchInput"
                type="text"
                placeholder="Search"
                onInput={handleInputSearch}
              />
            </div>

            {localListResourcesForPdf ? (

              <ScriptureContentPicker
                onSelect={(e) => {
                  setSelected(e.src.path);
                  setInfoDiplay(e.description);
                  handleOpenModal(false);
                }}
                source={{
                  Ressources: localListResourcesForPdf[keyToRessource(ressourceKey)]
                    ? localListResourcesForPdf[keyToRessource(ressourceKey)] : {},
                }}
              />
            ) : (
              <div />
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}

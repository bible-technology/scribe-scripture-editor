import { useEffect, useContext, useState } from 'react';
import { Modal } from '@mui/material';
import { ProjectContext } from '@/components/context/ProjectContext';
// eslint-disable-next-line
import ScriptureContentPicker from '@/components/ScriptureContentPicker/ScriptureContentPicker.tsx';

export function ScriptureContentSearchBar({
  openModal,
  setOpenModal,
  handleOpenModal,
  setSelected,
  setOrderSelection,
}) {
  const {
    states: { listResourcesForPdf },
  } = useContext(ProjectContext);
  const {
    actions: { setLanguage },
  } = useContext(ProjectContext);

  setLanguage('fr');

  const [searchText, setSearchText] = useState('');
  const [localListResourcesForPdf, setLocalListResourcesForPdf] = useState(
    Object.keys(listResourcesForPdf).reduce(
      (a, v) => ({ ...a, [v]: {} }),
      {},
    ),
  );

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

  const handleInputSearch = (e) => {
    setSearchText(e.target.value);
  };

  return (
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
                setSelected((prev) => [
                  ...prev,
                  e.description,
                ]);
                setOrderSelection((prev) => [
                  ...prev,
                  e.description,
                ]);
                handleOpenModal(false);
              }}
              source={localListResourcesForPdf}
            />
          ) : (
            <div />
          )}
        </div>
      </div>
    </Modal>
  );
}

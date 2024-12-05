import { useEffect, useState, useContext } from 'react';
import { Button, Modal } from '@mui/material';
import { ProjectContext } from '@/components/context/ProjectContext';
import i18n from '../../translations/i18n';
import { AccordionPicker } from './pdfGenInterface/pdfGenWrappers/SectionAccordion';

export function SortableList({
  setOrderSelection,
  selected,
  setSelected,
}) {
  const jsonTruc = global.PdfGen.handlerInfo();
  const listChoice = Object.keys(jsonTruc);

  const {
    actions: { setLanguage },
  } = useContext(ProjectContext);

  setLanguage('fr');

  const [openModal, setOpenModal] = useState(false);

  const updateElemOrder = (items) => {
    const t = [];
    items.forEach((item) => {
      t.push(item.id);
    });
    setOrderSelection(t);
  };

  const handleOpenModal = (isOpen) => {
    setOpenModal(isOpen);
  };

  useEffect(() => {
    const sortableList = document.querySelector('.sortable-list');
    const items = sortableList.querySelectorAll('.item');

    items.forEach((item) => {
      item.addEventListener('dragstart', () => {
        // Adding dragging class to item after a delay
        setTimeout(() => item.classList.add('dragging'), 0);
      });
      // Removing dragging class from item on dragend event
      item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
      });
    });

    const initSortableList = (e) => {
      e.preventDefault();
      const draggingItem = document.querySelector('.dragging');
      // Getting all items except currently dragging and making array of them
      const siblings = [
        ...sortableList.querySelectorAll('.item:not(.dragging)'),
      ];
      // Finding the sibling after which the dragging item should be placed
      const nextSibling = siblings.find((sibling) => e.clientY <= sibling.offsetTop + sibling.offsetHeight);
      // Inserting the dragging item before the found sibling
      sortableList.insertBefore(draggingItem, nextSibling);
    };

    sortableList.addEventListener('dragend', () => updateElemOrder(
      document
        .querySelector('.sortable-list')
        .querySelectorAll('.item'),
    ));
    sortableList.addEventListener('dragover', initSortableList);
    sortableList.addEventListener('dragenter', (e) => e.preventDefault());

    // Clean-up function
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
  }, [Object.keys(selected).length]); // Empty dependency array ensures this effect runs only once after initial render

  return (
    <div>
      <ul className="sortable-list">
        {Object.keys(selected).map((k, index) => (
          <li
            id={index}
            className="item"
            draggable="true"
            // eslint-disable-next-line
            key={`${k }_${ index}`}
          >
            <AccordionPicker
              language={i18n.language}
              setSelected={setSelected}
              keySpecification={selected[k].type}
              idjson={index}
            />
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
          Add content
        </Button>
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
              borderRadius: 10,
            }}
          >
            <div>
              {listChoice.map((c) => (
                // eslint-disable-next-line
                <div
                  className="pdfChoice"
                  onClick={() => {
                    setSelected((prev) => {
                      const nb = Object.keys(prev).length;
                      prev[nb] = { type: c, content: {} };
                      return prev;
                    });
                    setOrderSelection((prev) => [
                      ...prev,
                      prev.length,
                    ]);
                    handleOpenModal(false);
                  }}
                >
                  {c}
                </div>
              ))}
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}

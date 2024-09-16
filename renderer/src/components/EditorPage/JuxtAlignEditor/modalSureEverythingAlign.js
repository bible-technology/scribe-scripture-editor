import Modal from 'react-modal';

export function ModalSureEverythingAlign({
  shouldOpen, isAlignModalOpen, setIsAlignModalOpen, setOptionDontShowAlignModal, optionDontShowAlignModal,
}) {
  let isEverythingAlign = false;
  // eslint-disable-next-line
  for (const so of shouldOpen) {
    isEverythingAlign = isEverythingAlign && so;
  }
  return (
    <Modal
      isOpen={isAlignModalOpen && !isEverythingAlign}
      onRequestClose={() => setIsAlignModalOpen(false)}
      style={{
        content: {
          width: 'fit-content',
          height: 'fit-content',
          margin: 'auto', // Add margin:auto to center the modal
          textAlign: 'center',
          display: 'flex',
          background: '#f5f5f5f5',
          flexDirection: 'column',
        },
      }}
    >
      <div>
        <div
          style={{ textAlign: 'center', fontWeight: 'bold', margin: 20 }}
          className="staticText"
        >
          Is everything aligned?
        </div>
        <div>
          <div className="staticText" style={{ textAlign: 'left', margin: 20 }}>
            You validated this sentence as “Aligned” with at least 1 chunk not
            aligned to anything.
          </div>
          <div className="staticText" style={{ textAlign: 'left', margin: 20 }}>
            This can be normal, because a translation does not necessarily match
            word-for-word it’s source text.
          </div>
          <div className="staticText" style={{ textAlign: 'left', margin: 20 }}>
            Just check this is what you wanted.
          </div>
        </div>
        <div
          className="test"
          style={{ display: 'flex', margin: 'auto', width: 'fit-content' }}
        >
          <input
            style={{
              width: 24,
              height: 24,
              borderWidth: 1,
              borderRadius: 2,
              backgroundColor: '#676767',
              justifyContent: 'center',
              cursor: 'pointer',
              marginTop: 4,
            }}
            type="checkbox"
            value="label"
            checked={optionDontShowAlignModal}
            onChange={() => { setOptionDontShowAlignModal(!optionDontShowAlignModal); }}
          />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 24 }}>&nbsp; Don&apos;t show this again</div>
            <div>
              &nbsp;&nbsp;&nbsp;you will still get a visual warning around un-aligned chunks, this
              can be turned off in the settings
            </div>
          </div>
        </div>

      </div>
      <div
        onClick={() => setIsAlignModalOpen(false)}
        style={{
          padding: 6,
          margin: 24,
          fontSize: 32,
          borderWidth: 2,
          borderRadius: 12,
          borderStyle: 'solid',
          width: 'fit-content',
          display: 'flex',
          alignSelf: 'center', // Align content horizontally
          alignItems: 'center',
          cursor: 'pointer',
        }}
      >
        OK
      </div>
    </Modal>
  );
}

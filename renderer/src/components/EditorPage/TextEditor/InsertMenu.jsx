import PopupButton from './PopupButton';

export default function InsertMenu({ handleClick: handleButtonClick, selectedText }) {
  const handleClick = (number, title) => {
    handleButtonClick(number, title);
  };
  return (
    <div className="flex items-center">
      <PopupButton
        handleClick={handleClick}
        title="Insert Verse"
        icon="V"
      />
      <PopupButton
        handleClick={handleClick}
        title="Insert Chapter"
        icon="C"
      />
      <PopupButton
        handleClick={handleClick}
        title="Footnote"
        selectedText={selectedText}
        icon="FN"
      />
      <PopupButton
        handleClick={handleClick}
        title="Cross Reference"
        selectedText={selectedText}
        icon="XR"
      />
      <PopupButton
        handleClick={handleClick}
        title="Section Heading"
        selectedText={selectedText}
        icon="SH"
      />
    </div>
  );
}

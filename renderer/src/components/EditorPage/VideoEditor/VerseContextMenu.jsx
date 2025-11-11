import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

const VerseContextMenu = ({
  visible,
  x,
  y,
  verse,
  isFirstVerse,
  isJoinedVerse,
  onJoinVerse,
  onDisjoinVerse,
  onClose,
}) => {
  const { t } = useTranslation();

  if (!visible) {
    return null;
  }

  const handleJoin = () => {
    onJoinVerse(verse.verseNumber);
    onClose();
  };

  const handleDisjoin = () => {
    onDisjoinVerse(verse.verseNumber);
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        onContextMenu={(e) => {
          e.preventDefault();
          onClose();
        }}
      />
      <div
        className="fixed z-50 bg-white shadow-lg rounded-md border border-gray-200 py-1 min-w-[200px]"
        style={{
          left: `${x}px`,
          top: `${y}px`,
        }}
      >
        {!isFirstVerse && !isJoinedVerse && (
          <button
            type="button"
            onClick={handleJoin}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700 flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
            {t('msg-join-with-previous', { defaultValue: 'Join with previous verse' })}
          </button>
        )}

        {isJoinedVerse && (
          <button
            type="button"
            onClick={handleDisjoin}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700 flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
            {t('msg-disjoin-last-verse', { defaultValue: 'Disjoin the first  verse' })}
          </button>
        )}

      </div>
    </>
  );
};

VerseContextMenu.propTypes = {
  visible: PropTypes.bool.isRequired,
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  verse: PropTypes.object,
  isFirstVerse: PropTypes.bool.isRequired,
  isJoinedVerse: PropTypes.bool.isRequired,
  onJoinVerse: PropTypes.func.isRequired,
  onDisjoinVerse: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
export default VerseContextMenu;

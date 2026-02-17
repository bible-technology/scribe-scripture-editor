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

  if (!visible || !verse) {
    return null;
  }

  const handleJoin = (e) => {
    e.stopPropagation();
    onJoinVerse(verse.verseNumber);
    onClose();
  };

  const handleDisjoin = (e) => {
    e.stopPropagation();
    onDisjoinVerse(verse.verseNumber);
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      <div
        className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-lg py-1 min-w-[200px]"
        style={{
          top: `${y}px`,
          left: `${x}px`,
        }}
      >
        {!isFirstVerse && !isJoinedVerse && (
          <button
            type="button"
            onClick={handleJoin}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700 transition-colors"
          >
            {t('msg-join-with-previous')}
          </button>
        )}

        {isJoinedVerse && (
          <button
            type="button"
            onClick={handleDisjoin}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700 transition-colors"
          >
            {t('msg-disjoin-last-verse')}
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

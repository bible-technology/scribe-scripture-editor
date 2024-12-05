import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { CardContent, useCardState } from 'translation-helps-rcl';
import TranslationhelpsNav from './TranslationhelpsNav';

const ReferenceCard = ({
  items,
  filters,
  markdown,
  languageId,
  selectedQuote,
  setQuote,
  viewMode,
  isLoading,
  font,
  setResetTrigger,
  resetTrigger,
  fontSize,
}) => {
  const {
    state: {
      item, itemIndex, markdownView,
    },
    actions: {
      setItemIndex,
    },
  } = useCardState({ items });

  useEffect(() => {
    if (resetTrigger) {
      setItemIndex(0);
      setResetTrigger(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetTrigger]);

  return (
    <>
      {item && items.length > 0 && (
        <TranslationhelpsNav
          classes
          items={items}
          itemIndex={itemIndex}
          setItemIndex={setItemIndex}
        />
      )}
      <div style={{
        fontFamily: font || 'sans-serif',
        fontSize: `${fontSize}rem`,
        lineHeight: (fontSize > 1.3) ? 1.5 : '',
      }}
      >
        <CardContent
          item={item}
          items={items}
          filters={filters}
          markdown={markdown}
          languageId={languageId}
          markdownView={markdownView}
          isLoading={isLoading}
          selectedQuote={selectedQuote}
          setQuote={setQuote}
          viewMode={viewMode}
        />
      </div>
    </>

  );
};

export default ReferenceCard;

ReferenceCard.propTypes = {
  items: PropTypes.array,
  filters: PropTypes.array,
  markdown: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  languageId: PropTypes.string.isRequired,
  selectedQuote: PropTypes.string,
  setQuote: PropTypes.func,
  viewMode: PropTypes.string,
  isLoading: PropTypes.bool,
};

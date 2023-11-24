import React from 'react';
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
}) => {
  const {
    state: {
      item, itemIndex, markdownView,
    },
    actions: {
      setItemIndex,
    },
  } = useCardState({ items });
  console.log({ item });
  console.log('testing');
  return (
    <>
      <TranslationhelpsNav
        classes
        items={items}
        itemIndex={itemIndex}
        setItemIndex={setItemIndex}
      />
      <div style={{ fontFamily: font || 'sans-serif' }}>
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
  markdown: PropTypes.object,
  languageId: PropTypes.string.isRequired,
  selectedQuote: PropTypes.string,
  setQuote: PropTypes.func,
  viewMode: PropTypes.string,
  isLoading: PropTypes.bool,
};

/* eslint-disable react/prop-types */
import React from 'react';
import { CardContent } from 'translation-helps-rcl/dist/components';
import { useCardState } from 'translation-helps-rcl/dist/hooks';
import TranslationhelpsNav from '../TranslationhelpsNav';

function ObsResourceCard({
  selectedQuote,
  setQuote,
  index,
  items = [],
  markdown = null,
  viewMode = 'default',
  verse,
  chapter,
  languageId,
  isLoading,
  setIndex,
  font,
  fontSize,
}) {
  const {
    state: { filters, markdownView },
  } = useCardState({
    items,
    verse,
    chapter,
    selectedQuote,
    setQuote,
  });

  return (
    <>
      <TranslationhelpsNav
        classes
        items={items}
        itemIndex={index}
        setItemIndex={setIndex}
      />
      <div style={{
          fontFamily: font || 'sans-serif',
          fontSize: `${fontSize}rem`,
          lineHeight: (fontSize > 1.3) ? 1.5 : '',
        }}
      >
        <CardContent
          item={[]}
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
}

export default ObsResourceCard;

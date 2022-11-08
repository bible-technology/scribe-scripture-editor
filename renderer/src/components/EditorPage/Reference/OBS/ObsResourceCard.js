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
      <CardContent
        item={[]}
        items={[]}
        filters={filters}
        markdown={markdown}
        languageId={languageId}
        markdownView={markdownView}
        isLoading={isLoading}
        selectedQuote={selectedQuote}
        setQuote={setQuote}
        viewMode={viewMode}
      />
    </>
  );
}

export default ObsResourceCard;

import React from 'react';
import PropTypes from 'prop-types';

import { CardContent } from 'translation-helps-rcl';

const ReferenceCard = ({
  items,
  item,
  filters,
  markdownView,
  markdown,
  languageId,
  selectedQuote,
  setQuote,
  viewMode,
  isLoading,
  font,
}) => {
  console.log({ item });

  return (
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

  );
};

export default ReferenceCard;

ReferenceCard.propTypes = {
  items: PropTypes.array,
  item: PropTypes.object,
  filters: PropTypes.array,
  markdownView: PropTypes.bool,
  markdown: PropTypes.object,
  languageId: PropTypes.string.isRequired,
  selectedQuote: PropTypes.string,
  setQuote: PropTypes.func,
  viewMode: PropTypes.string,
  isLoading: PropTypes.bool,
};

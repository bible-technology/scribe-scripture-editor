/* eslint-disable react/jsx-no-useless-fragment */
import React from 'react';
import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import styled from 'styled-components';

const FlexDiv = styled.div`
  display: flex;
  align-items: center;
`;

const FlexSpacedDiv = styled.div`
  display: flex;
  justify-content: space-between;
`;

const TranslationhelpsNav = ({
  items, classes, itemIndex, setItemIndex,
}) => {
  const onPrevItem = () => {
    const newIndex = itemIndex - 1;
    if (newIndex < 0) {
      setItemIndex(items.length - 1);
    } else {
      setItemIndex(newIndex);
    }
  };

  const onNextItem = () => {
    const newIndex = itemIndex + 1;
    if (newIndex > items.length - 1) {
      setItemIndex(0);
    } else {
      setItemIndex(newIndex);
    }
  };

  return (
    <>
      {items && (
        <FlexSpacedDiv>
          <ChevronLeft
            className={classes.chevronIcon}
            onClick={onPrevItem}
          />
          <FlexDiv>
            {`${itemIndex + 1} of ${items.length}`}
          </FlexDiv>
          <ChevronRight
            className={classes.chevronIcon}
            onClick={onNextItem}
          />
        </FlexSpacedDiv>
      )}
    </>
  );
};

TranslationhelpsNav.propTypes = {
  items: PropTypes.array,
  classes: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
  itemIndex: PropTypes.number,
  setItemIndex: PropTypes.func,
};

export default TranslationhelpsNav;

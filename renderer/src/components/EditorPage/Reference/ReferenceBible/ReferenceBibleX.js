/* eslint-disable no-nested-ternary */
import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { ProjectContext } from '@/components/context/ProjectContext';
import LoadingScreen from '@/components/Loading/LoadingScreen';
import { SnackBar } from '@/components/SnackBar';
import EmptyScreen from '@/components/Loading/EmptySrceen';
import { useReadReferenceUsfmFile } from '@/components/EditorPage/Reference/ReferenceBible/useReadReferenceUsfmFile';
import ReferenceScribex from '../../Scribex/ReferenceScribex';

const ReferenceBibleX = ({
  languageId,
  refName,
  bookId,
  font,
}) => {
  const {
    states: {
      username,
      scrollLock,
    },
  } = useContext(ProjectContext);

  const [isLoading, setIsLoading] = useState(false);
  const [snackBar, setOpenSnackBar] = useState(false);
  const [snackText, setSnackText] = useState();
  const [notify, setNotify] = useState();
  const [displyScreen, setDisplayScreen] = useState(false);

  const { usfmData, bookAvailable } = useReadReferenceUsfmFile({
    bookId,
    refName,
    languageId,
    username,
    scrollLock,
    setIsLoading,
    setOpenSnackBar,
    setSnackText,
    setNotify,
    setDisplayScreen,
  });

  const props = {
    bookId,
    usfmData,
    bookAvailable,
    refName,
    scrollLock,
    font,
  };
  return (

    <span>
      {
        isLoading === false && bookAvailable ? (
          <ReferenceScribex {...props} />
        ) : (
          displyScreen === true ? (
            <EmptyScreen />
          ) : (<LoadingScreen />)
        )
      }

      <SnackBar
        openSnackBar={snackBar}
        snackText={snackText}
        setOpenSnackBar={setOpenSnackBar}
        setSnackText={setSnackText}
        error={notify}
      />
    </span>
  );
};

export default ReferenceBibleX;

ReferenceBibleX.propTypes = {
  languageId: PropTypes.string,
  refName: PropTypes.string,
  chapter: PropTypes.string,
  verse: PropTypes.string,
  bookId: PropTypes.string,
};

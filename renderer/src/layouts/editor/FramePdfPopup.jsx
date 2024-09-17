import React, { useState } from 'react';
import { Modal, Button } from '@mui/material';
import { SnackBar } from '@/components/SnackBar';
import InnerFramePopup from '@/layouts/editor/InnerFramePopup';
import CssBaseline from '@mui/material/CssBaseline';

const tabStyleNotSelected = {
  display: 'flex',
  width: 'fit-content',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 4,
  borderStyle: 'solid',
  fontColor: 'white',
  borderWidth: 2,
  borderColor: '#F50',
  backgroundColor: '#E3E3E3',
  padding: 5,
};

const tabStyleSelected = {
  display: 'flex',
  width: 'fit-content',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 4,
  borderStyle: 'solid',
  fontColor: 'white',
  borderWidth: 2,
  borderColor: '#F50',
  backgroundColor: '#F50',
  padding: 5,
};
const fontStyle = {
  color: '#FFF',
  textAlign: 'center',
  fontFamily: 'Lato',
  fontSize: 20,
  fontStyle: 'normal',
  fontWeight: 700,
  lineHeight: 'normal',
  textTransform: 'uppercase',
};

export default function FramePdfPopup({ openPdfPopup, setOpenPdfPopup }) {
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackText, setSnackText] = useState('');
  const [error, setError] = useState('');
  const [currentTab, setCurrentTab] = useState(0);

  // const removeSection = () => {
  //   setOpenPdfPopup(false);
  // };

  return (
    <>
      <CssBaseline />
      <Modal
        // onClose={removeSection}
        open={openPdfPopup}
        style={{ marginTop: 10 }}>
        <div
          style={{
            flexDirection: 'column',
            display: 'flex',
            marginTop: 10,
            width: '80%',
            alignContent: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            margin: 'auto',
            position: 'relative',
          }}>
          <div
            style={{
              display: 'flex',
              borderRadius: 12,
              justifyContent: 'center',
              alignContent: 'center',
              margin: 'auto',
              flexDirection: 'column',
              width: '100%',
              backgroundColor: '#292A2D',
            }}>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <div
                style={{
                  textAlign: 'center',
                  width: '100%',
                  fontSize: 24,
                  padding: 12,
                  color: 'white',
                }}
                className='text-white font-bold text-sm'>
                Export
              </div>
              <Button
                style={tabStyleSelected}
                onClick={() => setOpenPdfPopup(false)}>
                <div style={fontStyle}>X</div>
              </Button>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                backgroundColor: '#EEEEEE',
                paddingLeft: '30%',
                paddingRight: '30%',
                alignItems: 'center',
                paddingTop: 10,
                paddingBottom: 10,
              }}>
              <div
                onClick={() => setCurrentTab(0)}
                size='tiny'
                style={
                  currentTab === 0
                    ? tabStyleSelected
                    : tabStyleNotSelected
                }>
                <text
                  style={
                    currentTab === 0
                      ? fontStyle
                      : {
                        ...fontStyle,
                        color: 'black',
                      }
                  }>
                  PDF
                </text>
              </div>
              {/* <div
                onClick={() => setCurrentTab(1)}
                style={
                  currentTab === 1
                    ? tabStyleSelected
                    : tabStyleNotSelected
                }>
                <text
                  style={
                    currentTab === 1
                      ? fontStyle
                      : {
                          ...fontStyle,
                          color: 'black',
                        }
                  }>
                  Korennumi
                </text>
              </div> */}
              {/* <div
                onClick={() => setCurrentTab(2)}
                style={
                  currentTab === 2
                    ? tabStyleSelected
                    : tabStyleNotSelected
                }>
                <text
                  style={
                    currentTab === 2
                      ? fontStyle
                      : {
                          ...fontStyle,
                          color: 'black',
                        }
                  }>
                  Word
                </text>
              </div> */}
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#FFFFFF',
              width: '100%',
            }}>
            <div className='h-[85vh] w-full bg-gray-50 items-center justify-between'>
              <div
                style={{ backgroundColor: '#EEEEEE' }}
                className='bg-gray-50 items-center justify-between w-full h-full'>
                {currentTab === 0 ? (
                  <InnerFramePopup />
                ) : (
                  <div>no Tab</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal>
      <SnackBar
        openSnackBar={openSnackBar}
        setOpenSnackBar={setOpenSnackBar}
        snackText={snackText}
        setSnackText={setSnackText}
        error={error}
      />
    </>
  );
}

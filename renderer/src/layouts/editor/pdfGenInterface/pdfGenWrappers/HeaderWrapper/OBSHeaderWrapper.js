import React, { useEffect, useState } from 'react';
import { NumericFormat } from 'react-number-format';
import { TextField } from '@mui/material';
import ImageIcon from '../../../../../../public/icons/basil/Solid/Files/Image.svg';
import { LoopSwitch, TextOnlyTooltip } from '../fieldPicker/customMuiComponent';

export function OBSWrapperSortableList({
  keyWrapper,
  advanceMode,
  changePrintData,
  setLoopMode,
  loopMode,
}) {
  // eslint-disable-next-line
  const NumericFormatCustom = React.forwardRef((
    props,
    ref,
  ) => {
    const { onChange, ...other } = props;

    return (
      <NumericFormat
        {...other}
        getInputRef={ref}
        onChange={(values) => {
          onChange({
            target: {
              name: props.name,
              value: values.value,
            },
          });
        }}
      />
    );
  });

  const [startObs, setStartObs] = useState('');
  const [endObs, setEndObs] = useState('');

  const handleBlurStart = (event) => {
    const newValue = event.target.value.trim(); // Trim any whitespace
    setStartObs(newValue);
  };
  const handleBlurEnd = (event) => {
    const newValue = event.target.value.trim(); // Trim any whitespace
    setEndObs(newValue);
  };

  useEffect(() => {
    changePrintData((prev) => {
      const copyData = { ...prev };
      if (startObs !== '' && endObs !== '') {
        if (parseInt(startObs, 10) <= parseInt(endObs, 10)) {
          copyData[keyWrapper].ranges = [`${startObs}-${endObs}`];
        }
      }
      return copyData;
    });
  }, [startObs, endObs]);

  return (
    <div>
      <div
        style={{
          margin: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center', // Added alignment to center vertically
          fontSize: 24,
          color: 'black',
        }}
      >
        <div style={{ width: 35, height: 35, marginRight: 8 }}>
          <ImageIcon />
        </div>
        Obs
      </div>
      <div
        style={{
          justifyContent: 'space-between',
          display: 'flex',
          padding: 5,
        }}
      >
        <TextField
          label="obs start"
          value={startObs}
          onBlur={handleBlurStart}
          id="formatted-numberformat-input"
          InputProps={{
            inputComponent: NumericFormatCustom,
          }}
          variant="standard"
        />
        <TextField
          label="obs end"
          value={endObs}
          onBlur={handleBlurEnd}
          id="formatted-numberformat-input"
          InputProps={{
            inputComponent: NumericFormatCustom,
          }}
          variant="standard"
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'left' }}>
        {advanceMode ? (
          <div>
            <TextOnlyTooltip
              placement="top-end"
              title={(
                <div>
                  <div
                    style={{
                      fontSize: 14,
                      fontStyle: 'normal',
                      fontWeight: 600,
                    }}
                  >
                    Loop mode
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontStyle: 'normal',
                      fontWeight: 400,
                    }}
                  >
                    Projects in the loop are added one by one to the document,
                    for each story selected above.
                  </div>
                </div>
              )}
              arrow
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: 'black',
                }}
              >
                Loop mode
              </div>
              <LoopSwitch
                defaultChecked={loopMode}
                onChange={() => setLoopMode((prev) => !prev)}
              />
            </TextOnlyTooltip>
          </div>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}

import * as React from 'react';
import PropTypes from 'prop-types';
import {
  Box, CircularProgress, Typography,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const progressCircletheme = createTheme({
  // older versions
  overrides: {
    MuiTypography: {
      body2: {
        fontSize: [10, '!important'],
        fontWeight: ['bold'],
      },
    },
  },
});

function CircularProgressWithLabel({ value, circleSize }) {
  return (
    <ThemeProvider theme={progressCircletheme}>
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress
          variant="determinate"
          value={value}
          color="secondary"
          size={circleSize || '2.2rem'}
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
          >
            {`${Math.round(
              value,
            )}%`}
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

CircularProgressWithLabel.propTypes = {
  /**
   * The value of the progress indicator for the determinate and buffer variants.
   * Value between 0 and 100.
   */
  value: PropTypes.number.isRequired,
};

export default function CircularWithValueLabel({
  currentValue, totalValue, circleSize = '2.2rem', width = '11%',
}) {
  const [progress, setProgress] = React.useState(0);
  React.useEffect(() => {
    // console.log(currentValue, totalValue);
    const calculated = ((currentValue * 100) / totalValue);
    setProgress(calculated);
  }, [currentValue, totalValue]);

  return (
    // <div className="h-full items-center justify-center flex">
    //     <Box sx={{ width: '100%' }}>
    //     <LinearProgressWithLabel value={progress} />
    //     </Box>
    // </div>
    <Box sx={{ width }}>
      <CircularProgressWithLabel value={progress} circleSize={circleSize} />
    </Box>
  );
}

CircularWithValueLabel.propTypes = {
  currentValue: PropTypes.number.isRequired,
  totalValue: PropTypes.number.isRequired,
};

import * as React from 'react';
import PropTypes from 'prop-types';
import { CheckIcon } from '@heroicons/react/24/outline';
import {
  Box, Paper, Step, StepContent, StepLabel, Stepper, Typography,
} from '@mui/material';

export function VerticalLinearStepper({ stepCount, steps, successMsg }) {
  const [activeStep, setActiveStep] = React.useState(0);

  React.useEffect(() => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  }, [stepCount]);

  const handleReset = () => {
    setActiveStep(0);
  };

  // const handleNext = () => {
  //     setActiveStep((prevActiveStep) => prevActiveStep + 1);
  // };

  React.useEffect(() => {
    handleReset();
  }, []);

  return (
    <Box sx={{ maxWidth: 400 }}>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel
              optional={
                index === 2 ? (
                  <Typography variant="caption" />
                ) : null
              }
            >
              {step.label}
            </StepLabel>
            <StepContent>
              <Typography>{step.description}</Typography>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      {/* <button className="bg-primary" onClick={handleNext}>Next</button> */}
      {activeStep === steps.length && (
        <Paper square elevation={0} sx={{ p: 3 }}>
          <div className="bg-gray-100 flex justify-center items-center">
            <div className="tracking-wider p-3 text-black flex ">
              <Typography className="font-medium">{successMsg}</Typography>
            </div>
            <div
              className="bg-success w-7 h-7  text-white text-sm rounded-full flex justify-center items-center"
              aria-hidden="true"
            >
              <CheckIcon className="w-4" />
            </div>
          </div>
        </Paper>
      )}
    </Box>
  );
}

VerticalLinearStepper.propTypes = {
  steps: PropTypes.array.isRequired,
  stepCount: PropTypes.number,
  successMsg: PropTypes.string,
};

// export default function VerticalStepperProgress() {
// //   const [progress, setProgress] = React.useState(0);
// //   React.useEffect(() => {
// //     // console.log(currentValue, totalValue);
// //     const calculated = ((currentValue * 100) / totalValue);
// //     setProgress(calculated);
// //   }, [currentValue, totalValue]);

//   return (
//     <Box sx={{ width: '100%' }}>
//       <VerticalLinearStepper />
//     </Box>
//   );
// }

// VerticalStepperProgress.propTypes = {
// //   currentValue: PropTypes.number.isRequired,
// //   totalValue: PropTypes.number.isRequired,
// };

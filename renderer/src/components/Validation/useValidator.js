import React from 'react';
import { countErrors, validateForm, validEmailRegex } from './helper';

export default function useValidator() {
  const [formValid, setFormValid] = React.useState(false);
  const [errorCount, setErrorCount] = React.useState(null);
  const [errors, setErrors] = React.useState({
    namefield: '',
    lastname: '',
    password: '',
    email: '',
  });

  const handleFields = (event) => {
    event.preventDefault();
    const { name, value } = event.target;

    switch (name) {
    case 'name':
      errors.namefield = value.length < 5 ? 'Full Name must be 5 characters long!' : '';
      break;
    case 'email':
      errors.email = validEmailRegex.test(value) ? '' : 'Email is not valid!';
      break;
    case 'password':
      errors.password = value.length < 8 ? 'Password must be 8 characters long!' : '';
      break;
    default:
      break;
    }
    setErrors(errors);
  };

  const handleSubmitFields = (event) => {
    event.preventDefault();
    setFormValid(validateForm(errors));
    setErrorCount(countErrors(errors));
  };

  return {
    state: {
      formValid,
      errorCount,
      errors,
    },
    action: {
      setFormValid,
      setErrorCount,
      setErrors,
      handleFields,
      handleSubmitFields,
    },
  };
}

import { useTranslation } from 'react-i18next';
import { validEmailRegex } from '../Validation/helper';
import * as logger from '../../logger';

export default function useValidator() {
  const { t } = useTranslation();

  const isRequiered = (data, fieldName) => {
    logger.debug('useValidator.js', 'In isLengthValidated for validating the length of a string');
    const errors = { };
    if (data?.trim().length === 0) {
      errors.message = `${fieldName} is Requiered`;
      errors.isValid = false;
    } else {
      errors.message = '';
      errors.isValid = true;
    }
    return errors;
  };

  const isLengthValidated = (data, len) => {
    logger.debug('useValidator.js', 'In isLengthValidated for validating the length of a string');
    const errors = { };
    if (data.length > len.maxLen || data.length < len.minLen) {
      errors.message = t('dynamic-msg-validate-hook-project-name', { minLen: len.minLen, maxLen: len.maxLen });
      errors.isValid = false;
    } else {
      errors.message = '';
      errors.isValid = true;
    }
    return errors;
  };
  const isTextValidated = (data, name) => {
    logger.debug('useValidator.js', 'In isTextValidated for validating the type of text');
    const errors = { };
    switch (name) {
    case 'onlyNum':
      errors.message = /^\d+$/.test(data) ? '' : t('dynamic-msg-validate-hook-onlyNum');
      errors.isValid = !!/^\d+$/.test(data);
      break;
    case 'onlyString':
      errors.message = /^[A-Za-z]+$/.test(data) ? '' : t('dynamic-msg-validate-hook-onlyString');
      errors.isValid = !!/^[A-Za-z]+$/.test(data);
      break;
    case 'nonSpecChar':
      errors.message = /^[\w\s]+$/.test(data) ? '' : t('dynamic-msg-validate-hook-nonSpecChar');
      errors.isValid = !!/^[\w\s]+$/.test(data);
      break;
    case 'alphaNum':
      errors.message = /^[A-Za-z0-9]+$/.test(data) ? '' : t('dynamic-msg-validate-hook-alphaNum');
      errors.isValid = !!/^[A-Za-z0-9]+$/.test(data);
      break;
    case 'charSpace':
      errors.message = /^[A-Za-z\s]+$/.test(data) ? '' : t('dynamic-msg-validate-hook-onlyString');
      errors.isValid = !!/^[A-Za-z\s]+$/.test(data);
      break;
    case 'email':
      errors.message = validEmailRegex.test(data) ? '' : t('dynamic-msg-validate-hook-email');
      errors.isValid = !!validEmailRegex.test(data);
      break;
    case 'alphaNumHiphen':
      errors.message = /^[a-zA-Z]+(?:-?[a-zA-Z0-9]+)+$/.test(data) ? '' : 'Only Allowed Alphanum and single hiphen between character.Code should start and end with letter.';
      errors.isValid = !!/^[a-zA-Z]+(?:-?[a-zA-Z0-9]+)+$/.test(data);
      break;
    case 'bcp47Language':
      errors.message = /^(((en-GB-oed|i-ami|i-bnn|i-default|i-enochian|i-hak|i-klingon|i-lux|i-mingo|i-navajo|i-pwn|i-tao|i-tay|i-tsu|sgn-BE-FR|sgn-BE-NL|sgn-CH-DE)|(art-lojban|cel-gaulish|no-bok|no-nyn|zh-guoyu|zh-hakka|zh-min|zh-min-nan|zh-xiang))|((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+))$/.test(data) ? '' : 'Expecting valid IETF language tag as specified by BCP 47,  eg : en , es-419 , tlr-x-kuma ';
      errors.isValid = !!/^(((en-GB-oed|i-ami|i-bnn|i-default|i-enochian|i-hak|i-klingon|i-lux|i-mingo|i-navajo|i-pwn|i-tao|i-tay|i-tsu|sgn-BE-FR|sgn-BE-NL|sgn-CH-DE)|(art-lojban|cel-gaulish|no-bok|no-nyn|zh-guoyu|zh-hakka|zh-min|zh-min-nan|zh-xiang))|((([A-Za-z]{2,3}(-([A-Za-z]{3}(-[A-Za-z]{3}){0,2}))?)|[A-Za-z]{4}|[A-Za-z]{5,8})(-([A-Za-z]{4}))?(-([A-Za-z]{2}|[0-9]{3}))?(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*(-([0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+))*(-(x(-[A-Za-z0-9]{1,8})+))?)|(x(-[A-Za-z0-9]{1,8})+))$/.test(data);
      break;
    default:
      break;
    }
    return errors;
  };
  const validateField = (val) => val;

  return {
    action: {
      validateField,
      isLengthValidated,
      isTextValidated,
      isRequiered,
    },
  };
}

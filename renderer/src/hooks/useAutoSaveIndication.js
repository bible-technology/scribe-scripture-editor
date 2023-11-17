import React, { useContext, useEffect } from 'react';
import { ProjectContext } from '@/components/context/ProjectContext';
import SaveIndicator from '@/components/Loading/SaveIndicator';
import { useTranslation } from 'react-i18next';

export const useAutoSaveIndication = (isSaving) => {
const {
  actions: { setEditorSave },
} = useContext(ProjectContext);
const { t } = useTranslation();

const autoSaveIndication = () => {
  setEditorSave(<SaveIndicator />);
  setTimeout(() => {
    setEditorSave(t('label-saved'));
  }, 1000);
};
useEffect(() => {
  if (isSaving) {
    autoSaveIndication();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [isSaving]);
};

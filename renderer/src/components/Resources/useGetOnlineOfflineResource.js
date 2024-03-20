/* eslint-disable no-undef */
export default function getCurrentOnlineOfflineHelpsResources(selectResource) {
  const resources = [
    // Nicolas : add juxtalinear here ?
    { id: 'jxl', title: 'Juxtalinear', resource: juxtalinear },
    { id: 'tn', title: t('label-resource-tn'), resource: translationNote },
    { id: 'twlm', title: t('label-resource-twl'), resource: translationWordList },
    { id: 'tw', title: t('label-resource-twlm'), resource: translationWord },
    { id: 'tq', title: t('label-resource-tq'), resource: translationQuestion },
    { id: 'ta', title: t('label-resource-ta'), resource: translationAcademy },
    { id: 'obs-tn', title: t('label-resource-obs-tn'), resource: obsTranslationNote },
    { id: 'obs-tq', title: t('label-resource-obs-tq'), resource: obsTranslationQuestion }];
  const reference = resources.find((r) => r.id === selectResource);
  const offlineResource = subMenuItems ? subMenuItems?.filter((item) => item?.value?.agOffline && item?.value?.dublin_core?.identifier === selectResource) : [];
  return { reference, offlineResource };
}

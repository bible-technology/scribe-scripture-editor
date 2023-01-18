/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import RemoveResource from '@/components/Resources/ResourceUtils/RemoveResource';
import CheckHelpsUpdatePopUp from '@/components/Resources/ResourceUtils/CheckHelpsUpdatePopUp';
import { ProjectContext } from '@/components/context/ProjectContext';
import readLocalResources from './useReadLocalResources';
import LoadingScreen from '../Loading/LoadingScreen';

export default function ObsBibleAudioTab({
  selectResource,
  filteredBibleObsAudio,
  handleRowSelect,
  setfilteredBibleObsAudio,
  loading,
  setSubMenuItems,
  subMenuItems,
}) {
  const { t } = useTranslation();
  const [renderApp, setRenderApp] = useState(false);
  const {
    states: {
      username,
    },
  } = useContext(ProjectContext);
  const resourceMap = [
    { resourceType: 'bible', flavorName: 'textTranslation' },
    { resourceType: 'obs', flavorName: 'textStories' },
    { resourceType: 'audio', flavorName: 'audioTranslation' },
  ];
  const currentResourceType = resourceMap.find((resourceItem) => resourceItem.resourceType === selectResource);

  useEffect(() => { // LOADS  locally available
    readLocalResources(username, setSubMenuItems);
    if (renderApp === true) {
      setRenderApp(false);
    }
  }, [renderApp]);

  useEffect(() => {
    const resourceName = (selectResource === 'bible')
      ? 'textTranslation' : (selectResource === 'obs')
        ? 'textStories' : (selectResource === 'audio') ? 'audioTranslation' : '';
    const resourceArray = subMenuItems?.filter((ref) => ref?.value?.type?.flavorType?.flavor?.name === resourceName);
    setfilteredBibleObsAudio(resourceArray);
  }, [selectResource, loading, subMenuItems]);
  return (
    <div>
      {loading ? (
        <div className="relative w-full h-full max-h-sm scrollbars-width overflow-auto ">
          <LoadingScreen />
        </div>
      )
        : (
          <div>
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  <th colSpan={2} className="px-5 py-3 font-bold text-gray-700 uppercase tracking-wider">
                    {t('label-name')}
                  </th>
                  <th className="px-5 py-3 font-bold text-gray-700 uppercase tracking-wider">
                    {t('label-language')}
                  </th>
                  <th colSpan={3} />
                </tr>
              </thead>

              {selectResource === currentResourceType.resourceType && (
                <tbody>
                  {filteredBibleObsAudio?.length > 0 && (
                    filteredBibleObsAudio.map((ref) => (ref?.value?.type?.flavorType?.flavor?.name === currentResourceType.flavorName
                      ? (
                        <tr className="hover:bg-gray-200" key={ref.value.identification.name.en + ref.projectDir}>

                          <td colSpan={2} className="p-2">
                            <div
                              className="focus:outline-none"
                              onClick={(e) => handleRowSelect(
                                e,
                                ref.value.languages[0].name.en,
                                ref.projectDir,
                                '',
                                ref.value.type.flavorType.name,
                                ref.type,
                              )}
                              role="button"
                              tabIndex="0"
                            >
                              {ref.value.identification.name.en}
                              <span className="text-xxs lowercase text-gray-800 px-2 py-1 mx-1 bg-gray-200 rounded-full">
                                {ref.projectDir}
                              </span>
                            </div>
                          </td>
                          <td className="p-2 uppercase">
                            <div
                              className="focus:outline-none"
                              onClick={(e) => handleRowSelect(
                                e,
                                ref.value.languages[0].name.en,
                                ref.projectDir,
                                '',
                                (selectResource !== 'audio' ? ref.value.type.flavorType.name : ref.value.type.flavorType.flavor.name),
                              )}
                              role="button"
                              tabIndex="0"
                            >
                              {ref.value.languages[0].name.en}
                            </div>
                          </td>
                          {selectResource !== 'audio'
                            && (
                              <>
                                <td className="p-2 text-gray-600">
                                  <div
                                    className="focus:outline-none"
                                    onClick={(e) => handleRowSelect(
                                      e,
                                      ref.value.languages[0].name.en,
                                      ref.projectDir,
                                      '',
                                      ref.value.type.flavorType.name,
                                      ref.type,
                                    )}
                                    role="button"
                                    tabIndex="0"
                                  >
                                    {ref?.value?.resourceMeta && (ref.value.resourceMeta.released).split('T')[0]}
                                  </div>
                                </td>
                                <td className="p-2 text-gray-600">
                                  <div
                                    className="focus:outline-none"
                                    onClick={(e) => handleRowSelect(
                                      e,
                                      ref.value.languages[0].name.en,
                                      ref.projectDir,
                                      '',
                                      ref.value.type.flavorType.name,
                                      ref.type,
                                    )}
                                    role="button"
                                    tabIndex="0"
                                  >
                                    {ref?.value?.resourceMeta && ref?.value?.resourceMeta?.release.tag_name}
                                  </div>
                                </td>
                              </>
                            )}
                          <td className="p-2">
                            <div className="flex justify-center items-center gap-4">
                              <div className="text-xxs text-gray-400">
                                {ref?.value?.resourceMeta && ref?.value?.resourceMeta?.lastUpdatedAg.split('T')[0]}
                              </div>
                              <div className="flex justify-center items-center gap-4">
                                {ref?.value?.resourceMeta?.released
                                  && (
                                    <CheckHelpsUpdatePopUp resource={ref} selectResource={selectResource} />
                                  )}
                                {selectResource !== 'audio'
                                  && (
                                    <RemoveResource
                                      resource={ref}
                                      selectResource={selectResource}
                                      setRenderApp={setRenderApp}
                                    />
                                  )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : null
                    ))
                  )}
                </tbody>
              )}
            </table>
          </div>
        )}
    </div>
  );
}

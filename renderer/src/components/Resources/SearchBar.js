import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';

import handleChangeQuery from './useHandleChangeQuery';

export default function SearchBar({
  currentFullResources,
  selectResource,
  setFilteredResources,
  subMenuItems,
  setfilteredBibleObsAudio,
  selectedPreProd,
  setSelectedPreProd,
}) {
  const { t } = useTranslation();

  return (
    <div className="flex justify-end items-center gap-10">
      {(selectResource !== 'obs' && selectResource !== 'bible' && selectResource !== 'twlm' && selectResource !== 'audio')
        && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              className="bg-gray-50 border-gray-300  focus:shadow-none focus:ring-white focus:ring-0 h-4 w-4 rounded"
              id="pre-prod"
              checked={selectedPreProd}
              onChange={(e) => setSelectedPreProd(e.target.checked)}
            />
            <label className="text-black text-xs uppercase font-bold">
              {t('label-pre-release')}
            </label>
          </div>
        )}
      <div className="relative">
        <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 my-2 text-gray-500" />
        <input
          type="search"
          name="search_box"
          id="search_box"
          autoComplete="given-name"
          placeholder={t('label-search')}
          onChange={(e) => handleChangeQuery(e.target.value, currentFullResources, selectResource, setFilteredResources, subMenuItems, setfilteredBibleObsAudio)}
          className="pl-8 bg-gray-100 w-72 h-8 flex text-black items-center border border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-gray-400 focus:border-gray-100"
        />
      </div>
    </div>
  );
}

/* eslint-disable no-nested-ternary */
const handleChangeQuery = (query, resourceData, selectResource, setFilteredResources, subMenuItems, setfilteredBibleObsAudio) => {
  const filtered = { offlineResource: [], onlineResource: { ...resourceData?.reference } || {} };
  if (['tn', 'tir', 'tw', 'tq', 'ta', 'obs-tn', 'obs-tq', 'twlm', 'obs-twlm'].includes(selectResource?.toLowerCase())) {
    if (query?.length > 0) {
      filtered.offlineResource = resourceData?.offlineResource?.filter((data) => {
        const meta = data?.value?.meta;
        const searchFields = ['language', 'language_title', 'name', 'full_name', 'owner'].map((v) => v.toLowerCase());
        return searchFields.some((key) => meta[key].toLowerCase().includes(query.toLowerCase()));
      });
      filtered.onlineResource.resource = [];
      resourceData?.reference?.resource?.forEach((data) => {
        const searchFields = ['language', 'name', 'owner'].map((v) => v.toLowerCase());
        if (searchFields.some((key) => data[key].toLowerCase().includes(query.toLowerCase()))) {
          filtered?.onlineResource?.resource?.push(data);
        }
      });
      setFilteredResources(filtered);
    } else {
      filtered.offlineResource = resourceData?.offlineResource;
      filtered.onlineResource = resourceData?.reference;
      setFilteredResources(filtered);
    }
  } else if (['bible', 'obs', 'audio'].some((item) => item === selectResource)) {
    const resourceName = (selectResource === 'bible')
      ? 'textTranslation' : (selectResource === 'obs')
        ? 'textStories' : (selectResource === 'audio') ? 'audioTranslation' : '';
    const resourceArray = subMenuItems?.filter((ref) => ref?.value?.type?.flavorType?.flavor?.name === resourceName);
    if (query?.length > 0) {
      // eslint-disable-next-line array-callback-return
      const resourceFilter = resourceArray?.filter((item) => {
        if (item?.projectDir.toLowerCase().includes(query.toLowerCase())
          || item?.value?.identification?.name?.en?.toLowerCase().includes(query.toLowerCase())
          || item?.value?.languages[0]?.name?.en?.toLowerCase().includes(query.toLowerCase())
          || item?.value?.languages[0]?.tag?.toLowerCase().includes(query.toLowerCase())) {
          return item;
        }
      });
      setfilteredBibleObsAudio(resourceFilter);
    } else {
      setfilteredBibleObsAudio(resourceArray);
    }
  }
};

export default handleChangeQuery;

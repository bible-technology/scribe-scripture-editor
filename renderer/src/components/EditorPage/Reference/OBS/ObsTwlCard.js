/* eslint-disable react/prop-types */
import React, {
  useContext,
  useEffect,
  useState,
} from 'react';
import { ReferenceContext } from '@/components/context/ReferenceContext';
import { ProjectContext } from '@/components/context/ProjectContext';
import LoadingScreen from '@/components/Loading/LoadingScreen';
import { getObsTn } from './getObsTn';
import ObsResourceCard from './ObsResourceCard';
// import * as logger from '../../../../logger';

function ObsTwlCard({
  resource,
  chapter,
  frame,
  languageId,
  classes,
  setQuote,
  selectedQuote,
  owner,
  resourceId,
  offlineResource,
  font,
  fontSize,
  ...props
}) {
  const [index, setIndex] = useState(1);
  const [items, setItems] = useState([]);
  const [markdown, setMarkdown] = useState();
  const [story, setStory] = useState([]);

  const {
    state: {
      selectedStory,
    },
  } = useContext(ReferenceContext);
  const {
    states: {
      scrollLock,
      selectedProjectMeta,
    },
  } = useContext(ProjectContext);
  useEffect(() => {
    const flavor = selectedProjectMeta?.type?.flavorType?.flavor?.name;
    if (selectedStory && scrollLock === false) {
      const i = items.findIndex((e) => (e[0].name)?.toString().padStart(2, '0') === (selectedStory - 1)?.toString().padStart(2, '0'));
      if (i > -1) {
        setStory(items[i]);
        setMarkdown(items[i][0]?.OccurrenceNote ? items[i][0]?.OccurrenceNote : 'No Content Available for the selected Line');
        setIndex(0);
      } else {
        setMarkdown('No Content Available for the selected Line');
        setStory([]);
        setIndex(-1);
      }
    } else if (items.length !== 0 && ((scrollLock === true && flavor === 'textStories') || flavor !== 'textStories')) {
      setStory(items);
      setIndex(0);
    } else {
      setMarkdown('No Content Available for the selected Line');
      setStory([]);
      setIndex(-1);
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStory, items]);
  useEffect(() => {
    if (items.length !== 0 && resourceId === 'obs-twl') {
      setMarkdown(story[index]?.OccurrenceNote ? story[index]?.OccurrenceNote : 'No Content Available for the selected Line');
    } else {
      setMarkdown('');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);
  useEffect(() => {
    async function fetchData() {
      const flavor = selectedProjectMeta?.type?.flavorType?.flavor?.name;
      await getObsTn(owner, `${languageId}_${resourceId}`, `content/${chapter.toString().padStart(2, 0)}`, chapter, languageId, scrollLock, flavor)
      .then((data) => {
        setItems(data);
      });
    }

    setItems([]);
    setIndex(1);
    if (offlineResource && !offlineResource.offline && selectedProjectMeta?.type?.flavorType?.flavor?.name) {
      fetchData();
    }
  }, [chapter, languageId, owner, resourceId, offlineResource, scrollLock, selectedProjectMeta?.type?.flavorType?.flavor?.name]);
  return (
    markdown ? (
      <ObsResourceCard
        {...props}
        chapter={chapter}
        verse={frame}
        items={story}
        selectedQuote={selectedQuote}
        setQuote={setQuote}
        markdown={markdown}
        languageId={languageId}
        classes={classes}
        shouldSetQuoteOnClick
        index={index}
        setIndex={(v) => setIndex(v)}
        font={font}
        fontSize={fontSize}
      />
    ) : (
      <LoadingScreen />
    )
  );
}

export default ObsTwlCard;

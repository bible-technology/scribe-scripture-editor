'use client';

import { useState, useEffect, useContext } from 'react';
import dynamic from 'next/dynamic';
import localforage from 'localforage';
import ObsEditor from '@/components/EditorPage/ObsEditor/ObsWebEditor';
import AudioEditor from '@/components/EditorPage/AudioEditor/AudioEditor';
import { ScribexContext } from '@/components/context/ScribexContext';
import { useReadUsfmFile } from '@/components/hooks/scribex/useReadUsfmFile';
import Scribex from '@/components/EditorPage/Scribex/Scribex'; // eslint-disable-line
import SectionPlaceholder1 from './WebSectionPlaceholder1';
import SectionPlaceholder2 from './WebSectionPlaceholder2';
import { newPath, sbStorageDownload } from '../../../../supabase';
// if (!process.env.NEXT_PUBLIC_IS_ELECTRON) {
//   const supabaseStorage = require('../../../../../supabase').supabaseStorage
//   const newPath = require('../../../../supabase').newPath
// }

const MainPlayer = dynamic(
  () => import('@/components/EditorPage/AudioEditor/MainPlayer'),
  { ssr: false },
);
const SectionContainer = () => {
  const [editor, setEditor] = useState();

  useEffect(() => {
    const setSupabaseEditor = async () => {
      const userProfile = await localforage.getItem('userProfile');
      const username = userProfile?.user?.email;
      const projectName = await localforage.getItem('currentProject');
      const { data } = await sbStorageDownload(`${newPath}/${username}/projects/${projectName}/metadata.json`);
      const metadata = JSON.parse(await data.text());
      setEditor(metadata.type.flavorType.flavor.name);
    };

    setSupabaseEditor();
  }, [editor]);

  const { usfmData, bookAvailable } = useReadUsfmFile();
  const { state, actions } = useContext(ScribexContext);
  const props = {
    usfmData,
    bookAvailable,
    state,
    actions,
  };

  return (
    <>
      <div className="grid grid-flow-col auto-cols-fr m-3 gap-2">
        <SectionPlaceholder1 editor={editor} />
        <SectionPlaceholder2 editor={editor} />
        {(editor === 'textTranslation' && <Scribex {...props} />)
          || (editor === 'textStories' && <ObsEditor />)
          || (editor === 'audioTranslation' && <AudioEditor editor={editor} />)}
      </div>
      {(editor === 'audioTranslation' && (<MainPlayer />))}
    </>
  );
};
export default SectionContainer;

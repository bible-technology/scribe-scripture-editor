'use client';

import { useState, useEffect, useContext } from 'react';
import dynamic from 'next/dynamic';
import localforage from 'localforage';
import ObsEditor from '@/components/EditorPage/ObsEditor/ObsEditor';
import AudioEditor from '@/components/EditorPage/AudioEditor/AudioEditor';
import TextEditor from '@/components/EditorPage/TextEditor'; // eslint-disable-line
import SectionPlaceholder1 from './WebSectionPlaceholder1';
import SectionPlaceholder2 from './WebSectionPlaceholder2';
import { newPath, sbStorageDownload } from '../../../../supabase';

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

  return (
    <>
      <div className="grid grid-flow-col auto-cols-fr m-3 gap-2">
        <SectionPlaceholder1 editor={editor} />
        <SectionPlaceholder2 editor={editor} />
        {(editor === 'textTranslation' && <TextEditor />)
          || (editor === 'textStories' && <ObsEditor />)
          || (editor === 'audioTranslation' && <AudioEditor editor={editor} />)}
      </div>
      {(editor === 'audioTranslation' && (<MainPlayer />))}
    </>
  );
};
export default SectionContainer;

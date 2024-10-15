import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import localforage from 'localforage';
import ObsEditor from '@/components/EditorPage/ObsEditor/ObsEditor';
import AudioEditor from '@/components/EditorPage/AudioEditor/AudioEditor';
import packageInfo from '../../../../package.json';
import SectionPlaceholder1 from './SectionPlaceholder1';
import SectionPlaceholder2 from './SectionPlaceholder2';
import TextEditor from '@/components/EditorPage/TextEditor'; // eslint-disable-line 
import JuxtaTextEditor from '@/components/EditorPage/JuxtaTextEditor'; // eslint-disable-line 

const MainPlayer = dynamic(
  () => import('@/components/EditorPage/AudioEditor/MainPlayer'),
  { ssr: false },
);

const SectionContainer = () => {
  const [editor, setEditor] = useState();

  useEffect(() => {
    localforage.getItem('userProfile').then((value) => {
      const username = value?.username;
      localforage.getItem('currentProject').then((projectName) => {
        const path = require('path');
        const fs = window.require('fs');
        const newpath = localStorage.getItem('userPath');
        const metaPath = path.join(newpath, packageInfo.name, 'users', username, 'projects', projectName, 'metadata.json');
        const data = fs.readFileSync(metaPath, 'utf-8');
        const metadata = JSON.parse(data);
        setEditor(metadata.type.flavorType.flavor.name);

        if (metadata.type.flavorType.flavor.name === 'textTranslation') {
          // Check for project_cache folder and create if it doesn't exist
          const projectCachePath = path.join(newpath, packageInfo.name, 'users', username, 'project_cache', projectName);
          if (!fs.existsSync(projectCachePath)) {
            fs.mkdirSync(projectCachePath, { recursive: true });
          }

          // Check for fileCacheMap.json and create if it doesn't exist
          const fileCacheMapPath = path.join(projectCachePath, 'fileCacheMap.json');
          if (!fs.existsSync(fileCacheMapPath)) {
            fs.writeFileSync(fileCacheMapPath, JSON.stringify({}), 'utf-8');
          }
        }
      });
    });
  }, [editor]);

  return (
    <>
      <div className="grid grid-flow-col auto-cols-fr m-3 gap-2">
        <SectionPlaceholder1 editor={editor} />
        <SectionPlaceholder2 editor={editor} />
        {(editor === 'textTranslation' && <TextEditor />)
          || (editor === 'textStories' && <ObsEditor />)
          || (editor === 'x-juxtalinear' && <JuxtaTextEditor />)
          || (editor === 'audioTranslation' && <AudioEditor editor={editor} />)}
      </div>
      {(editor === 'audioTranslation' && (<MainPlayer />))}
    </>
  );
};
export default SectionContainer;

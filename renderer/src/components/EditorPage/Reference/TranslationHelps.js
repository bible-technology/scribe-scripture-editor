import React, { useContext, useState, useEffect } from 'react';
import * as localforage from 'localforage';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { ReferenceContext } from '@/components/context/ReferenceContext';
import { debug } from '../../../logger';
import TranslationHelpsCard from './TranslationHelpsCard';
import TranslationHelpsMultimediaCard from './TranslationHelpsMultimediaCard';
import ObsTnCard from './OBS/ObsTn';
import ObsTwlCard from './OBS/ObsTwlCard';
import packageInfo from '../../../../../package.json';

const TranslationHelps = ({
  selectedResource, languageId, refName, bookId, chapter, verse, owner, story, offlineResource, font, fontSize,
}) => {
  const {
    state: {
      branch,
      taNavigationPath,
    },
  } = useContext(ReferenceContext);
  const { t } = useTranslation();

  /**
   * Function to search a directory for a file containing a specific name part.
   * @param {string} directoryPath - The path of the directory to search in.
   * @param {string} partialName - The partial name to search for in the file names.
   * @returns {string|null} - The full name of the matched file, or null if not found.
   */
  const findFileByPartialName = (fsInstance, directoryPath, partialName) => fsInstance.readdirSync(directoryPath).find((file) => file.includes(partialName)) || null;

  const translationQuestionsPath = `${(chapter < 10) ? (`0${ chapter}`)
    : chapter}/${(verse < 10) ? (`0${ verse}`) : verse}.md`;

  const filePathTa = `${taNavigationPath?.path}/01.md`;

  const [resourceLinkPath, setResourceLinkPath] = useState('');
  const [imagesPath, setImagesPath] = useState('');
  const [metadata, setMetadata] = useState(null);

  useEffect(() => {
    async function getLinkedFolderPath() {
      const fs = window.require('fs');
      const path = window.require('path');
      try {
        const newpath = localStorage.getItem('userPath');
        const userProfile = await localforage.getItem('userProfile');
        const resourceDirPath = path.join(newpath, packageInfo.name, 'users', userProfile?.username, 'resources');
        const pathToIngredients = path.join(resourceDirPath, offlineResource.data.projectDir, 'ingredients');
        const metadataPath = path.join(resourceDirPath, offlineResource.data.projectDir, 'metadata.json');
        if (pathToIngredients) {
          const pathRelationFile = path.join(pathToIngredients, 'relation.txt');
          if (fs.existsSync(pathRelationFile)) {
            setImagesPath(pathToIngredients);
            const relationFileContent = fs.readFileSync(pathRelationFile, 'utf8');
            const fileName = findFileByPartialName(fs, path.join(resourceDirPath), relationFileContent.trim());
            setResourceLinkPath(path.join(resourceDirPath, fileName, 'ingredients'));
          } else {
            setImagesPath('');
            setResourceLinkPath(pathToIngredients);
            debug('TranslationHelps.js', `pathRelationFile : ${pathRelationFile} - Not found!`);
          }
          if (fs.existsSync(metadataPath)) {
            const metadataContent = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
            setMetadata(metadataContent);
          }
        }
      } catch (e) {
        debug('TranslationHelps.js', `Error : ${e}`);
      }
    }

    getLinkedFolderPath();
  }, [selectedResource, offlineResource]);

  return (
    <>
      {(() => {
        switch (selectedResource) {
        case 'tn':
        case 'x-bcvnotes':
          return (
            <TranslationHelpsCard
              title={t('label-resource-tn')}
              verse={verse}
              chapter={chapter}
              projectId={bookId || 'mat'}
              branch={branch}
              languageId={languageId}
              resourceId="tn"
              owner={owner}
              server="https://git.door43.org"
              offlineResource={offlineResource}
              font={font}
              fontSize={fontSize}
            />
          );
        case 'tir':
          if (resourceLinkPath !== '' && metadata !== null) {
            return (
              <TranslationHelpsMultimediaCard
                title={t('label-resource-tir')}
                verse={verse}
                chapter={chapter}
                projectId={bookId.toUpperCase() || 'mat'.toUpperCase()}
                branch={branch}
                languageId={languageId}
                resourceId="tir"
                owner={owner}
                server="https://git.door43.org"
                offlineResource={offlineResource}
                font={font}
                fontSize={fontSize}
                folderPath={resourceLinkPath}
                linkedFolderPath={imagesPath}
                metadata={metadata}
              />
            );
          }
          break;
        // case 'twl':
          // return (
          // <TranslationHelpsCard
          // title={t('label-resource-twl')}
          // verse={verse}
          // chapter={chapter}
          // projectId={bookId || 'mat'}
          // branch="master"
          // viewMode="list"
          // languageId="en"
          // resourceId="twl"
          // owner="test_org"
          // server="https://git.door43.org"
          // font={font}
          // fontSize={fontSize}
          /// >
          // );
        case 'twlm':
          return (
            <TranslationHelpsCard
              title={t('label-resource-twlm')}
              verse={verse}
              chapter={chapter}
              projectId={bookId || 'mat'}
              branch={branch}
              viewMode="markdown"
              languageId={languageId}
              resourceId="twl"
              owner={owner}
              server="https://git.door43.org"
              font={font}
              fontSize={fontSize}
            />
          );
        case 'tq':
          return (
            <TranslationHelpsCard
              title={t('label-resource-tq')}
              verse={verse}
              chapter={chapter}
              projectId={bookId || 'mat'}
              branch={branch}
              viewMode="question"
              languageId={languageId}
              resourceId="tq"
              filePath={translationQuestionsPath}
              owner={owner}
              server="https://git.door43.org"
              offlineResource={offlineResource}
              font={font}
              fontSize={fontSize}
            />
          );
        // case 'tw':
          // return (
          // <TranslationHelpsCard
          // title={t('label-resource-twlm')}
          // chapter={chapter}
          // branch={branch}
          // projectId="bible"
          // languageId={languageId}
          // resourceId="tw"
          // owner={owner}
          // filePath={offlineResource?.twSelected?.folder}
          // server="https://git.door43.org"
          // offlineResource={offlineResource}
          // font={font}
          // fontSize={fontSize}
          /// >
          // );
        case 'ta':
          return (
            <TranslationHelpsCard
              title={t('label-resource-ta')}
              chapter={chapter}
              branch={branch}
              // projectId="translate"
              projectId={taNavigationPath?.option}
              languageId={languageId}
              resourceId="ta"
              owner={owner}
              filePath={filePathTa}
              server="https://git.door43.org"
              offlineResource={offlineResource}
              font={font}
              fontSize={fontSize}
            />
          );
        case 'bible':
          return (
            <TranslationHelpsCard
              title={t('label-resource-bible')}
              languageId={languageId}
              refName={refName}
              bookId={bookId}
              chapter={chapter}
              verse={verse}
              font={font}
              fontSize={fontSize}
            />
          );
        case 'obs':
          return (
            <TranslationHelpsCard
              title={t('label-resource-obs')}
              languageId={languageId}
              refName={refName}
              bookId={bookId}
              chapter={chapter}
              verse={verse}
              font={font}
              fontSize={fontSize}
            />
          );
        case 'obs-tn':
          return (
            <ObsTnCard
              title={t('label-resource-obs-tn')}
              chapter={story}
              verse="1"
              branch={branch}
              viewMode="default"
              languageId={languageId}
              resourceId="obs-tn"
              owner={owner}
              server="https://git.door43.org"
              offlineResource={offlineResource}
              font={font}
              fontSize={fontSize}
            />
          );
        case 'obs-tq':
          return (
            <ObsTnCard
              title={t('label-resource-obs-tq')}
              chapter={story}
              verse="1"
              branch={branch}
              viewMode="default"
              languageId={languageId}
              resourceId="obs-tq"
              owner={owner}
              server="https://git.door43.org"
              offlineResource={offlineResource}
              font={font}
              fontSize={fontSize}
            />
          );
        case 'obs-twlm':
          return (
            <ObsTwlCard
              title={t('label-resource-obs-twl')}
              chapter={story}
              verse="1"
              branch={branch}
              viewMode="default"
              languageId={languageId}
              resourceId="obs-twl"
              owner={owner}
              server="https://git.door43.org"
              offlineResource={offlineResource}
              font={font}
              fontSize={fontSize}
            />
          );
        default:
          return null;
        }
      })()}
      {/* <div>
        <TranslationHelpsCard
          title="Translation Words List"
          verse={verse}
          chapter={chapter}
          projectId={bookId || 'mat'}
          branch="master"
          viewMode="list"
          languageId="en"
          resourceId="twl"
          owner="test_org"
          server="https://git.door43.org"
        />
        <TranslationHelpsCard
          title="Translation Words"
          verse={verse}
          chapter={chapter}
          projectId={bookId || 'mat'}
          branch="master"
          viewMode="markdown"
          languageId="en"
          resourceId="twl"
          owner="test_org"
          server="https://git.door43.org"
        />
        <TranslationHelpsCard
          title="Translation Questions"
          verse={verse}
          chapter={chapter}
          projectId={bookId || 'mat'}
          branch="master"
          viewMode="question"
          languageId="en"
          resourceId="tq"
          filePath={null}
          owner="test_org"
          server="https://git.door43.org"
        />
      </div> */}
    </>
  );
};

export default TranslationHelps;

TranslationHelps.propTypes = {
  selectedResource: PropTypes.string,
  languageId: PropTypes.string,
  refName: PropTypes.string,
  bookId: PropTypes.string,
  chapter: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  verse: PropTypes.string,
  owner: PropTypes.string,
  story: PropTypes.string,
  offlineResource: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
};

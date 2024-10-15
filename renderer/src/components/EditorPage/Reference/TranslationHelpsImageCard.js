/* eslint-disable */
// import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
// import {
//   useContent,
// } from 'translation-helps-rcl';
// import localForage from 'localforage';
// import LoadingScreen from '@/components/Loading/LoadingScreen';
// import ReferenceCard from './ReferenceCard';
// import * as logger from '../../../logger';
// import packageInfo from '../../../../../package.json';
// import TabSelector from './TabSelector';
// import './TranslationHelpsImageCard.css'; // Include CSS styles

export default function TranslationHelpsImageCard({
  verse,
  chapter,
  projectId,
  folderPath,
  linkedFolderPath,
}) {
  const [imagePaths, setImagePaths] = useState([]);

  const convertToFileUrl = (path) => `file://${path}`;

  /**
   * Function to get image paths from a TSV file based on book code, chapter, and verse.
   *
   * @returns {Array<string>} - A list of image paths for the specified reference.
   */
  const getImagePathsFromTSV = () => {
    const fs = window.require('fs');
    const path = require('path');
    const filePath = path.join(folderPath, `${projectId}.tsv`);
    const metadataJson = JSON.parse(fs.readFileSync(path.join(linkedFolderPath, '..', 'metadata.json')));

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      return [];
    }

    const reference = `${chapter}:${verse}`;
    const finalImagePaths = [];

    // Read the TSV file
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    // Split the content into lines
    const lines = fileContent.trim().split('\n');

    // Loop through each line, starting from 1 to skip the header
    let columns;
    let realPath;
    let dashedName;
    let dashedNameSplited;
    let localizedNameTmp;
    for (let i = 1; i < lines.length; i++) {
      columns = lines[i].split('\t');

      // Check if the reference matches
      if (columns[0] === reference) {
        // Add the last column (image path) to the list
        dashedName = columns[columns.length - 1].split('images/')[1];
        dashedNameSplited = dashedName.split('/')[1];
        localizedNameTmp = metadataJson.localizedNames[dashedNameSplited];
        realPath = convertToFileUrl(path.join(linkedFolderPath, `${dashedName }.jpg`));
        if (localizedNameTmp) {
          localizedNameTmp = localizedNameTmp.short.en;
          finalImagePaths.push([localizedNameTmp, realPath]);
        } else {
          finalImagePaths.push([dashedNameSplited, realPath]);
        }
      }
    }

    return finalImagePaths;
  };

  useEffect(() => {
    if (linkedFolderPath && linkedFolderPath !== '') {
      setImagePaths(getImagePathsFromTSV());
    }
  }, [chapter, verse, projectId]);

  const [zoomedImage, setZoomedImage] = useState(null);

  const closeZoom = () => {
    setZoomedImage(null);
  };

  const handleImageClick = (imageSrc, imageTitle) => {
    setZoomedImage({ src: imageSrc, title: imageTitle });
  };

  return (
    <div className="image-gallery">
      <div className="image-scroll">
        {imagePaths.length > 0 && imagePaths
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map((imagePath, index) => (
            <div key={index} className="image-wrapper">
              <div className="image-name">{imagePath[0]}</div>
              <img
                key={index}
                src={imagePath[1]}
                alt={`Image ${index + 1}`}
                className="gallery-image"
                onClick={() => handleImageClick(imagePath[1], imagePath[0])}
              />
            </div>
          ))}
        {imagePaths.length === 0
          && 'No resources image for this Chapter/Verse'}
      </div>

      {zoomedImage && (
        <div className="zoomed-image-container" onClick={closeZoom}>
          <div className="zoomed-content">
            <span className="close-zoom" onClick={closeZoom}>X</span>
            <div className="zoomed-image-name">{zoomedImage.title}</div>
            <img src={zoomedImage.src} alt="Zoomed" className="zoomed-image" />
          </div>
        </div>
      )}
    </div>
  );
}

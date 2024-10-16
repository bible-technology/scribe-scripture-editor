/* eslint-disable */
// import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import i18n from '../../../translations/i18n';
const { net } = require('electron');
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

  const CACHE_DIR = path.join(folderPath);

  const isVideoCached = (videoUrl) => {
    const videoFileName = path.basename(videoUrl);
    const localVideoPath = path.join(CACHE_DIR, videoFileName);
    return fs.existsSync(localVideoPath) ? localVideoPath : null;
  };

  const downloadAndCacheVideo = (videoUrl) => {
    return new Promise((resolve, reject) => {
      const videoFileName = path.basename(videoUrl);
      const localVideoPath = path.join(CACHE_DIR, videoFileName);
  
      const request = net.request(videoUrl);
      const fileStream = fs.createWriteStream(localVideoPath);
  
      request.on('response', (response) => {
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          resolve(localVideoPath);
        });
      });
  
      request.on('error', (err) => {
        reject(err);
      });
  
      request.end();
    });
  };

  const loadVideo = async (videoUrl) => {
    // Check if video is already cached
    let localVideoPath = isVideoCached(videoUrl);
    
    if (!localVideoPath) {
      // If not cached, download and cache the video
      console.log(`Downloading and caching video: ${videoUrl}`);
      localVideoPath = await downloadAndCacheVideo(videoUrl);
    }
  
    return localVideoPath;
  };
  
  


  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR);
  }

  /**
   * Function to get image paths from a TSV file based on book code, chapter, and verse.
   *
   * @returns {Array<string>} - A list of image paths for the specified reference.
   */
  const getImagePathsFromTSV = () => {
    const fs = window.require('fs');
    const path = require('path');
    const filePath = path.join(folderPath, `${projectId}.tsv`);
    let metadataJson = JSON.parse(fs.readFileSync(path.join(linkedFolderPath, '..', 'metadata.json')));
    const reference = `${chapter}:${verse}`;
    const finalImagePaths = [];

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      return [];
    }
    
    
    // Read the TSV file
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    // Split the content into lines
    const lines = fileContent.trim().split('\n');
    
    let columns;
    let realPath;
    let dashedName;
    let dashedNameSplited;
    let localizedNameTmp;
    if (linkedFolderPath === '') {
      metadataJson = JSON.parse(fs.readFileSync(path.join(folderPath, '..', 'metadata.json')));
      // Loop through each line, starting from 1 to skip the header
      for (let i = 1; i < lines.length; i++) {
        columns = lines[i].split('\t');
        // Check if the reference matches
        if (columns[0] === reference) {
          // Add the last column (image path) to the list
          dashedName = columns[columns.length - 1].split('/').at(-1).split('.')[0];
          localizedNameTmp = metadataJson.localizedNames[dashedName]?.short[i18n.language] ?? '';
          finalImagePaths.push([localizedNameTmp, columns[columns.length - 1]]);
        }
      }
    } else {
      // Loop through each line, starting from 1 to skip the header
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
            localizedNameTmp = localizedNameTmp.short[i18n.language] ?? localizedNameTmp.short.en ?? '';
            finalImagePaths.push([localizedNameTmp, realPath]);
          } else {
            finalImagePaths.push([dashedNameSplited, realPath]);
          }
        }
      }
    }
    return finalImagePaths;
  };

  useEffect(() => {
    setImagePaths(getImagePathsFromTSV());
  }, [chapter, verse, projectId, linkedFolderPath]);

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
          .sort((a, b) => a[0].localeCompare(b[0]))  // Sort by name
          .map((imagePath, index) => (
            <div key={index} className="image-wrapper">
              <div className="image-name">{imagePath[0]}</div>
              {/* Check if the path is a video (e.g., ends with .mp4) */}
              {imagePath[1].match(/\.(mp4|webm|ogg)$/i) ? (
                <video
                  key={index}
                  src={imagePath[1]}
                  controls
                  className="gallery-video"
                />
              ) : (
                <img
                  key={index}
                  src={imagePath[1]}
                  alt={`Image ${index + 1}`}
                  className="gallery-image"
                  onClick={() => handleImageClick(imagePath[1], imagePath[0])}
                />
              )}
            </div>
          ))}
        {imagePaths.length === 0 && "No resources image/video for this Chapter/Verse"}
      </div>
  
      {zoomedImage && !zoomedImage.src.match(/\.(mp4|webm|ogg)$/i) && (
        <div className="zoomed-image-container" onClick={closeZoom}>
          <div className="zoomed-content">
            <span className="close-zoom" onClick={closeZoom}>X</span>
            <div className="zoomed-image-name">{zoomedImage.title}</div>
            <img src={zoomedImage.src} alt="Zoomed" className="zoomed-image" />
          </div>
        </div>
      )}
  
      {zoomedImage && zoomedImage.src.match(/\.(mp4|webm|ogg)$/i) && (
        <div className="zoomed-image-container" onClick={closeZoom}>
          <div className="zoomed-content">
            <span className="close-zoom" onClick={closeZoom}>X</span>
            <div className="zoomed-image-name">{zoomedImage.title}</div>
            <video src={zoomedImage.src} controls className="zoomed-video" />
          </div>
        </div>
      )}
    </div>
  );
}

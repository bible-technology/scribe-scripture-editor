/* eslint-disable */
// import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import i18n from '../../../translations/i18n';

const VideoPlayer = ({ videoUrl }) => {
  const [videoSrc, setVideoSrc] = useState(videoUrl); // Default to remote video URL

  useEffect(() => {
    const loadVideo = async () => {
      // Check if video is already cached
      const cachedVideoPath = await global.ipcRenderer.invoke('is-video-cached', videoUrl);
      if (cachedVideoPath) {
        setVideoSrc(`file://${cachedVideoPath}`); // Use cached video path
      } else {
        // If not cached, download and cache the video
        const downloadedPath = await global.ipcRenderer.invoke('download-and-cache-video', videoUrl);
        setVideoSrc(`file://${downloadedPath}`); // Set downloaded video path
      }
    };

    loadVideo();
  }, [videoUrl]);

  return (
    <video src={videoSrc} controls className="gallery-video" />
  );
};

export default function TranslationHelpsMultimediaCard({
  verse,
  chapter,
  projectId,
  folderPath,
  linkedFolderPath,
}) {
  const [imagePaths, setImagePaths] = useState([]);

  const convertToFileUrl = (path) => `file://${path}`;

  // const CACHE_DIR = path.join(folderPath, 'cached_videos');

  /**
   * Function to get image paths from a TSV file based on book code, chapter, and verse.
   *
   * @returns {Array<string>} - A list of image paths for the specified reference.
   */
  const getImagePathsFromTSV = () => {
    const fs = window.require('fs');
    const path = require('path');
    const filePath = path.join(folderPath, `${projectId}.tsv`);
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
    
    let metadataJson;
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
      metadataJson = JSON.parse(fs.readFileSync(path.join(linkedFolderPath, '..', 'metadata.json')));

      let tabName
      // Loop through each line, starting from 1 to skip the header
      for (let i = 1; i < lines.length; i++) {
        columns = lines[i].split('\t');
  
        // Check if the reference matches
        if (columns[0] === reference) {
          // Add the last column (image path) to the list
          dashedName = columns[columns.length - 1].split('images/')[1];
          dashedNameSplited = dashedName.split('/').at(-1);
          localizedNameTmp = metadataJson.localizedNames[dashedNameSplited];
          realPath = convertToFileUrl(path.join(linkedFolderPath, `${dashedName}.jpg`));
          if(dashedName.split('.').at(-1) !== 'jpg') {
            realPath = convertToFileUrl(path.join(linkedFolderPath, `${dashedName}.jpg`));
          } else {
            realPath = convertToFileUrl(path.join(linkedFolderPath, dashedName));
          }
          // tabName i shere to remove any eventual '.jpg' extensions in the name
          if (localizedNameTmp && localizedNameTmp.short) {
            localizedNameTmp = localizedNameTmp.short[i18n.language] ?? localizedNameTmp.short.en ?? '';
            tabName = localizedNameTmp.split('.');
            finalImagePaths.push([tabName[0], realPath]);
          } else {
            tabName = dashedNameSplited.split('.');
            finalImagePaths.push([tabName[0], realPath]);
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
                // <video
                //   key={index}
                //   src={imagePath[1]}
                //   controls
                //   className="gallery-video"
                // />
                <VideoPlayer key={index} videoUrl={imagePath[1]} />
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

/**
 * Import All the greek UGNT resources from door43.
 *
 */
export const importGreeksFromDoor43 = async () => {
  let pathFolderFiles = '';
  let user = '';
  let bookCodeList = [];
  const fs = window.require('fs');
  const path = require('path');
  const JSZip = require('jszip');
  const newpath = localStorage.getItem('userPath');
  await localforage.getItem('userProfile').then((usr) => user = usr);
  const folder = path.join(newpath, packageInfo.name, 'users', `${user?.username}`, 'resources');

  let alreadyExists = false;
  let downloadProjectName = '';
  fetch(`${environment.GITEA_API_ENDPOINT}/catalog/search?metadataType=rc&metadataType=sb&lang=el-x-koine&title=unfoldingWord®%20Greek%20New%20Testament&partialMatch=false&sort=released`)
    .then((res) => res.json())
    .then((myJson) => myJson.data.at(-1))
    .then(async (data) => {
      console.log(data);
      console.log("importedBookCodes ==",importedBookCodes);
      const existingResource = fs.readdirSync(folder, { withFileTypes: true });
      downloadProjectName = `${data?.name}_${data?.owner}_${data?.release?.tag_name}`;
      existingResource?.forEach((element) => {
        if (downloadProjectName === element.name) {
          alreadyExists = true;
          pathFolderFiles = path.join(folder, downloadProjectName)
          return;
        }
      });
      // if we already have the resources we get out of the function
      if(alreadyExists) return;

      // otherwise we download it
      try {
        logger.debug('NewProject.js', 'Download Started');
        setLoading(true);
        logger.debug('NewProject.js', 'In helps-resource download user fetch - ', user?.username);

        // download and unzip the content
        await fetch(data?.zipball_url)
          .then((res) => res.arrayBuffer())
          .then(async (blob) => {
            logger.debug('NewProject.js', 'In resource download - downloading zip content ');
            if (!fs.existsSync(folder)) {
              fs.mkdirSync(folder, { recursive: true });
            }
            // wririntg zip to local
            await fs.writeFileSync(path.join(folder, `${data?.name}.zip`), Buffer.from(blob));
            logger.debug('NewProject.js', 'In resource download - downloading zip content completed ');

            // extract zip
            logger.debug('NewProject.js', 'In resource download - Unzip downloaded resource');
            const filecontent = await fs.readFileSync(path.join(folder, `${data?.name}.zip`));
            const result = await JSZip.loadAsync(filecontent);
            const keys = Object.keys(result.files);

            // eslint-disable-next-line no-restricted-syntax
            for (const key of keys) {
              const item = result.files[key];
              if (item.dir) {
                if(item.name.match('ugnt').length > 0) {
                  pathFolderFiles = path.join(folder, downloadProjectName);
                }
                fs.mkdirSync(path.join(folder, item.name), { recursive: true });
              } else {
                // eslint-disable-next-line no-await-in-loop
                const bufferContent = Buffer.from(await item.async('arraybuffer'));
                fs.writeFileSync(path.join(folder, item.name), bufferContent);
              }
            }
            // let resourceMeta = {};
            await fetch(data.metadata_json_url)
              .then((res) => res.json())
              .then(async (data) => {
                  // adding offline true tag in  meta for identification
                  data.agOffline = true;
                  data.meta = data;
                  data.lastUpdatedAg = moment().format();
                  await fs.writeFileSync(path.join(folder, data?.name, 'metadata.json'), JSON.stringify(data));
              }).catch((err) => {
                  logger.debug('NewProject.js', 'failed to save yml metadata.json : ', err);
              });

            // finally remove zip and rename base folder to projectname_id
            logger.debug('NewProject.js', 'deleting zip file - rename project with project + id in scribe format');
            if (fs.existsSync(folder)) {
              fs.renameSync(path.join(folder, data?.name), path.join(folder, downloadProjectName));
              fs.unlinkSync(path.join(folder, `${data?.name}.zip`), (err) => {
                if (err) {
                  logger.debug('NewProject.js', 'error in deleting zip');
                  throw new Error(`Removing Resource Zip Failed :  ${data?.name}.zip`);
                }
              });
            }
          });
        logger.debug('NewProject.js', 'download completed');
        setLoading(false);
      } catch (err) {
        setLoading(false);
        throw err;
      }
    }).then(() => {
      const grammar = require('usfm-grammar');
      console.log('pathFolderFiles', pathFolderFiles);
      console.log('alreadyExists', alreadyExists);
      
      const files = importedFiles ? [...importedFiles] : [];
      const greekResources = fs.readdirSync(pathFolderFiles, { withFileTypes: true });
      console.log('greekResources ==', pathFolderFiles);
      let filePath = '';
      const re = new RegExp(/[A-Z\d]{3}/g);
      let matchedBookName;
      for(let greekUsfm of greekResources) {
        matchedBookName = greekUsfm.name.match(re);
        console.log('matchedBookName', matchedBookName);
        if(!matchedBookName || (matchedBookName[0] && importedBookCodes.includes(matchedBookName[0]))) {
          continue;
        }
        if(matchedBookName[0] && !canonSpecification.currentScope.includes(matchedBookName[0])) continue;

        filePath = path.join(pathFolderFiles, greekUsfm.name);
        const file = fs.readFileSync(filePath, 'utf8');
        const filename = greekUsfm.name;
        
        console.log('filePath == ', filePath);
        const fileExt = filename.split('.').pop()?.toLowerCase();
        console.log('fileExt == ', fileExt);
        if (fileExt === 'txt' || fileExt === 'usfm' || fileExt === 'text' || fileExt === 'sfm'
        || fileExt === undefined || fileExt === 'TXT' || fileExt === 'USFM' || fileExt === 'SFM') {
          const myUsfmParser = new grammar.USFMParser(file, grammar.LEVEL.RELAXED);
          const isJsonValid = myUsfmParser.validate();
          console.log('isJsonValid == ', isJsonValid);
          // if the USFM is valid
          if (isJsonValid) {
            console.log('before callReplace');
            callReplace(true);
            console.log('AFTER callReplace');
            logger.debug('NewProject.js', 'Valid USFM file.');
            // then we get the book code and we transform our data to our Juxta json file
            const jsonOutput = myUsfmParser.toJSON();
  
            // if the current file was NOT imported by the user, we create the juxta out of it
            if(importedBookCodes.includes(jsonOutput.book.bookCode)) continue;
            // if the current file is NOT in the canonSpecification set by the user, we don't do anything
            if(!canonSpecification.currentScope.includes(jsonOutput.book.bookCode)) continue;
  
            console.log('juxtaification of ', jsonOutput.book.bookCode);
            const juxtaJson = JSON.stringify(readUsfm(file, jsonOutput.book.bookCode));
            console.log('juxtaJson ', juxtaJson);
            files.push({ id: jsonOutput.book.bookCode, content: juxtaJson });
            console.log('my file');
            bookCodeList.push(jsonOutput.book.bookCode);
            console.log("bookCodeList",bookCodeList);
          }
        } else {
          logger.warn('NewProject.js', 'Invalid file.');
          setNotify('failure');
          // Nicolas : TODO translations
          setSnackText(`invalid file type : ${filePath}`);
          setOpenSnackBar(true);
        }
        matchedBookName = null;
      }
  
      setImportedBookCodes(bookCodeList);
      setImportedFiles(files);
    });
};
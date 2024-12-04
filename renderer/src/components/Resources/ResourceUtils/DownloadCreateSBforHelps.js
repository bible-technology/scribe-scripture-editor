/* eslint-disable no-restricted-syntax */
import localForage from 'localforage';
import moment from 'moment';
import * as logger from '../../../logger';
import packageInfo from '../../../../../package.json';

const JSZip = require('jszip');

const DownloadCreateSBforHelps = async (projectResource, setLoading, update = false, offlineResource = false, endPoint = 'gitea', filteredReposResourcelinks = []) => {
  try {
    logger.debug('DownloadCreateSBforHelps.js', 'Download Started');
    setLoading(true);
    await localForage.getItem('userProfile').then(async (user) => {
      logger.debug('DownloadCreateSBforHelps.js', 'In helps-resource download user fetch - ', user?.username);
      const fs = window.require('fs');
      const path = require('path');
      const newpath = localStorage.getItem('userPath');
      const folder = path.join(newpath, packageInfo.name, 'users', `${user?.username}`, 'resources');
      // const currentUser = user?.username;
      // const key = currentUser + projectResource.name + projectResource.owner + moment().format();
      // const id = uuidv5(key, environment.uuidToken);
      // check for existing resources
      const existingResource = fs.readdirSync(folder, { withFileTypes: true });
      const projectName = projectResource?.name;
      const projectOwner = endPoint === 'gitea' ? projectResource?.owner : projectResource?.owner?.login;
      let downloadProjectName = `${projectName}_`;
      if (endPoint === 'gitea') {
        downloadProjectName += `${projectOwner}_${projectResource?.release?.tag_name}`;
      } else {
        downloadProjectName += `${projectOwner}_${projectResource?.id}`;
      }
      existingResource?.forEach((element) => {
        if (downloadProjectName === element.name) {
          setLoading(false);

          // throw new Error('Resource Already Exist');
        }
      });

      // check if resource already exist in offline
      if (!update && offlineResource) {
        // eslint-disable-next-line array-callback-return
        const resourceExist = offlineResource.filter((offline) => {
          // if (offline?.projectDir === `${projectName}_${projectOwner}_${projectResource?.release?.tag_name}`) {
          if (offline?.projectDir === downloadProjectName) {
            return offline;
          }
        });
        if (resourceExist.length > 0) {
          setLoading(false);
          return;
          // throw new Error('Resource Already Exist');
          // throw new Error('Resource Already Exist');
          // eslint-disable-next-line no-throw-literal
          // throw 'Resource Already Exist';
        }
      }

      if (endPoint === 'github') { projectResource.zipball_url = `${projectResource.svn_url }/archive/refs/heads/main.zip`; }
      // const json = {};
      // download and unzip the content
      // eslint-disable-next-line no-async-promise-executor
      await fetch(projectResource?.zipball_url)
        .then((res) => res.arrayBuffer())
        .then(async (blob) => {
          logger.debug('DownloadCreateSBforHelps.js', 'In resource download - downloading zip content ');
          if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true });
          }
          // wririntg zip to local
          await fs.writeFileSync(path.join(folder, `${projectName}.zip`), Buffer.from(blob));
          logger.debug('DownloadCreateSBforHelps.js', 'In resource download - downloading zip content completed ');

          // extract zip
          logger.debug('DownloadCreateSBforHelps.js', 'In resource download - Unzip downloaded resource');
          const filecontent = await fs.readFileSync(path.join(folder, `${projectName}.zip`));
          const result = await JSZip.loadAsync(filecontent);
          const keys = Object.keys(result.files);

          // eslint-disable-next-line no-restricted-syntax
          for (const key of keys) {
            const item = result.files[key];
            if (item.dir) {
              fs.mkdirSync(path.join(folder, item.name), { recursive: true });
            } else {
              // eslint-disable-next-line no-await-in-loop
              const bufferContent = Buffer.from(await item.async('arraybuffer'));
              fs.writeFileSync(path.join(folder, item.name), bufferContent);
            }
          }
          // let resourceMeta = {};
          await fetch(projectResource.metadata_json_url)
            .then((res) => res.json())
            .then(async (data) => {
              // adding offline true tag in  meta for identification
              data.agOffline = true;
              data.meta = projectResource;
              data.lastUpdatedAg = moment().format();
              await fs.writeFileSync(path.join(folder, projectName, 'metadata.json'), JSON.stringify(data));
            }).catch((err) => {
              logger.debug('DownloadCreateSBforHelps.js', 'failed to save yml metadata.json : ', err);
            });

          // finally remove zip and rename base folder to projectname_id
          logger.debug('DownloadCreateSBforHelps.js', 'deleting zip file - rename project with project + id in scribe format');
          if (fs.existsSync(folder)) {
            const prjMain = endPoint === 'github' ? `${projectName }-main` : projectName;
            fs.renameSync(path.join(folder, prjMain), path.join(folder, downloadProjectName));
            fs.unlinkSync(path.join(folder, `${projectName}.zip`), (err) => {
              if (err) {
                logger.debug('DownloadCreateSBforHelps.js', 'error in deleting zip');
                throw new Error(`Removing Resource Zip Failed :  ${projectName}.zip`);
              }
            });
            if (update && update?.status) {
              // if updation delete old resource
              try {
                fs.rmSync(path.join(folder, `${projectName}_${projectOwner}_${update?.prevVersion}`), { recursive: true });
                update && update?.setIsOpen(false);
              } catch (err) {
                logger.debug('DownloadCreateSBforHelps.js', 'error in deleting prev resource');
                setLoading(false);
                throw new Error(`Removing Previous Resource Failed :  ${projectName}_${projectOwner}_${update?.prevVersion}`);
              }
            }
          }

          const pathRelationFile = path.join(folder, downloadProjectName, 'ingredients', 'relation.txt');
          if (fs.existsSync(pathRelationFile) && filteredReposResourcelinks.length > 0) {
            const relationFileContent = await fs.readFileSync(pathRelationFile, 'utf8');
            const nameResourceLinked = relationFileContent.replace('\n', '').trim();
            let resourceLinkBurrito = '';
            for (const resource of filteredReposResourcelinks) {
              if (resource.name === nameResourceLinked) {
                resourceLinkBurrito = resource;
              }
            }

            if (resourceLinkBurrito !== '') {
              logger.debug('DownloadCreateSBforHelps.js', `Linked resource found for ${downloadProjectName} as ${resourceLinkBurrito}`);
              DownloadCreateSBforHelps(resourceLinkBurrito.responseData, setLoading, update, offlineResource, 'github');
            } else {
              logger.debug('DownloadCreateSBforHelps.js', `No linked resource found for ${downloadProjectName}`);
            }
          } else {
            logger.debug('DownloadCreateSBforHelps.js', `Nope! ${downloadProjectName}\n${filteredReposResourcelinks.length}\nfs.existsSync(pathRelationFile) == ${fs.existsSync(pathRelationFile)}\npathRelationFile == ${pathRelationFile}`);
          }
        });
      logger.debug('DownloadCreateSBforHelps.js', 'download completed');
      setLoading(false);
    });
  } catch (err) {
    setLoading(false);
    throw err;
  }
};

export default DownloadCreateSBforHelps;

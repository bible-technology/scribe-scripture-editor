// function for upload local door43 helps resource (upload and convert to burrito type)
/*
 - supported only manifest.yaml based door43 resources
 - Supported Resources are TN , TW, TQ, TA for obs and bible
*/

export const uploadLocalHelpsResources = async (fs, path, resourcePath, sourcePath, raiseSnackbarErroOrWarning, logger) => {
  try {
    logger.debug('uploadLocalHelpsResources.js', 'in func - started upload local help resource');
    const fse = window.require('fs-extra');
    const yaml = require('js-yaml');
    // read manifest.yaml
    if (fs.existsSync(path.join(sourcePath, 'manifest.yaml'))) {
      // const manifestBuff = fs.readFileSync(path.join(sourcePath, 'manifest.yaml'));
      // const manifest = YAML.load(manifestBuff);
      const manifest = yaml.load(fs.readFileSync(path.join(sourcePath, 'manifest.yaml'), 'utf8'));
      logger.debug('uploadLocalHelpsResources.js', 'read manifest successfully');

      // check its not twl or obs-twl -> currently not supported
      if (manifest.dublin_core.identifier === 'twl' || manifest.dublin_core.identifier === 'obs-twl') {
        throw new Error('TWL resource type is not currently supported');
      }

      // generate file name same as the door43 downloaded resource name (langcode_resourcetypeCode_owner_releasetab/version  : en_tn_door43_v77)
      const resourceName = `${manifest.dublin_core.language.identifier}_${manifest.dublin_core.identifier}_${manifest.dublin_core.publisher}_v${manifest.dublin_core.version}`;
      // check for duplicate resource
      if (!fs.existsSync(path.join(resourcePath, resourceName))) {
        logger.debug('uploadLocalHelpsResources.js', 'No duplicate resource found');
        // create metadata.json
        const metaData = {
          checking: manifest.checking,
          dublin_core: manifest.dublin_core,
          projects: manifest.projects,
          agOffline: true,
          localUploadedHelp: true,
          meta: {
            stage: '',
            id: resourceName,
            subject: manifest.dublin_core.subject,
            language: manifest.dublin_core.language.identifier,
            language_title: manifest.dublin_core.language.title,
            language_direction: manifest.dublin_core.language.direction,
            owner: manifest.dublin_core.publisher,
            name: `${manifest.dublin_core.language.identifier}_${manifest.dublin_core.identifier}`,
            release: { tag_name: `v${manifest.dublin_core.version}` },
            full_name: `${manifest.publisher}/${manifest.dublin_core.language.identifier}_${manifest.dublin_core.identifier}`,
            resource: manifest.dublin_core.identifier,
            title: manifest.dublin_core.title,
            content_format: manifest.dublin_core.format,
            ingredients: [...manifest.projects],
          },
        };

        logger.debug('uploadLocalHelpsResources.js', 'metadata object creation succesfull');

        // copy contents from source to target
        await fse.copy(sourcePath, path.join(resourcePath, resourceName))
        .then(async () => {
          logger.debug('uploadLocalHelpsResources.js', 'resource copy from src to trg successfull');
          // write metadata into the target dir
          await fs.writeFileSync(path.join(resourcePath, resourceName, 'metadata.json'), JSON.stringify(metaData));
          logger.debug('uploadLocalHelpsResources.js', 'write metadata is successfull and done uploading');
          raiseSnackbarErroOrWarning({
            type: 'success',
            message: 'Resource uploaded successfully',
          });
        });
      } else {
        // existing resource with same name
        logger.debug('uploadLocalHelpsResources.js', 'resource already exist');
        raiseSnackbarErroOrWarning({
          type: 'warning',
          message: 'Resource Already Exist',
        });
      }
    } else {
      logger.error('uploadLocalHelpsResources.js', 'Invalid resource or No manifest found');
      raiseSnackbarErroOrWarning({
        type: 'error',
        message: 'Invalid resource. No manifest found',
      });
    }
  } catch (err) {
    logger.error('uploadLocalHelpsResources.js', `unkwon error : ${err?.message || err}`);
    raiseSnackbarErroOrWarning({
      type: 'error',
      message: err?.message || err,
    });
  }
};

// function for upload local door43 helps resource (upload and convert to burrito type)
/*
 - supported only manifest.yaml based door43 resources
 - Supported Resources are TN , TW, TQ, TA for obs and bible
*/

export const uploadLocalHelpsResources = async (fs, path, resourcePath, sourcePath) => {
  try {
    const fse = window.require('fs-extra');
    const yaml = require('js-yaml');
    // read manifest.yaml
    if (fs.existsSync(path.join(sourcePath, 'manifest.yaml'))) {
      // const manifestBuff = fs.readFileSync(path.join(sourcePath, 'manifest.yaml'));
      // const manifest = YAML.load(manifestBuff);
      const manifest = yaml.load(fs.readFileSync(path.join(sourcePath, 'manifest.yaml'), 'utf8'));
      console.log({ manifest });

      // generate file name same as the door43 downloaded resource name (langcode_resourcetypeCode_owner_releasetab/version  : en_tn_door43_v77)
      const resourceName = `${manifest.dublin_core.language.identifier}_${manifest.dublin_core.identifier}_${manifest.dublin_core.publisher}_v${manifest.dublin_core.version}`;
      // check for duplicate resource
      if (!fs.existsSync(path.join(resourcePath, resourceName))) {
        console.log('new resouece ok to proceed ---');
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

        // copy contents from source to target
        await fse.copy(sourcePath, path.join(resourcePath, resourceName))
        .then(async () => {
          // write metadata into the target dir
          await fs.writeFileSync(path.join(resourcePath, resourceName, 'metadata.json'), JSON.stringify(metaData));
          console.log('Finished ---');
        });
      } else {
        // existing resource with same name
        console.log('Existing Resource -- xxxx');
      }
    } else {
      console.log('manifest not exist . Can not upload the resource -- xxxxx');
    }
  } catch (err) {
    console.log('in upload local fucntion ERR : ', err);
  }
};

import { readResourceMetadata } from '@/components/Resources/ResourceUtils/readResourceMetadata';
import { isElectron } from '@/core/handleElectron';
import * as localforage from 'localforage';
import packageInfo from '../../../../package.json';
import { createDirectory, newPath } from '../../../../supabase';
// if (!process.env.NEXT_PUBLIC_IS_ELECTRON) {
//   const newPath = require('../../../../supabase').newPath
//   const createDirectory = require('../../../../supabase').createDirectory
// }

export default async function readLocalResources(username, setSubMenuItems) {
  if (isElectron()) {
    const parseData = [];
    const fs = window.require('fs');
    const path = require('path');
    const newpath = localStorage.getItem('userPath');
    const projectsDir = path.join(newpath, packageInfo.name, 'users', username, 'resources');// Read user resources
    const userResourceMetaPath = path.join(newpath, packageInfo.name, 'users', username, 'resources');
    fs.mkdirSync(path.join(newpath, packageInfo.name, 'users', username, 'resources'), {
      recursive: true,
    });
    readResourceMetadata(projectsDir, userResourceMetaPath, setSubMenuItems, parseData, 'user');

    const commonResourceDir = path.join(newpath, packageInfo.name, 'common', 'resources');// Read common resources
    const commonResourceMetaPath = path.join(newpath, packageInfo.name, 'common', 'resources');
    fs.mkdirSync(path.join(newpath, packageInfo.name, 'common', 'resources'), {
      recursive: true,
    });
    readResourceMetadata(commonResourceDir, commonResourceMetaPath, setSubMenuItems, parseData, 'common');
  } else {
    const userProfile = await localforage.getItem('userProfile');
    const email = userProfile.user.email;
    const parseData = [];
    const projectsDir = `${newPath}/${email}/resources`;
    const userResourceMetaPath = `${newPath}/${email}/resources`;
    createDirectory({path:userResourceMetaPath});
    readResourceMetadata(projectsDir, userResourceMetaPath, setSubMenuItems, parseData);
  }
}

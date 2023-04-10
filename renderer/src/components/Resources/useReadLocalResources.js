import { readResourceMetadata } from '@/components/Resources/ResourceUtils/readResourceMetadata';
import packageInfo from '../../../../package.json';

export default function readLocalResources(username, setSubMenuItems) {
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
}

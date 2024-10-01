// import * as localforage from 'localforage';
import packageInfo from '../../../../package.json';

export const removeUser = async (userName) => {
  const newpath = await localStorage.getItem('userPath');
  const fs = window.require('graceful-fs');
  const path = require('path');
  const folder = path.join(newpath, packageInfo.name, 'users', userName.toLowerCase());
  const file = path.join(newpath, packageInfo.name, 'users', 'users.json');
  const data = await fs.readFileSync(file);
  const json = JSON.parse(data);
  const existData = await fs.existsSync(folder);
  if (existData) {
    fs.rmSync(folder, { recursive: true, force: true });
  }
  // console.error('users.json', `${userName} data removed from json`);
  const filtered = json.filter((item) => item.username.toLowerCase() !== userName.toLowerCase());
  await fs.writeFileSync(file, JSON.stringify(filtered));
};

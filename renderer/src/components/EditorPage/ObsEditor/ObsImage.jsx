import { environment } from '../../../../environment';
import packageInfo from '../../../../../package.json';

function ObsImage({ story, online }) {
  const path = require('path');
  const newpath = localStorage.getItem('userPath');
  const imageName = story.img.split('/');
  const fileName = imageName[imageName.length - 1];
  const obsImagePath = path.join('file://', newpath, packageInfo.name, 'common', environment.OBS_IMAGE_DIR, fileName);

  return online ? (
    <img className="w-1/4 rounded-lg" src={story.img} alt="" />) : (<img className="w-1/4 rounded-lg" src={obsImagePath} alt="offline" />);
}

export default ObsImage;

import PropTypes from 'prop-types';

export default function JsonToMd(story, imageUrl) {
  const title = `# ${story.title}\n\n`;
  const end = `_${story.end}_`;
  const body = story.story.reduce((str, value) => `${str}![OBS Image](${value.url})\n\n${value.text}\n\n`, '');
  const storyStr = title + body + end;
  return imageUrl !== ''
    ? storyStr.replaceAll('https://cdn.door43.org/obs/jpg/360px/', imageUrl)
    : storyStr;
}

JsonToMd.propTypes = {
  story: PropTypes.array,
  imageUrl: PropTypes.string,
};

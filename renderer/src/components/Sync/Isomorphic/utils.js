// utility functions of isomorphics git
import git from 'isomorphic-git';
import PropTypes from 'prop-types';
import * as logger from '../../../logger';
// to check a dir is git initialized or not
export async function checkInitialize(fs, dir) {
  logger.debug('utils.js', 'in checkInitialize - check initialisation of git in a Dir');
  try {
    await git.log({
      fs, dir, depth: 5, ref: 'master',
    });
    logger.debug('utils.js', 'The directory is already initialized ');
    console.log('The directory is already initialized as a Git repository.');
    return true;
  } catch (error) {
    logger.error('utils.js', 'The directory is not initialized ');
    console.log('The directory is not initialized as a Git repository.');
    return false;
  }
}

// function for initialize git in Dir
export async function initProject(fs, dir, defaultBranch = 'master') {
  logger.debug('utils.js', 'in initProject - initialisation of git in a Dir');
  try {
    await git.init({ fs, dir, defaultBranch });
    logger.debug('utils.js', 'in initProject - Initialized repository');
    console.log('Initialized empty repository');
    return true;
  } catch (error) {
    logger.error('utils.js', `Error initializing repository:', ${error} `);
    console.error('Error initializing repository:', error);
    return false;
  }
}

// export async function commitChanges(fs, dir, author, message) {
//   // const dir = '/path/to/repository'; // Replace with the actual path to the repository
//   // const author = { name: 'Your Name', email: 'your.email@example.com' };
//   // const message = 'Commit message';
//   logger.debug('utils.js', 'in commitChanges - commitChanges of git in a Dir');
//   try {
//     await git.add({ fs, dir, filepath: '.' });
//     const sha = await git.commit({
//       fs,
//       dir,
//       author,
//       message,
//     });
//     logger.debug('utils.js', `Changes committed with SHA: ${sha}`);
//     console.log(`Changes committed with SHA: ${sha}`);
//     return true;
//   } catch (error) {
//     console.error(`Error committing changes: ${error}`);
//     console.error('Error committing changes:', error);
//     return false;
//   }
// }

// commitChanges.propTypes = {
//   dir: PropTypes.string.isRequired,
//   filepath: PropTypes.string.isRequired,
//   author: PropTypes.shape({
//     name: PropTypes.name.isRequired,
//     email: PropTypes.email.isRequired,
//   }),
//   message: PropTypes.string.isRequired,
// };

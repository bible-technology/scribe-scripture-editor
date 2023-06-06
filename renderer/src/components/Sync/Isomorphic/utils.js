// utility functions of isomorphics git
import git from 'isomorphic-git';
import * as logger from '../../../logger';

// to check a dir is git initialized or not
export async function checkInitialize(dir) {
  logger.debug('utils.js', 'in checkInitialize - check initialisation of git in a Dir');
  try {
    await git.listCommits({ dir });
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
export async function initProject(dir) {
  logger.debug('utils.js', 'in initProject - initialisation of git in a Dir');
  try {
    await git.init({ dir });
    logger.debug('utils.js', 'in initProject - Initialized repository');
    console.log('Initialized empty repository');
    return true;
  } catch (error) {
    logger.error('utils.js', `Error initializing repository:', ${error} `);
    console.error('Error initializing repository:', error);
    return false;
  }
}

// utility functions of isomorphics git
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/web';
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
export async function initProject(fs, dir, username, defaultBranch = 'master') {
  logger.debug('utils.js', 'in initProject - initialisation of git in a Dir');
  try {
    await git.init({ fs, dir, defaultBranch });
    logger.debug('utils.js', 'in initProject - Initialized repository');
    console.log('Initialized repository');
    await git.setConfig({
      fs,
      dir,
      path: 'user.name',
      value: username,
    });
    return true;
  } catch (error) {
    logger.error('utils.js', `Error initializing repository:', ${error} `);
    console.error('Error initializing repository:', error);
    return false;
  }
}

// Add remote for a newly git initialted project
export async function addGitRemote(fs, dir, url) {
  // url: 'https://github.com/isomorphic-git/isomorphic-git',
  logger.debug('utils.js', 'in addGitRemote - Push the changes to git from Dir');
  try {
    await git.addRemote({
      fs,
      dir,
      remote: 'origin',
      url,
    });
    logger.debug('utils.js', 'Added origin as remote');
    console.log('Added origin as remote');
    return true;
  } catch (error) {
    logger.error('utils.js', `Error creating remote changes: ${error}`);
    console.error('Error creating remote changes:', error);
    return false;
  }
}

// Commit the changes
export async function commitChanges(fs, dir, author, message) {
  // const dir = '/path/to/repository'; // Replace with the actual path to the repository
  // const author = { name: 'Your Name', email: 'your.email@example.com' };
  // const message = 'Commit message';
  logger.debug('utils.js', 'in commitChanges - commitChanges of git in a Dir');
  try {
    await git.add({ fs, dir, filepath: '.' });
    const sha = await git.commit({
      fs,
      dir,
      author,
      message,
    });
    logger.debug('utils.js', `Changes committed with SHA: ${sha}`);
    console.log(`Changes committed with SHA: ${sha}`);
    return true;
  } catch (error) {
    logger.error('utils.js', `Error committing changes: ${error}`);
    console.error('Error committing changes:', error);
    return false;
  }
}

// Pushing the changes to git
export async function pushTheChanges(fs, dir, branch, token) {
  logger.debug('utils.js', 'in pushTheChanges - Push the changes to git from Dir');
  try {
    const pushResult = await git.push({
      fs,
      http,
      dir,
      remote: 'origin',
      ref: branch,
      onAuth: () => ({ username: token }),
    });
    logger.debug('utils.js', 'Pushed the changes');
    console.log('Pushed the changes', pushResult);
    return true;
  } catch (error) {
    logger.error('utils.js', `Error pushing changes: ${error}`);
    console.error('Error pushing changes:', error);
    return false;
  }
}

// clone a repo
export async function cloneTheProject(fs, dir, url, branch, token) {
  logger.debug('utils.js', 'in cloneTheProject - clone a project to Dir from Door 43');
  try {
    await git.clone({
      fs,
      http,
      dir,
      url,
      ref: branch,
      singleBranch: true,
      onAuth: () => ({ username: token }),
    });
    logger.debug('utils.js', 'Cloned the project');
    console.log('cloned the repo ');
    return true;
  } catch (error) {
    logger.error('utils.js', `Error cloning project: ${error}`);
    console.error('Error cloning project:', error);
    return false;
  }
}

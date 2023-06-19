// utility functions of isomorphics git
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/web';
import * as logger from '../../../logger';
// to check a dir is git initialized or not
export async function checkInitialize(fs, dir, branch) {
  logger.debug('utils.js', 'in checkInitialize - check initialisation of git in a Dir');
  try {
    await git.log({
      fs, dir, depth: 1, ref: branch,
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

// function for set user config
export async function setUserConfig(fs, dir, username) {
  logger.debug('utils.js', 'in setUserConfig - set user config');
  try {
    await git.setConfig({
      fs,
      dir,
      path: 'user.name',
      value: username,
    });
    return true;
  } catch (error) {
    logger.error('utils.js', `Error setting config:', ${error} `);
    console.error('Error setting config:', error);
    return false;
  }
}

// function for initialize git in Dir
export async function initProject(fs, dir, username, defaultBranch) {
  logger.debug('utils.js', 'in initProject - initialisation of git in a Dir');
  try {
    await git.init({ fs, dir, defaultBranch });
    logger.debug('utils.js', 'in initProject - Initialized repository');
    console.log('Initialized repository');
    await setUserConfig(fs, dir, username);
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
export async function commitChanges(fs, dir, author, message, force = false) {
  // const dir = '/path/to/repository'; // Replace with the actual path to the repository
  // const author = { name: 'Your Name', email: 'your.email@example.com' };
  // const message = 'Commit message';
  logger.debug('utils.js', 'in commitChanges - commitChanges of git in a Dir');
  try {
    // await git.add({
    //   fs, dir, filepath: '.', force,
    // });
    await git.add({
      fs, dir, filepath: '.',
    });
    // check and find the ingredients / content folder
    if (force) {
      await git.add({
        fs, dir, filepath: 'metadata.json', force,
      });
      await git.add({
        fs, dir, filepath: 'ingredients/scribe-settings.json', force,
      });
    }
    await git.remove({ fs, dir, filepath: '.gitignore' });
    await git.remove({ fs, dir, filepath: '/.git' });
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

// Commit the changes
export async function commitJson(fs, dir, author, message, force = false) {
  // const dir = '/path/to/repository'; // Replace with the actual path to the repository
  // const author = { name: 'Your Name', email: 'your.email@example.com' };
  // const message = 'Commit message';
  logger.debug('utils.js', 'in commitChanges - commitChanges of git in a Dir');
  try {
    // await git.add({
    //   fs, dir, filepath: '.', force,
    // });

    // check and find the ingredients / content folder
    if (force) {
      await git.add({
        fs, dir, filepath: 'metadata.json', force,
      });
      await git.add({
        fs, dir, filepath: 'ingredients/scribe-settings.json', force,
      });
    }
    await git.remove({ fs, dir, filepath: '.gitignore' });
    await git.remove({ fs, dir, filepath: '/.git' });
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
      force: true,
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
// Pushing the changes to git
export async function pushToMain(fs, dir, branch, token) {
  logger.debug('utils.js', 'in pushTheChanges - Push the changes to git from Dir');
  try {
    const pushResult = await git.push({
      fs,
      http,
      dir,
      remote: 'origin',
      ref: branch,
      remoteRef: 'scribe-main',
      // force: true,
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

// // merge 2 local branches
// export async function

// create a new branch
export async function createBranch(fs, dir, branch) {
  logger.debug('utils.js', 'in createBranch - create a new branch from current');
  try {
    await git.branch({
      fs,
      dir,
      ref: branch,
    });
    logger.debug('utils.js', 'created new branch');
    console.log('branch created');
    return true;
  } catch (error) {
    logger.error('utils.js', `Error create branch: ${error}`);
    console.error('Error create Branch :', error);
    return false;
  }
}

// checkout to a branch
export async function checkoutJsonFiles(fs, dir, branch) {
  logger.debug('utils.js', 'in checkoutJsonFiles - checkout json fiels ');
  try {
    await git.checkout({
      fs,
      dir,
      ref: branch,
      filepath: ['metadata.json', 'ingredients/scribe-settings.json'],
      noUpdateHead: true,
      force: true,
    }).then((data) => console.log({ data }))
    .catch((e) => console.log({ e }));
    logger.debug('utils.js', 'checkout JSON files');
    console.log('checkout JSON files');
    return true;
  } catch (error) {
    logger.error('utils.js', `Error checkout JSON files: ${error}`);
    console.error('Error checkout JSON Files :', error);
    return false;
  }
}

// checkout to a branch
export async function checkoutToBranch(fs, dir, branch) {
  logger.debug('utils.js', 'in checkoutToBranch - checkout to a ');
  try {
    await git.checkout({
      fs,
      dir,
      ref: branch,
    });
    logger.debug('utils.js', 'checkout to branch');
    console.log('checkout to branch');
    return true;
  } catch (error) {
    logger.error('utils.js', `Error checkout to branch: ${error}`);
    console.error('Error checkout to Branch :', error);
    return false;
  }
}

// Function to delete a branch
export async function checkGitStatus(fs, dir) {
  logger.debug('utils.js', 'in gitstatus - check git status ');

  try {
    const files = await git.listFiles({
      fs,
      dir,
    });
    const filteredFiles = await files.filter((file) => !file.endsWith('.json'));
    let continuePull = true;
    for (let index = 0; index < filteredFiles.length; index++) {
      // eslint-disable-next-line no-await-in-loop
      const status = await git.status({
        fs,
        dir,
        filepath: filteredFiles[index],
      });
      console.log({ status });
      if (status === '*modified') {
        continuePull = false;
        break;
      }
    }
    logger.debug('utils.js', 'In checK git status');
    return continuePull;
  } catch (error) {
    logger.error('utils.js', `Error check status : ${error}`);
    console.error('Error check git status :', error);
    return false;
  }
}

// Function to delete a branch
export async function deleteTheBranch(fs, dir, branch) {
  logger.debug('utils.js', 'in deleteBranch - delete a new branch ');

  try {
    await git.deleteBranch({
      fs,
      dir,
      ref: branch,
    });
    logger.debug('utils.js', 'delete the  branch');
    console.log('branch deleted');
    return true;
  } catch (error) {
    logger.error('utils.js', `Error delete branch: ${error}`);
    console.error('Error delete Branch :', error);
    return false;
  }
}

// Pull the repo
export async function pullProject(fs, dir, remoteBranch, token, localBranch) {
  logger.debug('utils.js', 'in pullProject - pull the a project to Dir from Door 43');
  console.log('pull', remoteBranch, localBranch);
  try {
    await git.pull({
      fs,
      http,
      dir,
      ref: localBranch,
      remote: 'origin',
      remoteRef: remoteBranch,
      singleBranch: true,
      fastForward: true,
      onAuth: () => ({ username: token }),
    }).catch((e) => console.log({ e }));
    const branch = await git.currentBranch({
      fs,
      dir,
      fullname: false,
    });
    console.log(branch);
    console.log('done');
    logger.debug('utils.js', 'Pulled the project');
    // console.log('pulled the repo ', localBranch);
    // if (remoteBranch === 'master') {
    //   console.log('master');
    //   const deleteStatus = await deleteBranch(fs, dir, localBranch);
    //   const createStatus = await createBranch(fs, dir, localBranch);
    //   const checkoutStatus = createStatus && await checkoutToBranch(fs, dir, localBranch);
    //   console.log({ checkoutStatus });
    // }
    return true;
  } catch (error) {
    logger.error('utils.js', `Error in pulling project: ${error}`);
    console.error('Error in pulling project:', error);
    const status = await git.status({ fs, dir });
    console.log(status);
    return false;
  }
}
export async function fub({ contents }) {
  console.log(contents);
}
// Fetch function
export async function mergeBranches(fs, dir, branch, localBranch) {
  logger.debug('utils.js', 'in mergeBranch - delete a new branch ');
  console.log(dir, branch, localBranch);
  try {
    // await git.fetch({
    //   fs,
    //   http,
    //   dir,
    //   url,
    //   remoteRef: branch,
    //   depth: 1,
    //   singleBranch: true,
    //   onAuth: () => ({ username: token }),
    // });
    // logger.debug('utils.js', 'fetch Branch');
    // console.log('branch fetched');
    await git.merge({
      fs,
      dir,
      // ours: localBranch,
      // theirs: `origin/${branch}`,
      ours: branch,
      theirs: localBranch,
      abortOnConflict: false,
    }).catch((e) => {
      console.log({ e });
      if (e) {
        console.log(
          'Automatic merge failed for the following files: '
          + `${e.data}. `
          + 'Resolve these conflicts and then commit your changes.',
        );
        throw e;
      }
    });
    return true;
  } catch (error) {
    logger.error('utils.js', `Error merge branch: ${error}`);
    console.error('Error merge Branch :', error);
    return false;
  }
}

// Git ignor files
export async function ignorFiles(fs, dir) {
  logger.debug('utils.js', 'in ignorFiles - create a new branch from current');
  try {
    await git.isIgnored({
      fs,
      dir,
      filepath: 'metadata.json',
    });
    await git.isIgnored({
      fs,
      dir,
      filepath: 'ingredients/scribe-settings.json',
    });
    logger.debug('utils.js', 'ignorFiles');
    console.log('branch created');
    return true;
  } catch (error) {
    logger.error('utils.js', `Error ignorFiles: ${error}`);
    console.error('Error ignorFiles :', error);
    return false;
  }
}

// getConfig for repo owner
export async function getRepoOwner(fs, dir) {
  logger.debug('utils.js', 'in getRepoOwner - get repo owner');
  try {
    const value = await git.getConfig({
      fs,
      dir,
      path: 'remote.origin.url',
    });
    console.log({ value });
    const val = value.split('/');
    console.log(val[val.length - 2]);
    logger.debug('utils.js', 'getRepoOwner');
    return val[val.length - 2];
  } catch (error) {
    logger.error('utils.js', `Error getRepoOwner: ${error}`);
    console.error('Error getRepoOwner :', error);
    return null;
  }
}

// create git ignore file in path
export async function createGitIgnore(fs, dir) {
  logger.debug('utils.js', 'in getRepoOwner - get repo owner');
  const gitignoreContent = '# Ignore .json files (scribe setting files)\n*.json';
  try {
    await fs.writeFileSync(`${dir}/.gitignore`, gitignoreContent);
    console.log('.gitignore file created successfully.');
    return true;
  } catch (error) {
    logger.error('utils.js', `Error getRepoOwner: ${error}`);
    console.error('Error getRepoOwner :', error);
    return false;
  }
}

// Fetch and merge remote main to local
export async function remoteMerge(fs, dir, branch, localBranch, token) {
  logger.debug('utils.js', 'in remote merge - fetch and merge new branch ');
  console.log(dir, branch, localBranch);
  try {
    await git.fetch({
      fs,
      http,
      dir,
      remote: 'origin',
      remoteRef: branch,
      depth: 1,
      singleBranch: true,
      onAuth: () => ({ username: token }),
    });
    logger.debug('utils.js', 'fetch Branch');
    console.log('branch fetched');
    await git.merge({
      fs,
      dir,
      ours: localBranch,
      theirs: `origin/${branch}`,
      // ours: branch,
      // theirs: localBranch,
      abortOnConflict: false,
    }).catch((e) => {
      console.log({ e });
      if (e) {
        console.log(
          'Automatic merge failed for the following files: '
          + `${e.data}. `
          + 'Resolve these conflicts and then commit your changes.',
        );
      } else { throw e; }
    });
    console.log('merge succeess remote/origin - local');
    return true;
  } catch (error) {
    logger.error('utils.js', `Error merge branch: ${error}`);
    console.error('Error merge Branch :', error);
    return false;
  }
}

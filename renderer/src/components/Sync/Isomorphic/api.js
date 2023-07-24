import { environment } from '../../../../environment';

// api for creating a repo in git
export const createRepo = async (repoName, token) => {
  const endpoint = `${environment.GITEA_API_ENDPOINT}/user/repos`;
  const myHeaders = new Headers();
  myHeaders.append('Authorization', `Bearer ${token}`);
  myHeaders.append('Content-Type', 'application/json');
  const payloadPr = JSON.stringify({
    name: repoName,
    readme: repoName,
    description: repoName,
    default_branch: 'master',
  });
  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: payloadPr,
    redirect: 'follow',
  };
  const fetchResult = await fetch(endpoint, requestOptions);
  const result = await fetchResult.json();
  return result;
};

export const createRemoteBranch = async (auth, repo, userBranch, newBranch) => {
  const endpoint = `${environment.GITEA_API_ENDPOINT}/repos/${auth.user.username}/${repo.name}/branches`;
  const myHeaders = new Headers();
  myHeaders.append('Authorization', `Bearer ${auth.token.sha1}`);
  myHeaders.append('Content-Type', 'application/json');
  const payloadPr = JSON.stringify({
    new_branch_name: newBranch,
    old_branch_name: userBranch,
  });
  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: payloadPr,
    redirect: 'follow',
  };
  const fetchResult = await fetch(endpoint, requestOptions);
  const result = await fetchResult.json();
  return result;
};

export const getRepoByOwner = async (owner, repoName) => {
  const endpoint = `${environment.GITEA_API_ENDPOINT}/repos/${owner}/${repoName}`;
  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');
  const fetchResult = await fetch(endpoint);
  const result = await fetchResult.json();
  return result;
};

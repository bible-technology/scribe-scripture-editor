import { environment } from 'environment';

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

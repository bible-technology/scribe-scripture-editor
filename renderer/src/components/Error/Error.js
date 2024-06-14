/* eslint-disable */
// import { Configuration, PublicApi } from '@ory/kratos-client';
import React from 'react';
// import configData from '../../config.json';

// const kratos = new PublicApi(new Configuration({ basePath: configData.base_url }));

const Error = () => {
  // This component is for the development purpose to get the errors from Kratos
  const [error, setError] = React.useState('');
    React.useEffect(() => {
        const url = window.location.href;
        const regex = /(.*)error\?error=/gm;
        kratos
        .getSelfServiceError(url.replace(regex, ''))
        .then(({ data: body }) => {
          setError(body);
            // console.log('error', body);
        });
    });

    return (
      <div>
        <h1>Error</h1>
        <p>{error}</p>
      </div>
);
};
export default Error;

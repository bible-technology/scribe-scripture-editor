import dynamic from 'next/dynamic';
import Meta from '../src/Meta';
import AuthenticationContextProvider from '../src/components/Login/AuthenticationContextProvider';

const Home = dynamic(
  () => import('../src/Home'),
  { ssr: false },
);

const index = () => (
  <>
    <Meta />
    <AuthenticationContextProvider>
      <Home />
    </AuthenticationContextProvider>
  </>
);

export default index;

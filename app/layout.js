import { Providers } from './providers';
import '../styles/nprogress.css';
import '../styles/globals.css';
// import { initializeParse } from '@parse/react-ssr';
import 'usfm-editor/dist/style.css';
import '../styles/style-override.lazy.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Providers>
        <body>{children}</body>
      </Providers>
    </html>
  );
}

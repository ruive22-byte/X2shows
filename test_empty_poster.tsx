import { renderToString } from 'react-dom/server';
// We can't easily render a component with useEffect using renderToString because useEffect doesn't run on the server.

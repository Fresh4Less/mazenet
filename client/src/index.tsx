/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Mazenet from './Mazenet';
import registerServiceWorker from './registerServiceWorker';
import './index.css';

ReactDOM.render(
  <Mazenet />,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();

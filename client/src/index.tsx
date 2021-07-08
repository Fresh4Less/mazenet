/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Mazenet from './components/mazenet';
import * as css from './index.css';

declare global {
    interface Window { Mazenet: any; }
}
window.Mazenet = window.Mazenet || {};

/* Debug var defined in webpack.config.js */
declare var __REPO_VERSION__: string;
declare var __CLIENT_VERSION__: string;
declare var __SERVER_VERSION__: string
declare var __BUILD_DATE__: string;

console.log(`MAZENET VERSIONS:
\tMAZENT:\t${__REPO_VERSION__}
\tCLIENT:\t${__CLIENT_VERSION__}
\tSERVER:\t${__SERVER_VERSION__}`);
let buildDate = new Date(__BUILD_DATE__);
console.log(`BUILD_DATE: ${buildDate.toLocaleString('en-US')} [${Math.floor((new Date().getTime() - buildDate.getTime()) / 1000)} seconds ago]`);

const root = document.body.appendChild(document.createElement('div')) as HTMLDivElement;
root.id = css.root;

ReactDOM.render(
    <Mazenet/>,
    root,
);

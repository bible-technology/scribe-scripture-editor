const { ipcRenderer } = require('electron');
const log = require('electron-log');
const fontList = require('font-list');
const { PdfGen } = require('jxl-pdf');
const puppeteer = require('puppeteer-core');

const _fonts = [];
const fetchFonts = async () => {
  fontList.getFonts()
  .then((fonts) => {
    fonts.forEach((element) => {
      _fonts.push(element.replace(/"/gm, ''));
    });
  })
  .catch((err) => {
    throw (err);
  });
};
fetchFonts();

process.once('loaded', () => {
  global.ipcRenderer = ipcRenderer;
  global.puppeteer = puppeteer;
  global.log = log;
  global.PdfGenStatic = PdfGen;
  global.fonts = _fonts;
});
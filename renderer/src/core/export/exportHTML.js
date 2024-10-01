import * as logger from '../../logger';
// id, currentBook, db, direction, column, currentTrans
import { readIngredients } from '../reference/readIngredients';
import {
  css_1_col_ltr,
  css_2_col_ltr,
  css_1_col_rtl,
  css_2_col_rtl,
} from './exportCSS';
import packageInfo from '../../../../package.json';

const grammar = require('usfm-grammar');
const path = require('path');

function getTimeStamp(date) {
  const year = date.getFullYear();
  // months are zero indexed
  const month = (date.getMonth() + 1 < 10 ? '0' : '') + (date.getMonth() + 1);
  const day = (date.getDate() < 10 ? '0' : '') + date.getDate();
  const hour = (date.getHours() < 10 ? '0' : '') + date.getHours();
  const minute = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
  const second = (date.getSeconds() < 10 ? '0' : '') + date.getSeconds();
  // hourFormatted = hour % 12 || 12, // hour returned in 24 hour format
  // minuteFormatted = minute < 10 ? "0" + minute : minute,
  // morning = hour < 12 ? "am" : "pm";
  return (
    year.toString().substr(2, 2) + month + day + hour + minute + second).toString();
}
export const exportHTML = () => {
  const direction = 'LTR';
  const column = 2;
  const currentBook = 'GEN';
  let contentFlag = false;
  const newpath = localStorage.getItem('userPath');
  const folder = path.join(newpath, packageInfo.name, 'users', 'username', 'projects', 'Testing Bible', 'ingredients');
  if (direction !== 'RTL') {
    let htmlContent = '';
    let inlineData = `<!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="">
    ${column === 1 ? css_1_col_ltr : css_2_col_ltr}
    </head>
    <body class="body">
    <center><h1>${currentBook}</h1></center>
    <div class="newspaper">`;
    readIngredients({
      projectname: 'Testing Bible',
      refName: 'ingredients',
      filePath: `${currentBook}.usfm`,
    }).then((res) => {
      const myUsfmParser = new grammar.USFMParser(res);
      const doc = myUsfmParser.toJSON();
      doc.chapters.forEach((obj) => {
        // const count = 0;
        // let verseNumber;
        // let verses;
        htmlContent += `<ul class="list">
            <li>
              <p class="firstLi"><span class="chapter">${obj.chapterNumber}</span></p>
            </li><li><ol>`;
        for (let i = 0; i < obj.contents.length; i += 1) {
          if (
            obj.contents[i].verseNumber !== ''
              && obj.contents[i].verseNumber !== null
          ) {
            contentFlag = true;
          }
          // console.log(obj.contents[i].verseNumber);
          // count += 1;
          // if (count < obj.contents.length && obj.contents[count].joint_verse) {
          //   // Finding out the join verses and get their verse number(s)
          // verseNumber=`${obj.contents[count].joint_verse }-${ obj.contents[count].verseNumber}`;
          //   verses = obj.contents[(obj.contents[count].joint_verse) - 1].verse;
          //   // continue;
          // } elseif (verseNumber) {
          // Push join verse number (1-3) and content.
          // htmlContent += `<div class="verseDiv"><p class="prespace">
          // <span class="verseSpan">${verseNumber}</span>${verses}</p></div>`;
          //   verseNumber = undefined;
          //   verses = undefined;
          // } else {
          if (obj.contents[i].verseNumber) {
            // Push verse number and content.
            htmlContent += `<div class="verseDiv"><p class="prespace"><span class="verseSpan">${obj.contents[i].verseNumber} </span>${obj.contents[i].verseText}</p></div>`;
          }
        }
        htmlContent += '</ol></li></ul>';
        if (contentFlag) {
          inlineData += htmlContent;
        }
        htmlContent = '';
        contentFlag = false;
      });
      inlineData += '</div></body></html>';

      const filepath = path.join(
        folder,
        `${currentBook.toLowerCase()}_${column}col_${getTimeStamp(
          new Date(),
        )}.html`,
      );
      const fs = window.require('graceful-fs');
      fs.writeFile(filepath, inlineData, (err) => {
        if (err) {
          logger.info('dynamic-msg-went-wrong', err);
        } else {
          logger.info('exported successfully', err);
        }
      });
    });
  } else {
    let htmlContent = '';
    let inlineData = `<!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="description" content="">
        ${column === 1 ? css_1_col_rtl : css_2_col_rtl}
      </head>
      <body class="body">
      <center><h1>${currentBook}</h1></center>
      <div class="newspaper">`;
    let contentFlag = false;
    readIngredients({
      projectname: 'Testing Bible',
      refName: 'ingredients',
      filePath: `${currentBook}.usfm`,
    }).then((res) => {
      const myUsfmParser = new grammar.USFMParser(res);
      const doc = myUsfmParser.toJSON();
      doc.chapters.forEach((obj) => {
        htmlContent += `<ul class="list">
          <li>
              <p class="firstLi"><span class="chapter">${obj.chapter}</span></p>
          </li><li><ol>`;
        for (let i = 0; i < obj.verses.length; i += 1) {
          if (
            obj.verses[i].verse !== ''
            && obj.verses[i].verse !== null
          ) {
            contentFlag = true;
          }
          if (obj.contents[i].verseNumber) {
            // Push verse number and content.
            htmlContent += `<div class="verseDiv"><p class="prespace"><span class="verseSpan">${obj.verses[i].verse_number} </span>${obj.verses[i].verse}</p></div>`;
          }
        }
        htmlContent += '</ol></li></ul>';
        if (contentFlag) {
          inlineData += htmlContent;
        }
        htmlContent = '';
        contentFlag = false;
      });
      inlineData += '</div></body></html>';
      const filepath = path.join(
        folder,
        `${currentBook.toLowerCase()}_${column}col_${getTimeStamp(
          new Date(),
        )}.html`,
      );
      const fs = window.require('graceful-fs');
      fs.writeFile(filepath, inlineData, (err) => {
        if (err) {
          logger.info('dynamic-msg-went-wrong', err);
        } else {
          logger('exported successfully', err);
        }
      });
    });
  }
};

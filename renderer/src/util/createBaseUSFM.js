// function to create base USFM file based on provided scope and versification scheme
import moment from 'moment';
import { environment } from '../../environment';
import * as logger from '../logger';
import packageInfo from '../../../package.json';

const grammar = require('usfm-grammar');
const path = require('path');
const md5 = require('md5');

const schemes = [
  { name: 'eng', file: 'eng.json' },
  { name: 'lxx', file: 'lxx.json' },
  { name: 'org', file: 'org.json' },
  { name: 'rsc', file: 'rsc.json' },
  { name: 'rso', file: 'rso.json' },
  { name: 'vul', file: 'vul.json' },
];

export async function createMergeBaseUSFMwithScope(incomingMeta) {
  logger.debug('createBaseUSFMwithScope.js', 'In createBaseUSFMwithScope');
  const currentScheme = schemes.find((scheme) => scheme.name === incomingMeta.llll.toLowerCase());
  const currentScope = Object.keys(incomingMeta.type.flavorType.currentScope);

  const ingredients = {};

  return new Promise((resolve) => {
    const fs = window.require('fs');

    // read it from backend settings json

    // eslint-disable-next-line import/no-dynamic-require
    const schemeUSFMFile = require(`../lib/versification/${currentScheme.file}`);

    currentScope.forEach((scope) => {

    });
  });
}

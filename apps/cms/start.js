'use strict';
// Production entry point: explicitly passes distDir so Strapi finds compiled
// configs, content types, and admin panel in ./dist/ without needing
// tsconfig.json (which is excluded from the Docker runtime image).
const path = require('path');
const { createStrapi } = require('@strapi/strapi');

const appDir = process.cwd();
const distDir = path.resolve(appDir, 'dist');

createStrapi({ appDir, distDir }).start();

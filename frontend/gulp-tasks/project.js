/**
 * @license
 * Copyright (c) 2017 Preview-Code. All rights reserved.
 * This code may only be used under the BSD style license found in LICENSE.txt
  */

'use strict';

const path = require('path');
const gulp = require('gulp');
const mergeStream = require('merge-stream');
const polymer = require('polymer-build');

const polymerJSON = require(global.config.polymerJsonPath);
const project = new polymer.PolymerProject(polymerJSON);
const bundledPath = path.join(global.config.build.rootDirectory, global.config.build.bundledDirectory);
const unbundledPath = path.join(global.config.build.rootDirectory, global.config.build.unbundledDirectory);

const htmlSplitter = new polymer.HtmlSplitter();

// This is the heart of polymer-build, and exposes much of the
// work that Polymer CLI usually does for you
// There are tasks to split the source files and dependency files into
// streams, and tasks to rejoin them and output service workers
// You should not need to modify anything in this file
// If you find that you can't accomplish something because of the way
// this module is structured please file an issue
// https://github.com/PolymerElements/generator-polymer-init-custom-build/issues

// Returns a ReadableStream of all the source files
// Source files are those in src/** as well as anything
// added to the sourceGlobs property of polymer.json
function splitSource() {
  return project.sources().pipe(htmlSplitter.split());
}

// Returns a ReadableStream of all the dependency files
// Dependency files are those in bower_components/**
function splitDependencies() {
  return project.dependencies().pipe(htmlSplitter.split());
}

// Returns a WriteableStream to rejoin all split files
function rejoin() {
  return htmlSplitter.rejoin();
}

// Returns a function which accepts refernces to functions that generate
// ReadableStreams. These ReadableStreams will then be merged, and used to
// generate the bundled and unbundled versions of the site.
// Takes an argument for the user to specify the kind of output they want
// either bundled or unbundled. If this argument is omitted it will output both
function merge(source, dependencies) {
  return function output() {
    const mergedFiles = mergeStream(source(), dependencies());

    const bundleType = global.config.build.bundleType;
    const tasks = [];

    if (bundleType === 'both' || bundleType === 'bundled') {
      tasks.push(polymer.forkStream(mergedFiles)
      .pipe(project.bundler())
      .pipe(gulp.dest(bundledPath)));
    }
    if (bundleType === 'both' || bundleType === 'unbundled') {
      tasks.push(polymer.forkStream(mergedFiles)
      .pipe(gulp.dest(unbundledPath)));
    }
    return Promise.all(tasks);
  };
}

// Returns a function which takes an argument for the user to specify the kind
// of bundle they're outputting (either bundled or unbundled) and generates a
// service worker for that bundle.
// If this argument is omitted it will create service workers for both bundled
// and unbundled output
function serviceWorker() {
  const bundleType = global.config.build.bundleType;
  let workers = [];

  if (bundleType === 'both' || bundleType === 'bundled') {
    workers.push(writeBundledServiceWorker());
  }
  if (bundleType === 'both' || bundleType === 'unbundled') {
    workers.push(writeUnbundledServiceWorker());
  }

  return Promise.all(workers);
}

// Returns a Promise to generate a service worker for bundled output
function writeBundledServiceWorker() {
  return polymer.addServiceWorker({
    project: project,
    buildRoot: bundledPath,
    swPrecacheConfig: global.config.swPrecacheConfig,
    path: global.config.serviceWorkerPath,
    bundled: true
  });
}

// Returns a Promise to generate a service worker for unbundled output
function writeUnbundledServiceWorker() {
  return polymer.addServiceWorker({
    project: project,
    buildRoot: unbundledPath,
    swPrecacheConfig: global.config.swPrecacheConfig,
    path: global.config.serviceWorkerPath
  });
}

module.exports = {
  splitSource: splitSource,
  splitDependencies: splitDependencies,
  rejoin: rejoin,
  merge: merge,
  serviceWorker: serviceWorker
};

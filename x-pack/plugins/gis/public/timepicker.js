/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import moment from 'moment';
import { uiModules } from 'ui/modules';
import chrome from 'ui/chrome';
import 'ui/autoload/all';

let globalTimefilter;

// hack to wait for angular template to be ready
const waitForAngularReady = new Promise(resolve => {
  const checkInterval = setInterval(() => {
    const hasElm = !!document.querySelector('#gis-top-nav');
    if (hasElm) {
      clearInterval(checkInterval);
      resolve();
    }
  }, 10);
});

export function initTimepicker(callback) {
  // default the timepicker to the last 24 hours
  chrome.getUiSettingsClient().overrideLocalDefault(
    'timepicker:timeDefaults',
    JSON.stringify({
      from: 'now-24h',
      to: 'now',
      mode: 'quick'
    })
  );

  uiModules
    .get('app/apm', [])
    .controller('TimePickerController', ($scope, timefilter) => {
      // Add APM feedback menu
      // TODO: move this somewhere else
      $scope.topNavMenu = [];
      timefilter.setTime = (from, to) => {
        timefilter.time.from = moment(from).toISOString();
        timefilter.time.to = moment(to).toISOString();
        $scope.$apply();
      };
      timefilter.enableTimeRangeSelector();
      timefilter.enableAutoRefreshSelector();
      timefilter.init();

      globalTimefilter = timefilter;

      Promise.all([waitForAngularReady]).then(callback);
    });
}

export function getTimefilter() {
  if (!globalTimefilter) {
    throw new Error(
      'Timepicker must be initialized before calling getTimefilter'
    );
  }
  return globalTimefilter;
}

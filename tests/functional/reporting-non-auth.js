/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'tests/functional/lib/helpers',
  'require'
], function(intern, registerSuite, assert, FunctionalHelpers, require) {
  'use strict';

  var url = intern.config.siteRoot;

  registerSuite({
    name: 'Reporting (non-auth)',

    'Submit buttons are disabled': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url + '?open=1'))
        .findByCssSelector('#submitanon').getAttribute('class')
        .then(function(className) {
          assert.include(className, 'is-disabled');
        })
        .end()
        .findByCssSelector('#submitgithub').getAttribute('class')
        .then(function(className) {
          assert.include(className, 'is-disabled');
        });
    },

    'Wyciwyg bug workaround': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url + '?open=1&url=wyciwyg://0/http://bbs.csdn.net/topics/20282413'))
        .findByCssSelector('#url').getProperty('value')
        .then(function(value) {
          assert.notInclude(value, 'wyciwyg://0/');
        })
        .end();
    },

    'Report button shows via GitHub': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url + '?open=1'))
        // do some junk here just so we know the form-open animation is done
        .then(FunctionalHelpers.visibleByQSA('#url'))
        .findByCssSelector('#url').click()
        .end()
        .findByCssSelector('#browser').click()
        .end()
        .findByCssSelector('#url').click()
        .end()
        .findByCssSelector('#submitgithub').getVisibleText()
        .then(function(text) {
          assert.include(text, 'Report via'); //Report via GitHub (logged out)
        })
        .end();
    },

    'URL validation': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url + '?open=1'))
        //allow form load
        .then(FunctionalHelpers.visibleByQSA('#url'))
        .findByCssSelector('#url').click()
        .end()
        .findByCssSelector('#browser').click()
        .end()
        .findByCssSelector('#url').click()
        .end()
        // wait a bit
        .then(FunctionalHelpers.visibleByQSA('label[for=url] + span'))
        .findByXpath('//*[@id="js-ReportForm"]/div/form/div[1]/div[2]/div[1]').getAttribute('class')
        .then(function(className) {
          assert.include(className, 'js-form-error');
          assert.notInclude(className, 'js-no-error');
        })
        .end()
        .findByCssSelector('#url').type('sup')
        .end()
        // wait a bit
        .sleep(250)
        // xpath to the #url formGroup
        .findByXpath('//*[@id="js-ReportForm"]/div/form/div[1]/div[2]/div[1]').getAttribute('class')
        .then(function(className) {
          assert.include(className, 'js-no-error');
          assert.notInclude(className, 'js-form-error');
        })
        .end();
    },

    '(optional) browser + os validation': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url + '?open=1'))
        .then(FunctionalHelpers.visibleByQSA('#browser'))
        // xpath to the #browser formGroup
        .findByXpath('//*[@id="js-ReportForm"]/div/form/div[1]/div[2]/div[2]').getAttribute('class')
        .then(function(className) {
          assert.include(className, 'js-no-error');
          assert.notInclude(className, 'js-form-error');
        })
        .end()
        .findByCssSelector('#browser').clearValue()
        .end()
        .findByCssSelector('#os').click()
        .end()
        // wait a bit
        .sleep(250)
        // xpath to the #browser formGroup
        .findByXpath('//*[@id="js-ReportForm"]/div/form/div[1]/div[2]/div[2]').getAttribute('class')
        .then(function(className) {
          assert.notInclude(className, 'js-form-error');
          assert.notInclude(className, 'js-no-error');
        })
        .end();
    },

    'Problem type validation': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url + '?open=1'))
        .then(FunctionalHelpers.visibleByQSA('#description'))
        .findByCssSelector('#description').click()
        .end()
        .then(FunctionalHelpers.visibleByQSA('.is-error > fieldset:nth-child(1) > div:nth-child(1) > span:nth-child(2)'))
        .findByXpath('//*[@id="js-ReportForm"]/div/form/div[1]/div[1]/div').getAttribute('class')
        .then(function(className) {
          assert.include(className, 'is-error js-form-error');
          assert.notInclude(className, 'js-no-error');
        })
        .end()
        // pick a problem type
        .findByCssSelector('#problem_category-0').click()
        .end()
        // wait a bit
        .sleep(250)
        // validation message should be removed now
        .findByXpath('//*[@id="js-ReportForm"]/div/form/div[1]/div[1]/div').getAttribute('class')
        .then(function(className) {
          assert.include(className, 'js-no-error');
          assert.notInclude(className, 'is-error js-form-error');
        })
        .end();
    },

    'Image extension validation': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url + '?open=1'))
        .findByCssSelector('#image').type('/path/to/foo.hacks')
        .end()
        // wait a bit
        .sleep(250)
        .findByCssSelector('.js-image-upload').getAttribute('class')
        .then(function(className) {
          assert.include(className, 'js-form-error');
          assert.notInclude(className, 'js-no-error');
        })
        .end()
        // pick a valid file type
        .findByCssSelector('#image').type('/path/to/foo.jpg')
        .end()
        // wait a bit
        .sleep(250)
        // validation message should be removed now
        .findByCssSelector('.js-image-upload').getAttribute('class')
        .then(function(className) {
          assert.include(className, 'js-no-error');
          assert.notInclude(className, 'js-form-error');
        })
        .end();
    },

    'Submits are enabled': function() {
      return this.remote
        .setFindTimeout(intern.config.wc.pageLoadTimeout)
        .get(require.toUrl(url + '?open=1'))
        // pick a valid file type
        .findByCssSelector('#image').type('/path/to/foo.png')
        .end()
        .findByCssSelector('#url').type('http://coolguy.biz')
        .end()
        // pick a problem type
        .findByCssSelector('#problem_category-0').click()
        .end()
        .findByCssSelector('#description').click()
        .end()
        // wait a bit
        .sleep(250)
         // now make sure the buttons aren't disabled anymore
        .findByCssSelector('#submitanon').getAttribute('class')
        .then(function(className) {
          assert.notInclude(className, 'is-disabled');
        })
        .end()
         // now make sure the buttons aren't disabled anymore
        .findByCssSelector('#submitgithub').getAttribute('class')
        .then(function(className) {
          assert.notInclude(className, 'is-disabled');
        })
        .end();
    }
  });
});

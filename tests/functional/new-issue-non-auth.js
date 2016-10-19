/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'require'
], function(intern, registerSuite, assert, require) {
  'use strict';

  var url = function(path) {
    return intern.config.siteRoot + path;
  };

  registerSuite({
    name: 'New Issue Page',

    'new issue page loads': function() {
      return this.remote
        .get(require.toUrl(url('/issues/new')))
        .findByCssSelector('.js-Navbar-link').getVisibleText()
        .then(function(text) {
          assert.equal(text, 'Home');
          assert.notInclude(text, 'Download our');
        })
        .end();
    }
  });
});

// Copyright (C) 2017 Atomic Jolt

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

var ERR = require("async-stacktrace");
var settings = require('ep_etherpad-lite/node/utils/Settings');
var crypto = require('crypto');
var path = require('path');
var fs = require('fs');
var db = require("ep_etherpad-lite/node/db/DB").db;

/* sotauthUsername is set by authenticate and used in messageHandler, keyed on express_sid */
var sotauthUsername = {};

function recentEnough(timestamp){
  var maxAllowedTime = 100000; // 100 seconds
  var now = new Date().valueOf();
  return Math.abs(now - timestamp) < maxAllowedTime;
}

function validSignature(payload, signature){
  var verify = crypto.createVerify('RSA-SHA256');
  verify.update(payload);
  var absolutePath = path.resolve('./node_modules/ep_signatureauth/public_key.pem');
  var publicKey = fs.readFileSync(absolutePath, 'utf8');
  var valid = verify.verify(publicKey, signature, 'base64');
  return valid;
}

function getAuthor(username, cb){
  db.get("globalAuthor:" + username, cb);
}

function createAuthor(username, callback)
{
  var authorObj = {"colorId" : Math.floor(Math.random()*(getColorPalette().length)), "name": username, "timestamp": new Date().getTime()};
  db.set("globalAuthor:" + username, authorObj);
  callback(null, {authorID: username});
}

function getColorPalette() {
  return ["#ffc7c7", "#fff1c7", "#e3ffc7", "#c7ffd5", "#c7ffff", "#c7d5ff", "#e3c7ff", "#ffc7f1", "#ff8f8f", "#ffe38f", "#c7ff8f", "#8fffab", "#8fffff", "#8fabff", "#c78fff", "#ff8fe3", "#d97979", "#d9c179", "#a9d979", "#79d991", "#79d9d9", "#7991d9", "#a979d9", "#d979c1", "#d9a9a9", "#d9cda9", "#c1d9a9", "#a9d9b5", "#a9d9d9", "#a9b5d9", "#c1a9d9", "#d9a9cd", "#4c9c82", "#12d1ad", "#2d8e80", "#7485c3", "#a091c7", "#3185ab", "#6818b4", "#e6e76d", "#a42c64", "#f386e5", "#4ecc0c", "#c0c236", "#693224", "#b5de6a", "#9b88fd", "#358f9b", "#496d2f", "#e267fe", "#d23056", "#1a1a64", "#5aa335", "#d722bb", "#86dc6c", "#b5a714", "#955b6a", "#9f2985", "#4b81c8", "#3d6a5b", "#434e16", "#d16084", "#af6a0e", "#8c8bd8"];
}

exports.authorize = function(hook_name, context, cb) {
  if (context.resource.match(/^\/(static|javascripts|pluginfw|favicon.ico|api)/)) {
    return cb([true]);
  } else {
    var url = context.req.url;

    if (url.startsWith('/p/')) {

      var signature = context.req.query.signature;
      var url_payload = url.split("&signature=")[0];
      var payload = url_payload.split('?')[1];
      var timestamp = context.req.query.timestamp;
      var valid = validSignature(payload, signature) && recentEnough(timestamp);

      if(valid){
        var user_id = context.req.query.user_id;
        var username = context.req.query.username;
        getAuthor(username, (err, res) => {
          if (!res)
            createAuthor(username, (err, res) => (console.log(res)));
        });
      }
      return cb([valid]);
    } else {
      return true;
    }
  }
};

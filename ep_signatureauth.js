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

const ERR = require("async-stacktrace");
const settings = require('ep_etherpad-lite/node/utils/Settings');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const db = require("ep_etherpad-lite/node/db/DB").db;
const cks = require("cookies");
const yaml = require('js-yaml');

const absolutePath = path.resolve(('./secrets.yml'));
const secretYml = yaml.safeLoad(fs.readFileSync(absolutePath, 'utf8'));

function recentEnough(timestamp){
  const maxAllowedTime = 100000; // 100 seconds
  const now = new Date().valueOf();
  return Math.abs(now - timestamp) < maxAllowedTime;
}

function validSignature(payload, signature){
  const hmac = crypto.createHmac('sha1', secretYml);
  hmac.update(payload);
  const hmac_result = hmac.digest('hex');
  const result = new Buffer(hmac_result, 'utf-8');
  const buf = new Buffer(signature, 'utf-8');
  const valid = crypto.timingSafeEqual(result, buf);

  return valid;
}

function getAuthor(username, cb){
  db.get("globalAuthor:" + username, cb);
}

function createAuthor(username, callback)
{
  const authorObj = {"colorId" : Math.floor(Math.random()*(getColorPalette().length)), "name": username, "timestamp": new Date().getTime()};
  db.set("globalAuthor:" + username, authorObj);
  callback(null, {authorID: username});
}

function getColorPalette() {
  return ["#ffc7c7", "#fff1c7", "#e3ffc7", "#c7ffd5", "#c7ffff", "#c7d5ff", "#e3c7ff", "#ffc7f1", "#ff8f8f", "#ffe38f", "#c7ff8f", "#8fffab", "#8fffff", "#8fabff", "#c78fff", "#ff8fe3", "#d97979", "#d9c179", "#a9d979", "#79d991", "#79d9d9", "#7991d9", "#a979d9", "#d979c1", "#d9a9a9", "#d9cda9", "#c1d9a9", "#a9d9b5", "#a9d9d9", "#a9b5d9", "#c1a9d9", "#d9a9cd", "#4c9c82", "#12d1ad", "#2d8e80", "#7485c3", "#a091c7", "#3185ab", "#6818b4", "#e6e76d", "#a42c64", "#f386e5", "#4ecc0c", "#c0c236", "#693224", "#b5de6a", "#9b88fd", "#358f9b", "#496d2f", "#e267fe", "#d23056", "#1a1a64", "#5aa335", "#d722bb", "#86dc6c", "#b5a714", "#955b6a", "#9f2985", "#4b81c8", "#3d6a5b", "#434e16", "#d16084", "#af6a0e", "#8c8bd8"];
}

function signaturePayload(context){
  const signature = context.req.query.signature;
  const payload = context.req.url.split('&signature=')[0];
  const timestamp = context.req.query.timestamp;
  return (validSignature(payload, signature) && recentEnough(timestamp));
}

function author(username) {
  getAuthor(username, (err, res) => {
  if (!res)
    createAuthor(username, (err, res) => (console.log(res)));
  });
}

function cookieVerification(cookie) {
  const parsedCookie = JSON.parse(cookie);
  const signature = parsedCookie.signature;
  const payload = parsedCookie.payload;
  return validSignature(payload, signature);
}

exports.authorize = function(hook_name, context, cb) {
  if (context.resource.match(/^\/(static|javascripts|pluginfw|favicon.ico|api)/)) {
    return cb([true]);
  } else {
    const cookies = new cks(context.req, context.res);
    const url = context.req.url;
    const username = context.req.query.username;
    if (url.includes('&signature') && url.startsWith('/p/')) {
      if (signaturePayload(context)) {
        author(username);
        const simpleUrl = url.split('?')[0];
        const url_payload = url.split("&signature=")[0];
        const signature = context.req.query.signature;
        cookies.set(
          simpleUrl, `{ "signature": "${signature}", "payload": "${url_payload}" }`, { overwrite: true, maxAge: 100000000 }
        );
        return context.res.redirect(simpleUrl);
        return cb([true]);
      } else {
        return cb([false]);
      }
    } else {
      const cookie = cookies.get(url);
      if (cookie) {
        const cookieValid = cookieVerification(cookie);
        if (cookieValid) {
          author(username);
        }
        return cb([cookieValid]);
      } else {
        return cb[false];
      }
    }
  }
};

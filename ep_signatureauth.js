// Copyright (C) 2017,2021 Atomic Jolt

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

const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');

const settings = require('ep_etherpad-lite/node/utils/Settings');
const authorManager = require('ep_etherpad-lite/node/db/AuthorManager');

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

function verifyURLSignature(context){
  const signature = context.req.query.signature;
  const payload = context.req.url.split('&signature=')[0];
  const timestamp = context.req.query.timestamp;
  return (validSignature(payload, signature) && recentEnough(timestamp));
}

exports.authenticate = async (hook_name, context) => {
  const url = context.req.url;
  const username = context.req.query.username;
  if (url.includes('&signature') && url.startsWith('/p/')) {
    if (verifyURLSignature(context)) {
      settings.users[username] = { username };
      context.req.session.user = settings.users[username];
      return [true];
    } else {
      return [false];
    }
  }
  return [];
};

exports.authorize = async (hook_name, context) => {
  const user = context.req.session.user;

  const encodedPadId = (context.resource.match(/^\/p\/([^/]*)/) || [])[1];
  if (encodedPadId == null) return [];

  const padId = decodeURIComponent(encodedPadId);
  const url = context.req.url;
  if (url.includes('&signature') && url.startsWith('/p/')) {
    if (verifyURLSignature(context)) {
      // Set padAuthorizations for this pad. Normally we could depend on
      // the caller to set this, but the redirect skips that step
      if (user.padAuthorizations == null) user.padAuthorizations = {};
      user.padAuthorizations[padId] = 'create';

      // Redirect to simplify the url
      const simpleUrl = url.split('?')[0];
      context.res.redirect(simpleUrl);

      return ['create'];
    }
  }
  // Rely on the session padAuthorizations if we set it already
  if (user.padAuthorizations && user.padAuthorizations[padId]) return user.padAuthorizations[padId];

  return [false];
};

exports.handleMessage = async (hook_name, { message, socket }) => {
  // Update author name and prevent changes
  if (message.type == "CLIENT_READY" && message.token) {
    const user = socket.client.request.session.user;
    if (user && user.username) {
      const authorId = await authorManager.getAuthor4Token(message.token);
      authorManager.setAuthorName(authorId, user.username);
    }
  } else if (message.type == "USERINFO_UPDATE") {
    return [null];
  }
  return [message];
};

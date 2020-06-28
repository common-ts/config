"use strict";
var __assign = (this && this.__assign) || function () {
  __assign = Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
        t[p] = s[p];
    }
    return t;
  };
  return __assign.apply(this, arguments);
};
Object.defineProperty(exports,"__esModule",{value:true});
var config = (function () {
  function config() {
  }
  config.merge = function (root, rootEnvName, envName, env) {
    if (!rootEnvName || rootEnvName === '') {
      rootEnvName = 'development';
    }
    if (!envName || envName === '' || rootEnvName === envName) {
      return config.mergeEnv(root[rootEnvName], env);
    }
    else {
      var c2 = config.mergeEnvironments(root[rootEnvName], root[envName]);
      return config.mergeEnv(c2, env);
    }
  };
  config.mergeEnvironments = function (conf, conf2) {
    var keys = Object.keys(conf2);
    for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
      var key = keys_1[_i];
      var o2 = conf2[key];
      switch (typeof o2) {
        case 'object':
          if (Array.isArray(o2)) {
            conf[key] = o2;
          }
          else {
            var o1 = conf[key];
            if (o1 && typeof o1 === 'object' && !Array.isArray(o1)) {
              config.mergeEnvironments(o1, o2);
            }
          }
          break;
        default:
          if (o2 !== conf[key]) {
            conf[key] = o2;
          }
          break;
      }
    }
    return conf;
  };
  config.mergeEnv = function (conf, env) {
    return config.mergeWithPath(__assign({}, conf), env, null);
  };
  config.mergeWithPath = function (conf, env, parentPath) {
    var keys = Object.keys(conf);
    for (var _i = 0, keys_2 = keys; _i < keys_2.length; _i++) {
      var key = keys_2[_i];
      var envKey = config.buildFullPathEnv(parentPath, key);
      var envValue = env[envKey];
      switch (typeof conf[key]) {
        case 'object':
          if (Array.isArray(conf[key])) {
            try {
              if (envValue) {
                var newArray = JSON.parse(envValue);
                if (typeof newArray === 'object' && Array.isArray(newArray)) {
                  conf[key] = newArray;
                }
              }
            }
            catch (e) {
              console.log('Can\'t parse value of ' + envKey + ' env', e);
            }
          }
          else if (conf[key] !== null) {
            conf[key] = config.mergeWithPath(conf[key], env, envKey);
          }
          break;
        case 'boolean':
          if (envValue) {
            var nv = (env[envKey] === 'true');
            if (nv !== conf[key]) {
              conf[key] = nv;
            }
          }
          break;
        case 'number':
          if (!config.isEmpty(envValue) && config.r1.test(envValue)) {
            conf[key] = Number(envValue.replace(config.r2, ''));
          }
          break;
        case 'string':
          if (envValue && envValue.length > 0) {
            conf[key] = envValue;
          }
          break;
        default:
          break;
      }
    }
    return conf;
  };
  config.buildFullPathEnv = function (parentPath, key) {
    if (config.isEmpty(parentPath)) {
      return key.toUpperCase();
    }
    else {
      return parentPath + '_' + key.toUpperCase();
    }
  };
  config.isEmpty = function (s) {
    return (!s || s === '');
  };
  config.r1 = new RegExp(/^([0-9]+)(\.)?([0-9]+)?$/);
  config.r2 = /^0+/;
  return config;
}());
exports.config = config;
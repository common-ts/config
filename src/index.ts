import ProcessEnv = NodeJS.ProcessEnv;

const r1 = new RegExp(/^([0-9]+)(\.)?([0-9]+)?$/);
const r2 = /^0+/;

export function merge(root: any, rootEnvName: string, envName: string, env: ProcessEnv): any {
  if (!rootEnvName || rootEnvName === '') {
    rootEnvName = 'development';
  }
  if (!envName || envName === '' || rootEnvName === envName) {
    return mergeEnv(root[rootEnvName], env);
  } else {
    const c2 = mergeEnvironments(root[rootEnvName], root[envName]);
    return mergeEnv(c2, env);
  }
}

export function mergeEnvironments(conf: any, conf2: any): any {
  const keys = Object.keys(conf2);
  for (const key of keys) {
    const o2 = conf2[key];
    switch (typeof o2) {
      case 'object':
        if (Array.isArray(o2)) {
          conf[key] = o2;
        } else {
          const o1 = conf[key];
          if (o1 && typeof o1 === 'object' && !Array.isArray(o1)) {
            mergeEnvironments(o1, o2);
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
}

export function mergeEnv(conf: any, env: ProcessEnv): any {
  return mergeWithPath({ ...conf }, env, null);
}

export function mergeWithPath(conf: any, env: ProcessEnv, parentPath: string) {
  const keys = Object.keys(conf);
  for (const key of keys) {
    const envKey = buildFullPathEnv(parentPath, key);
    const envValue = env[envKey];
    switch (typeof conf[key]) {
      case 'object':
        if (Array.isArray(conf[key])) {
          try {
            if (envValue) {
              const newArray = JSON.parse(envValue);
              if (typeof newArray === 'object' && Array.isArray(newArray)) {
                conf[key] = newArray;
              }
            }
          } catch (e) {
            console.log('Can\'t parse value of ' + envKey + ' env', e);
          }
        } else if (conf[key] !== null) {
          conf[key] = mergeWithPath(conf[key], env, envKey);
        }
        break;
      case 'boolean':
        if (envValue) {
          const nv = (env[envKey] === 'true');
          if (nv !== conf[key]) {
            conf[key] = nv;
          }
        }
        break;
      case 'number':
        if (!isEmpty(envValue) && r1.test(envValue)) {
          conf[key] = Number(envValue.replace(r2, ''));
        }
        break;
      case 'string':
        if (envValue && envValue.length > 0) {
          // console.log('Override by environment parameter: ' + envKey);
          conf[key] = envValue;
        }
        break;
      default:
        break;
    }
  }
  return conf;
}

function buildFullPathEnv(parentPath: string, key: string): string {
  if (isEmpty(parentPath)) {
    return key.toUpperCase();
  } else {
    return parentPath + '_' + key.toUpperCase();
  }
}

function isEmpty(s: string): boolean {
  return (!s || s === '');
}

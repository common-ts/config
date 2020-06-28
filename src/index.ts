import ProcessEnv = NodeJS.ProcessEnv;

// tslint:disable-next-line:class-name
export class config {
  private static r1 = new RegExp(/^([0-9]+)(\.)?([0-9]+)?$/);
  private static r2 = /^0+/;

  static merge(root: any, rootEnvName: string, envName: string, env: ProcessEnv): any {
    if (!rootEnvName || rootEnvName === '') {
      rootEnvName = 'development';
    }
    if (!envName || envName === '' || rootEnvName === envName) {
      return config.mergeEnv(root[rootEnvName], env);
    } else {
      const c2 = config.mergeEnvironments(root[rootEnvName], root[envName]);
      return config.mergeEnv(c2, env);
    }
  }

  static mergeEnvironments(conf: any, conf2: any): any {
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
  }

  static mergeEnv(conf: any, env: ProcessEnv): any {
    return config.mergeWithPath({...conf}, env, null);
  }

  static mergeWithPath(conf: any, env: ProcessEnv, parentPath: string) {
    const keys = Object.keys(conf);
    for (const key of keys) {
      const envKey = config.buildFullPathEnv(parentPath, key);
      const envValue = env[envKey];
      switch (typeof conf[key]) {
        case 'object':
          // NOTE: With config is Array type, ENV value must following JSON string format to method can parse.
          // Example: STRING_ARRAY=\"[\"1\", \"2\"]\" or OBJECT_ARRAY=\"[{\"key\":\"value1\"}, {\"key\":\"value2\"}]\"
          if (Array.isArray(conf[key])) {
            try {
              if (envValue) {
                const newArray = JSON.parse(envValue);
                if (typeof newArray === 'object' && Array.isArray(newArray)) {
                  // console.log('Override by environment parameter: ' + envKey);
                  conf[key] = newArray;
                }
              }
            } catch (e) {
              console.log('Can\'t parse value of ' + envKey + ' env', e);
            }
          } else if (conf[key] !== null) {
            conf[key] = config.mergeWithPath(conf[key], env, envKey);
          }
          break;
        case 'boolean':
          if (envValue) {
            const nv = (env[envKey] === 'true');
            if (nv !== conf[key]) {
              // console.log('Override by environment parameter: ' + envKey + ' with value: ' + envValue);
              conf[key] = nv;
            }
          }
          break;
        case 'number':
          if (!config.isEmpty(envValue) && config.r1.test(envValue)) {
            // console.log('Override by environment parameter: ' + envKey + ' with value: ' + envValue);
            conf[key] = Number(envValue.replace(config.r2, ''));
          }
          break;
        case 'string':
          if (envValue && envValue.length > 0) {
            // console.log('Override by environment parameter: ' + envKey);
            conf[key] = envValue;
          }
          break;
        default:
          // console.warn('Detected new typeOf, ConfigUtil.mergeWithEnvironmentAndPath() need update code' , envKey, typeof config[key]);
          break;
        }
      }
    return conf;
  }

  private static buildFullPathEnv(parentPath: string, key: string): string {
    if (config.isEmpty(parentPath)) {
      return key.toUpperCase();
    } else {
      return parentPath + '_' + key.toUpperCase();
    }
  }

  private static isEmpty(s: string): boolean {
    return (!s || s === '');
  }
}

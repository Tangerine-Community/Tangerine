import { Injectable }  from '@angular/core';
// @ts-ignore
import { connectToCryptoPouchDb, connectToIndexedDb, connectToLegacyIdb } from './shared/_factories/db.factory';

function getAppConfig() {
  return new Promise((resolve, reject) => {
    function reqListener () {
      console.log(this.responseText);
      const appConfig = JSON.parse(this.responseText)
      resolve(appConfig)
    }
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", reqListener);
    oReq.open("GET", "./assets/app-config.json");
    oReq.send();
  })
}

async function hasInstalledOnLegacyIdb() {
  // Some initial process of elimination.
  if (await hasInstalledOnCryptoPouch() || await hasInstalledOnIndexedDB()) {
    return false
  }
  // See if the installed variable is set.
  let hasInstalled = false
  let db = connectToLegacyIdb('tangerine-variables')
  try {
    await db.get('installed')
    hasInstalled = true
  } catch(e) {
    hasInstalled = false
  }
  console.log("hasInstalledOnLegacyIdb: " + hasInstalled)
  return hasInstalled
}

async function hasInstalledOnCryptoPouch() {
  let hasInstalled = false
  let db = connectToCryptoPouchDb('tangerine-variables')
  try {
    const result = await db.get('encryptionType')
    if (result.value === 'cryptoPouch') {
      hasInstalled = true
    }
  } catch(e) {
    hasInstalled = false
  }
  console.log("hasInstalledOnCryptoPouch: " + hasInstalled)
  return hasInstalled
}

async function hasInstalledOnIndexedDB() {
  let hasInstalled = false
  let db = connectToIndexedDb('tangerine-variables')
  try {
    await db.get('installed')
    hasInstalled = true
  } catch(e) {
    hasInstalled = false
  }
  console.log("hasInstalledOnIndexedDB: " + hasInstalled)
  return hasInstalled
}

async function cryptoPouchIsEnabled() {
  const appConfig = await getAppConfig();
  return appConfig['useAppLevelEncryption'] && !appConfig["useLegacyIdbAdapter"]
    ? true
    : false
}

async function indexedDbIsEnabled() {
  const appConfig = await getAppConfig();
  return !appConfig['useAppLevelEncryption'] && !appConfig["useLegacyIdbAdapter"]
    ? true
    : false
}

async function legacyIdbIsEnabled() {
  const appConfig = await getAppConfig();
  return appConfig["useLegacyIdbAdapter"]
    ? true
    : false
}

async function hasNotInstalledOnAnything() {
  return !await hasInstalledOnLegacyIdb() &&
         !await hasInstalledOnIndexedDB() &&
         !await hasInstalledOnCryptoPouch()
      ? true
      : false 
}

async function startCryptoPouch() {
  console.log('Starting CryptoPouch...')
  window['cryptoPouchRunning'] = true
}

async function startIndexedDb() {
  console.log('Starting IndexedDB...')
  window['indexedDbRunning'] = true
}

async function startLegacyIdb() {
  console.log('Starting Legacy IDB...')
  window['legacyIdbRunning'] = true
}

@Injectable()
export class AppInit {
  constructor() {
  }

  Init() {
    return new Promise<void>(async (resolve, reject) => {
      console.log("AppInitService.init() called");
      if (window['isCordovaApp']) {
        document.addEventListener('deviceready', async () => {
          // Determine if we should start an encryption plugin.
          if (
            await hasInstalledOnCryptoPouch() ||
            (await cryptoPouchIsEnabled() && await hasNotInstalledOnAnything())
          ) {
            await startCryptoPouch()
          }
          else if (
            await hasInstalledOnIndexedDB() ||
            (await indexedDbIsEnabled() && await hasNotInstalledOnAnything())
          ) {
            await startIndexedDb()
          }
          else if (
            await hasInstalledOnLegacyIdb() || 
            await legacyIdbIsEnabled() && await hasNotInstalledOnAnything()
          ) {
            await startLegacyIdb()
          }
          // If the above didn't start encryption, encryption won't be used.
          const appConfig = await getAppConfig();
          if (appConfig['changes_batch_size']) {
            window['changes_batch_size'] = appConfig['changes_batch_size']
          }
          resolve()
        })
      } else {
        if (
          await hasInstalledOnCryptoPouch() ||
          (await cryptoPouchIsEnabled() && await hasNotInstalledOnAnything())
        ) {
          await startCryptoPouch()
        }
        else if (
          await hasInstalledOnIndexedDB() ||
          (await indexedDbIsEnabled() && await hasNotInstalledOnAnything())
        ) {
          await startIndexedDb()
        }
        else if (
          await hasInstalledOnLegacyIdb() || 
          await legacyIdbIsEnabled() && await hasNotInstalledOnAnything()
        ) {
          await startLegacyIdb()
        }
        // Enabling this setting for testing with a PWA.
        const appConfig = await getAppConfig();
        if (appConfig['changes_batch_size']) {
          window['changes_batch_size'] = appConfig['changes_batch_size']
        }
        resolve()
      }
    })
  }

}

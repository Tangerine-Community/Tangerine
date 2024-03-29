import { Injectable }  from '@angular/core';
import { EncryptionPlugin } from './shared/_classes/app-config.class';
import { connectToCryptoPouchDb, connectToPouchDb, connectToSqlCipherDb, DB } from './shared/_factories/db.factory';
const sleep = (milliseconds) => new Promise((res) => setTimeout(() => res(true), milliseconds))

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

async function hasInstalledOnPouchDB() {
  // Some initial process of elimination.
  if (await hasInstalledOnCryptoPouch() || await hasInstalledOnSqlcipher()) {
    return false
  }
  // See if the installed variable is set.
  let hasInstalled = false
  let db = connectToPouchDb('tangerine-variables')
  try {
    await db.get('installed')
    hasInstalled = true
  } catch(e) {
    hasInstalled = false
  }
  console.log("hasInstalledOnPouchDB: " + hasInstalled)
  return hasInstalled
}

async function hasInstalledOnSqlcipher() {
  if (!window['isCordovaApp']) {
    // Not a Cordova App? Definitely never installed using SqlCipher.
    return false
  }
  let hasInstalled = false
  // While this doesn't connect to an encrypted db, it will connect to a db in sqlite thus testing if
  // sqlcipher has ever been installed on. Note that if we ever add support for unencrypted sqlite, this
  // check won't work.
  let db = connectToSqlCipherDb('tangerine-variables')
  try {
    await db.get('installed')
    hasInstalled = true
  } catch(e) {
    hasInstalled = false
  }
  console.log("hasInstalledOnSqlcipher: " + hasInstalled)
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

async function sqlcipherIsEnabled() {
  const appConfig = await getAppConfig();
  // If no encryption plugin is defined and app level encryption is not turned off, default to sqlCipher being enabled.
  return appConfig['encryptionPlugin'] === EncryptionPlugin.SqlCipher ||
    (!appConfig['encryptionPlugin'] && !appConfig['turnOffAppLevelEncryption'])
      ? true
      : false
}

async function cryptoPouchIsEnabled() {
  const appConfig = await getAppConfig();
  return appConfig['encryptionPlugin'] === EncryptionPlugin.CryptoPouch
    ? true
    : false
}

async function hasNotInstalledOnAnything() {
  return !await hasInstalledOnPouchDB() &&
    !await hasInstalledOnSqlcipher() &&
    !await hasInstalledOnCryptoPouch()
      ? true
      : false 
}

async function startCryptoPouch() {
  console.log('Starting CryptoPouch...')
  window['cryptoPouchRunning'] = true
}

async function startSqlcipher() {
  console.log('Starting SqlCipher...')
  window['sqlCipherRunning'] = true
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
          // Wait until sqlite is ready.
          while (!window['sqliteStorageFile']) {
            await sleep(1000)
          }
          // Determine if we should start an encryption plugin.
          if (
            await hasInstalledOnSqlcipher() || 
            (await sqlcipherIsEnabled() && await hasNotInstalledOnAnything())
          ) {
            await startSqlcipher()
          }
          if (
            await hasInstalledOnCryptoPouch() ||
            (await cryptoPouchIsEnabled() && await hasNotInstalledOnAnything())
          ) {
            await startCryptoPouch()
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

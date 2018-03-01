
export const updates = [
  {
    requiresViewsUpdate: true,
    script: (userDb) => {
      return new Promise(resolve => {
        console.log(`This update will never run :-).`);
        resolve();
      })
    }
  },
  {
    requiresViewsUpdate: true,
    script: (userDb) => {
      return new Promise(resolve => {
        console.log(`Test update to ... database. 1`);
        resolve();
      })
    }
  },
  {
    requiresViewsUpdate: true,
    script: (userDb) => {
      return new Promise(resolve => {
        console.log(`Test update to ... database. 2`);
        resolve();
      })
    }
  },
  {
    requiresViewsUpdate: true,
    script: (userDb) => {
      return new Promise(resolve => {
        console.log(`Test update to ... database. 3`);
        resolve();
      })
    }
  }
]

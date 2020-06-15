
async function run() {
    let options = {key: 'registration-role-1', include_docs: true, descending: true}
    const results = await window['TangyDb'] .query('shared_responsesByStartUnixTime', options);
    const docs = results.rows.map(row => row.doc)
    const element = document.querySelector('#report1');
    elementinnerHTML += JSON.stringify(docs)
}

run().then(r => console.log('done!'))

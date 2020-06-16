
async function run() {
    let options = {key: 'registration-role-1', include_docs: true, descending: true}
    const results = await window.userDb.query('shared_responsesByStartUnixTime', options);
    const docs = results.rows.map(row => row.doc)
    const element = document.querySelector('#report1');
    element.innerHTML += JSON.stringify(docs)
}

run().then(r => console.log('done!'))

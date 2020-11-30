class ItemizedReport extends HTMLElement {

  async connectedCallback() {
    this.innerHTML += '<h2>Itemized Report</h2>'
    let options = {include_docs: true, reduce: false, descending: true}
    let results;
    // TODO: remove this when finished with debugging
    // window['userDb']  = await window.userService.getUserDatabase('admin')
    try {
        results = await window.userDb.db.query('registrationResults', options);
        const docs = results.rows.map(row => row.doc)
        // console.log("docs: " + JSON.stringify(docs))
        for (const doc of docs) {
          this.innerHTML += `<p>${doc._id}: ${T.form.Get(doc, 'first_name')} ${T.form.Get(doc, 'last_name')} Consent: ${T.form.Get(doc, 'consent')}</p>`
        }
    } catch (e) {
        console.log("Error: " + JSON.stringify(e))
    }
  }

}

customElements.define('itemized-report', ItemizedReport);
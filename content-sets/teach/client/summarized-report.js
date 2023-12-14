class SummarizedReport extends HTMLElement {

  async connectedCallback() {
    this.innerHTML += '<h2>Summary Report</h2>'
    options = {reduce: true}
    try {
      results = await window.userDb.db.query('registrationResults', options);
      const docs = results.rows.map(row => row.value)
      this.innerHTML += `<p>Consent: Yes: ${docs[0][0]} No: ${docs[0][1]} </p>`
    } catch (e) {
      console.log("Error: " + JSON.stringify(e))
    }
  }

}

customElements.define('summarized-report', SummarizedReport);
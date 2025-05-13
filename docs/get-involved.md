<style>
.card-container {
    display: flex;
    flex-wrap: wrap; /* Allow cards to wrap to the next line */
    gap: 10px; /* Add space between cards */
}

.card {
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 15px;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
    background-color: #f9f9f9;
    width: calc(95% - 10px); /* Adjust width to account for the gap */
    margin-bottom: 10px; /* Space between rows */
}
.full {
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 15px;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
    background-color: #f9f9f9;
    width: calc(100vh - 10px); /* Adjust width to account for the gap */
    margin-bottom: 10px; /* Space between rows */
}

.card h3, .full h3 {
      margin-top: 0;
      color: #333;
    }

    .card p, .full  p {
      line-height: 1.5;
      color: #555;
    }

    .card a, .full  a {
      display: inline-block;
      margin-top: 10px;
      padding: 8px 12px;
      background-color: #007bff;
      color: white;
      text-decoration: none;
      border-radius: 5px;
    }

    @media (min-width: 768px) {
    .card {
        /* Calculate width for two columns with a gap */
        width: calc(45% - 10px); /* (100% - gap) / 2 */
    }
}
</style>

<div class="card-container">
<div class="card">
    <h3>Administrator</h3>
    <p></p>
    <a href="../system-administrator">Go to Guides</a>
  </div>
  <div class="card">
    <h3>Developers Guides </h3>
    <p></p>
    <a href="../developer">Go to Guides</a>
  </div>



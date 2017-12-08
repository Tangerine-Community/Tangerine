

function listProjects() {
  return new Promise((resolve, reject) => {
    console.log("listing projects.")
    readFiles()
      .then(contents => {
        // console.log("contents: " + JSON.stringify(contents))
        // contents = contents.filter(function(n){ console.log("n is: " + JSON.stringify(n) + " type: " + typeof n);return typeof n == 'object' });
        contents = contents.filter(function(n){ return typeof n == 'object' });
        console.log("contents : " + JSON.stringify(contents))

        resolve(contents)
        return contents
      })
      .catch(error => {
        console.log("bummer: " + error)
        reject(contents)
      });
  });
}

app.get('/project/listAll', function (req, res, next) {

  var dirs = listProjects().then(function(result) {
    console.log("listAll: " + JSON.stringify(result)); // "Stuff worked!"
    res.send(result);
  }, function(err) {
    console.log(err); // Error: "It broke"
  });

  // readFiles()
  //     .then(contents => {
  //         console.log("contents: " + JSON.stringify(contents))
  //         res.send(contents);
  //     })
  //     .catch(error => {
  //         console.log("bummer: " + error)
  //
  //     });

  return next();
});
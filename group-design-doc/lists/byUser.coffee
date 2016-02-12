`function (head, req)
{
  start({
    "headers" : {"content-type": "application/json"}
  });

  var results = [];

  while(row = getRow())
  {
    if (!!~req.userCtx.roles.indexOf("group."+row.value.group))
    {
      results.push (row)
    };
  };
  
  
  //send( "(" + JSON.stringify( results, null, " " ) + ")" );
  send( "(" + JSON.stringify( req, null, " " ) + ")" );


}`
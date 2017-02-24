$settings = {}

$settings[:host]      = "host.com"
$settings[:db]        = "database"
$settings[:designDoc] = "design"

$settings[:loginUrl] = "http://#{$settings[:host]}/#{$settings[:db]}/_design/#{$settings[:designDoc]}/index.html"
$settings[:login]    = "username:password"
$settings[:local]    = false

$settings[:seed] = 0


$settings = {}

$settings[:host]      = "#{ENV['T_COUCH_HOST']}:#{ENV['T_COUCH_PORT']}" || 'localhost:5984'
$settings[:designDoc] = "ojai"

$settings[:login]    = "#{ENV['T_ADMIN']}:#{ENV['T_PASS']}"

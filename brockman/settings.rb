$settings = {}

$settings[:host]      = "#{ENV['T_COUCH_HOST']}:#{ENV['T_COUCH_PORT']}" || 'localhost:5984'
$settings[:designDoc] = "ojai"

$settings[:publicHost] = "#{ENV['T_PROTOCOL']}://#{ENV['T_HOST_NAME']}"

$settings[:login]    = "#{ENV['T_ADMIN']}:#{ENV['T_PASS']}"

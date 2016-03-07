require '../settings.rb'
require_relative 'Couch'
require_relative 'CouchIterator'

couch = Couch.new({
  :host      => $settings[:host],
  :login     => $settings[:login],
  :designDoc => 'tangerine',
  :db        => 'group-tutor_feb_25'
})


requestOptions = {
  :view => "tutorTrips",
  :data => { "keys" => ["workflow-c835fc38-de99-d064-59d3-e772ccefcf7d"] }
}

iterator = CouchIterator.new({
  :couch          => couch,
  :requestOptions => requestOptions,
  :chunkSize      => 5000,
  :method         => 'post'
})

tStart = Time.now.to_f
puts "starting"
while iterator.hasChunk()

  result = iterator.getChunk()
  puts "#{result.to_s.length} characters returned"
end

puts "Test. #{"%.3f" % (Time.now.to_f - tStart)}"

puts "last one"
puts result



require_relative '../helpers/LocationList.rb'
require_relative '../helpers/UserList.rb'

class Brockman < Sinatra::Base

  get '/workflow/:group/:workflowId/:year/:month' do | groupPath, workflowId, year, month |

    $logger.info "CSV request - #{groupPath} #{workflowId} #{year} #{month}"

    couch = Couch.new({
      :host      => $settings[:host],
      :login     => $settings[:login],
      :designDoc => "ojai",
      :db        => groupPath,
      :local     => $settings[:local]
    })

    #
    # Authentication
    #

    authenticate = couch.authenticate(cookies[:AuthSession])

    unless authenticate[:valid] == true
      $logger.info "Authentication failed"
      status 401
      return { :error => "not logged in" }.to_json
    end

    $logger.info "User #{authenticate[:name]} authenticated"

    #
    # get Group settings
    #
    groupSettings = couch.getRequest({ :doc => 'settings', :parseJson => true })
    groupTimeZone = groupSettings['timeZone']    

    #
    # get locations
    #
    locationList = LocationList.new({
      :couch => couch
    })

    #
    # get users
    #
    userList = UserList.new({
      :couch => couch
    })

    #
    # get workflow
    #

    workflow = couch.getRequest({ :doc => workflowId, :parseJson => true })

    workflowName = workflow['name']
    $logger.info "Beginning #{workflowName}"

    allTripIds = []
    #
    # Get csv rows from view
    #
    
    # Get results filtered by date
    resultByDate = couch.postRequest({ 
      :view => "tutorTrips",
      :data => { "keys" => ["year#{year}month#{month}workflowId#{workflowId}"]},
      :parseJson => true,
      :params => { "reduce" => false }
    })['rows']

    dateTrips = {}
    for row in resultByDate
      tripId                  = row['value']
      dateTrips[tripId]       = [] if dateTrips[tripId].nil?
      dateTrips[tripId].push  row['id']
      allTripIds.push         tripId
    end

    allTripIds.map{ | tripId | 
      dateTrips[tripId]     = [] if dateTrips[tripId].nil?
    }

    $logger.info "Received #{resultsByTripId.length} result ids"
    $logger.info "Processing start"

    csv = Csv.new({
      :couch => couch,
      :name => workflowName,
      :path => groupPath,
      :locationList => locationList,
      :userList => userList
    })

    file = csv.doWorkflow({
      :resultsByTripId => dateTrips,
      :groupTimeZone => groupTimeZone
    })

    $logger.info "Done, returning value"

    send_file file[:uri], { :filename => "#{groupPath[6..-1]}-#{file[:name]}" }

  end

end

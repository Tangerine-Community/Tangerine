class Brockman < Sinatra::Base

  get '/workflow/:group/:workflowId' do | groupPath, workflowId |

    $logger.info "CSV request - #{groupPath} #{workflowId}"

    couch = Couch.new({
      :host      => $settings[:host],
      :login     => $settings[:login],
      :designDoc => $settings[:designDoc],
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
    # get workflow
    #

    workflow = couch.getRequest({ :doc => workflowId, :parseJson => true })

    workflowName = workflow['name']
    $logger.info "Beginning #{workflowName}"

    #
    # Get csv rows from view
    #

    # get all trip Ids associated with workflow
    resultRows = couch.getRequest({ 
      :view => "tutorTrips",
      :parseJson => true,
      :params => {
        "key" => "\"workflow-#{workflowId}\"",
        "reduce" => false
      }
    })['rows']


    $logger.info "Received #{resultRows.length} result ids"

    # group results together by trip
    resultsByTripId = {}

    # save all results for bulk fetch from csvRows
    allResultIds = []

    for row in resultRows

      tripId   = row['value']
      resultId = row['id']

      resultsByTripId[tripId] = [] if resultsByTripId[tripId].nil?
      resultsByTripId[tripId].push resultId
      allResultIds.push resultId

    end

    $logger.info "Processing start"

    csv = Csv.new({
      :couch => couch,
      :name => workflowName,
      :path => groupPath
    })

    file = csv.doWorkflow({
      :resultsByTripId => resultsByTripId,
      :groupTimeZone => groupTimeZone
    })

    $logger.info "Done, returning value"

    send_file file[:uri], { :filename => "#{groupPath[6..-1]}-#{file[:name]}" }

  end

end

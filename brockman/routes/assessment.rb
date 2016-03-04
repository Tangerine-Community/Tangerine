#encoding: utf-8

require_relative '../helpers/Csv.rb'


# Make CSVs for regular assessments
class Brockman < Sinatra::Base

  get '/assessment/:group/:assessmentId' do | group, assessmentId |

    requestId = SecureRandom.base64

    couch = Couch.new({
      :host      => $settings[:host],
      :login     => $settings[:login],
      :designDoc => "ojai",
      :db        => group
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

    groupPath = "group-#{group.gsub(/group-/,'')}"

    assessmentName = JSON.parse(RestClient.get("http://#{$settings[:login]}@#{$settings[:host]}/#{groupPath}/#{assessmentId}"))['name']

    # Get csv rows for assessment
    columnNames = []
    machineNames = []
    csvRows = []

    resultIds = couch.postRequest({
      :view => "byParentId",
      :data => {"keys"=>["r#{assessmentId}"]},
      :parseJson => true
    })['rows'].map{ |el| el['id'] }

    csv = Csv.new({
      :couch => couch,
      :name => assessmentName,
      :path => group
    })

    file = csv.doAssessment({
      :resultIds => resultIds
    })

    send_file file[:uri], { :filename => "#{group[6..-1]}-#{file[:name]}" }

  end


end
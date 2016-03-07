#encoding: utf-8

require_relative '../helpers/Couch'
require_relative '../utilities/countyTranslate'
require_relative '../utilities/zoneTranslate'
require_relative '../utilities/percentage'
require_relative '../utilities/pushUniq'


class Brockman < Sinatra::Base

  #
  # Start of report
  #

  get '/reimbursement/:group/:workflowIds/:year/:month/:county/:zone.:format?' do | group, workflowIds, year, month, county, zone, format |
  

    format = "html" unless format == "json"

    requestId = SecureRandom.base64

    TRIP_KEY_CHUNK_SIZE = 500

    couch = Couch.new({
      :host      => $settings[:host],
      :login     => $settings[:login],
      :designDoc => $settings[:designDoc],
      :db        => group
    })

    subjectLegend = { "english_word" => "English", "word" => "Kiswahili", "operation" => "Math" }

    #
    # get Group settings
    #
    groupSettings = couch.getRequest({ :doc => 'settings', :parseJson => true })
    groupTimeZone = groupSettings['timeZone'] 

    #
    # Get quota information
    # 
    geography = couch.getRequest({ :doc => "school-list", :parseJson => true })

    currentCounty     = nil
    currentCountyName = nil
    currentZone       = nil
    currentZoneName   = nil

    # define scope for result
    result                                        ||= {}
    result['visits']                              ||= {}
    result['visits']['byCounty']                  ||= {}
    result['visits']['national']                  ||= {}
    result['visits']['national']['visits']        ||= 0
    result['visits']['national']['quota']         ||= 0
    result['visits']['national']['compensation']  ||= 0

    result['users']               ||= {}  #stores list of all users and zone associations
    result['users']['all']        ||= {}  #stores list of all users
    #result['users'][county][zone]        #stores reference to users within county->zone

    result['compensation']               ||= {}
    result['compensation']['byCounty']   ||= {}
    result['compensation']['national']   ||= 0

    #
    # Retrieve Shool Locations and Quotas
    #

    # Init the data structures based on the school list 
    geography['counties'].map { | countyName, county |
      countyName = countyTranslate( countyName.downcase )

      result['visits']['byCounty'][countyName]                  ||= {}
      result['visits']['byCounty'][countyName]['zones']         ||= {}
      result['visits']['byCounty'][countyName]['visits']        ||= 0
      result['visits']['byCounty'][countyName]['quota']         ||= 0
      result['visits']['byCounty'][countyName]['compensation']  ||= 0

      result['visits']['byCounty'][countyName]['quota'] = county['quota']

      if countyName == params[:county].downcase
        currentCounty     = county
        currentCountyName = countyName.downcase
      end


      #manually flatten out the subCounty data level
      county['subCounties'].map { | subCountyName, subCounty | 
        subCounty['zones'].map { | zoneName, zone |
          zoneName = zoneTranslate(zoneName.downcase)

          result['visits']['byCounty'][countyName]['zones'][zoneName]                   ||= {}
          result['visits']['byCounty'][countyName]['zones'][zoneName]['trips']          ||= []
          result['visits']['byCounty'][countyName]['zones'][zoneName]['visits']         ||= 0
          result['visits']['byCounty'][countyName]['zones'][zoneName]['quota']          ||= 0
          result['visits']['byCounty'][countyName]['zones'][zoneName]['compensation']   ||= 0

          if zoneName == params[:zone].downcase
            currentZone     = zone
            currentZoneName = zoneName.downcase
          end

          result['visits']['byCounty'][countyName]['zones'][zoneName]['quota']  += zone['quota'].to_i
          result['visits']['national']['quota']                                 += zone['quota'].to_i

          #init container for users
          result['users'][countyName]                   ||= {}
          result['users'][countyName][zoneName]         ||= {}
        }
      } 
    }

    #handle the case where the url is edited and the name screwed up
    if currentCounty.nil?
      geography['counties'].find { |countyName, county| 
        currentCounty       = county
        currentCountyName   = countyName.downcase
        true
      }
    end

    if currentZone.nil? || result['visits']['byCounty'][currentCountyName]['zones'][currentZoneName].nil?
      result['visits']['byCounty'][currentCountyName]['zones'].find { |zoneName, zone| 
        currentZone       = zone
        currentZoneName   = zoneName.downcase
        true
      }
    end

    #
    # Retrieve and Filter All Users
    #
    userDocs = couch.getRequest({
      :doc => "_all_docs",
      :params => { 
        "startkey" => "user-".to_json,
        "include_docs" => true
      },
      :parseJson => true
    } )

    #associate users with their county and zone for future processing
    userDocs['rows'].map{ | user | 
      unless user['doc']['location'].nil?
        location = user['doc']['location']
        county = countyTranslate(location['County'].downcase) if !location['County'].nil?
        zone = zoneTranslate(location['Zone'].downcase) if !location['Zone'].nil?

        #verify that the user has a zone and county associated
        if !county.nil? && !zone.nil?
          username                                = user['doc']['name']
          result['users']['all']                  ||= {}
          result['users'][county]                 ||= {}
          result['users'][county][zone]           ||= {}
          result['users'][county][zone][username] = true

          result['users']['all'][username]                            ||= {}
          result['users']['all'][username]['data']                    = user['doc']

          result['users']['all'][username]['target']                  ||= {}      # container for target zone visits
          result['users']['all'][username]['target']['visits']        ||= 0
          result['users']['all'][username]['target']['compensation']  ||= 0

          result['users']['all'][username]['other']                   ||= {}      # container for non-target zone visits

          result['users']['all'][username]['total']                   ||= {}      # container for visit and compensation totals
          result['users']['all'][username]['total']['visits']         ||= 0       # total visits across zones
          result['users']['all'][username]['total']['compensation']   ||= 0       # total compensation across zones
          result['users']['all'][username]['flagged']                 ||= false   # alert to visits outside of primary zone
        end
      end
    }

    

    #
    # Retrieve Relevant Trips
    #

    byZone = {}

    # get trips from month specified
    monthKeys = ["year#{year}month#{month}"]

    tripsFromMonth  = couch.postRequest({ 
      :view => "tutorTrips", 
      :data => { "keys" => monthKeys }, 
      :params => {"reduce"=>false}, 
      :categoryCache => true,
      :parseJson=>true 
    } )

    tripIds = tripsFromMonth['rows'].map{ |e| e['value'] }

    # if workflows specified, filter trips to those workflows
    if workflowIds != "all"

      workflowKey = workflowIds.split(",").map{ |s| "workflow-#{s}" }
      allRows = []
      workflowIds.split(",").each { |workflowId|

        workflowResponse = couch.postRequest({ 
          :view => "tutorTrips", 
          :data => { "keys" => ["workflow-#{workflowId}"] }, 
          :params => { "reduce" => false },
          :parseJson => true,
          :categoryCache => true
        } )

        allRows += workflowResponse['rows']
      }

      tripsFromWorkflow = allRows.map{ |e| e['value'] }
      tripIds           = tripIds & tripsFromWorkflow

    end

    # remove duplicates (of which there are many)
    tripKeys      = tripIds.uniq

    # break trip keys into chunks
    tripKeyChunks = tripKeys.each_slice(TRIP_KEY_CHUNK_SIZE).to_a

    
    # hash for optimization
    subjectsExists = {}
    zoneCountyExists = {
      'all' => {}
    }

    #
    # Get chunks of trips and work on the result
    #

    tripKeyChunks.each { | tripKeys |

      # get the real data
      tripsResponse = couch.postRequest({
        :view => "spirtRotut",
        :params => { "group" => true },
        :data => { "keys" => tripKeys },
        :parseJson => true,
        :cache => true
      } )
      tripRows = tripsResponse['rows']

      #
      # filter rows
      #

      tripRows = tripRows.select { | row |
        longEnough = ( row['value']['maxTime'].to_i - row['value']['minTime'].to_i ) / 1000 / 60 >= 20
        longEnough
      }

      #
      # result['visits']
      #

      for sum in tripRows

        next if sum['value']['zone'].nil? 
        
        zoneName   = zoneTranslate(sum['value']['zone'].downcase)
        countyName = countyTranslate(sum['value']['county'].downcase)
        username   = sum['value']['user'].downcase

        result['visits']['byCounty'][countyName]['zones'][zoneName]['trips'].push sum

        if !result['users'][countyName][zoneName][username].nil?
          result['users']['all'][username]['target']['visits']  += 1

        else
          result['users']['all'][username]['other'][countyName]                             ||= {}
          result['users']['all'][username]['other'][countyName][zoneName]                   ||= {}
          result['users']['all'][username]['other'][countyName][zoneName]['visits']         ||= 0
          result['users']['all'][username]['other'][countyName][zoneName]['compensation']   ||= 0

          result['users']['all'][username]['flagged']                                 = true
          result['users']['all'][username]['other'][countyName][zoneName]['visits']   += 1
        end

        result['users']['all'][username]['total']['visits']   += 1

        result['visits']['national']['visits']                                  += 1
        result['visits']['byCounty'][countyName]['visits']                      += 1 
        result['visits']['byCounty'][countyName]['zones'][zoneName]['visits']   += 1
      end

    }


    #
    # Calculate the user compensation
    #
    result['users']['all'].map{ | userName, user |

      location = result['users']['all'][userName]['data']['location']

      countyName  = countyTranslate(location['County'].downcase) if !location['County'].nil?
      zoneName    = zoneTranslate(location['Zone'].downcase) if !location['Zone'].nil?


      #ensure that the user has a county and zone assigned that exist
      if !countyName.nil? && !zoneName.nil? && (result['users']['all'][userName]['total']['visits'] > 0)


        # handle compensation for visits outside the assigned zone 
        if user['flagged'] == true
          user['other'].map{ | altCountyName, altCounty |
            altCounty.map{ | altZoneName, altZone |

              result['users'][altCountyName][altZoneName][userName] = true
              
              completePct = (altZone['visits'] + 0.0) / result['visits']['byCounty'][altCountyName]['zones'][altZoneName]['quota']
              compensation = (((completePct > 1) ? 1 : completePct) * 6000).round(2)

              altZone['compensation']                                   += compensation
              result['users']['all'][userName]['total']['compensation'] += compensation

              result['visits']['national']['compensation']                                  += compensation
              result['visits']['byCounty'][altCountyName]['compensation']                      += compensation
              result['visits']['byCounty'][altCountyName]['zones'][altZoneName]['compensation']   += compensation
            }
          }

          #cover the situation where no visits have been completed in the target zone but have elsewhere - need to cover data upload
          if (user['other'].length > 0) && (user['target']['visits'] == 0)

            result['users']['all'][userName]['target']['compensation'] += 300;
            result['users']['all'][userName]['total']['compensation']  += 300;

            result['visits']['national']['compensation']                                  += 300
            result['visits']['byCounty'][countyName]['compensation']                      += 300
            result['visits']['byCounty'][countyName]['zones'][zoneName]['compensation']   += 300
          end 

        else 
          completePct   = (user['target']['visits'] + 0.0) / result['visits']['byCounty'][countyName]['zones'][zoneName]['quota']
          compensation  = (((completePct > 1) ? 1 : completePct) * 6000 + 300).round(2)
          
          result['users']['all'][userName]['target']['compensation'] += compensation;
          result['users']['all'][userName]['total']['compensation']  += compensation;


          result['visits']['national']['compensation']                                  += compensation
          result['visits']['byCounty'][countyName]['compensation']                      += compensation
          result['visits']['byCounty'][countyName]['zones'][zoneName]['compensation']   += compensation

        end

      end
    }

    nationalTableHtml = "
      <table id='nationalTable'>
        <thead>
          <tr>
            <th>County</th>
            <th>Number of classroom visits / valid</th>
            <th>Targeted number of classroom visits / valid</th>
            <th>Total Reimbursement</th>
          </tr>
        </thead>
        <tbody>
          #{ result['visits']['byCounty'].map{ | countyName, county |

            countyName      = countyName.downcase
            visits          = county['visits']
            quota           = county['quota']
            compensation   = county['compensation']

            "
              <tr>
                <td>#{countyName.capitalize}</td>
                <td>#{visits}</td>
                <td>#{quota}</td>
                <td align='right'>#{compensation} KES</td>
              </tr>
            "}.join }
            <tr>
              <td>All</td>
              <td>#{result['visits']['national']['visits']}</td>
              <td>#{result['visits']['national']['quota']}</td>
              <td align='right'>#{result['visits']['national']['compensation']} KES</td>
            </tr>
        </tbody>
      </table>
    "

    countyTableHtml = "
      <table id='countyTable'>
        <thead>
          <tr>
            <th>Zone</th>
            <th>TAC Tutor Username</th>
            <th>TAC Tutor First Name</th>
            <th>TAC Tutor Last Name</th>
            <th>Number of classroom visits / valid</a></th>
            <th>Targeted number of classroom visits / valid</th>
            <th>Total Reimbursement</th>
          </tr>
        </thead>
        <tbody>
          #{result['visits']['byCounty'][currentCountyName]['zones'].map{ |zoneName, zone|

              zoneName = zoneName.downcase
              quota = zone['quota']

              if result['users'][currentCountyName][zoneName].length != 0
                result['users'][currentCountyName][zoneName].map { | userName, val |
                  
                  user = result['users']['all'][userName]['data']
                  flagContent = ""

                  if result['users']['all'][userName]['flagged'] == true
                    userLocation = result['users']['all'][userName]['data']['location']
                    userCountyName  = countyTranslate(userLocation['County'].downcase) if !userLocation['County'].nil?
                    userZoneName    = zoneTranslate(userLocation['Zone'].downcase) if !userLocation['Zone'].nil?

                    if (userCountyName == currentCountyName) && (userZoneName == zoneName)

                      visits        = result['users']['all'][userName]['target']['visits']
                      compensation  = result['users']['all'][userName]['target']['compensation']

                    else
                      visits        = result['users']['all'][userName]['other'][currentCountyName][zoneName]['visits']
                      compensation  = result['users']['all'][userName]['other'][currentCountyName][zoneName]['compensation']
                    end

                    flagToolTip = "
                                  <strong>Notice:</strong> This user has completed visits outside their assigned zone. 
                                  <br><br>
                                  <em>Current Assignment:</em> #{userCountyName} > #{userZoneName}
                                  <br><br>
                                  <em>Additional visits have been recorded in:</em>
                                  <ul>
                                    #{
                                      result['users']['all'][userName]['other'].map{ | altCountyName, altCounty |
                                        altCounty.map{ | altZoneName, altZone |
                                          "<li>#{altCountyName} > #{altZoneName}</li>"
                                        }.join()
                                      }.join()
                                    }
                                  </ul>
                                  "

                    flagContent = "<a href='#' onclick='return fase;' title='#{flagToolTip}'><i class='fa fa-flag-o'></i></a>"

                  else
                    
                    visits        = result['users']['all'][userName]['target']['visits']
                    compensation  = result['users']['all'][userName]['target']['compensation']
                  end

                  "
                    <tr> 
                      <td>#{zoneName.capitalize} </td>
                      <td>#{flagContent} #{user['name']}</td>
                      <td>#{user['first']}</td>
                      <td>#{user['last']}</td>
                      <td>#{visits}</td>
                      <td>#{quota}</td>
                      <td align='right'>#{flagContent} #{compensation} KES</td>
                    </tr>
                  "
                }.join
              else 
                "
                  <tr> 
                    <td>#{zoneName.capitalize} </td>
                    <td align='center'> --- </td>
                    <td align='center'> --- </td>
                    <td align='center'> --- </td>
                    <td align='center'> --- </td>
                    <td>#{quota}</td>
                    <td align='center'> --- </td>
                  </tr>
                "
              end
            }.join
          }
        </tbody>
      </table>
    "

    zoneTableHtml = "

      <table id='zoneTable'>
        <thead>
          <tr>
            <th>Day</th>
            <th>TAC Tutor</th>
            <th>School Name</th>
            <th>Subject</th>
            <th>Class</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          #{ 
          result['visits']['byCounty'][currentCountyName]['zones'][currentZoneName]['trips'].map{ | trip |
            
            if !groupTimeZone.nil?
              day = Time.at(trip['value']['maxTime'].to_i / 1000).getlocal(groupTimeZone).strftime("%m / %d")
            else 
              day = Time.at(trip['value']['maxTime'].to_i / 1000).strftime("%m / %d")
            end

            subject = subjectLegend[trip['value']['subject']]

            duration = (trip['value']['maxTime'].to_i - trip['value']['minTime'].to_i ) / 1000 / 60

            "
              <tr>
                <td align='center'>#{day}</td>
                <td>#{trip['value']['user']}</td>
                <td>#{trip['value']['school'].capitalize}</td>
                <td>#{subject}</td>
                <td align='center'>#{trip['value']['class']}</td>
                <td align='center'>#{duration} Minutes</td>
              </tr>
            "}.join }
        </tbody>
      </table>
    "

    html =  "
    <html>
      <head>
        <style>
          body{font-family:Helvetica;}
          #map-loading { width: 100%; text-align: center; background-color: #dddd99;}
          #map { clear: both; }
          div.chart { float: left; } 
          h1, h2, h3 
          {
            display: block;
            clear:both;
          }
          .fa-flag-o { color: red; }
          .ui-tooltip {
            font-size: 10px;
          }
        </style>
        <link rel='stylesheet' href='//code.jquery.com/ui/1.11.2/themes/smoothness/jquery-ui.css'>
        <link rel='stylesheet' type='text/css' href='http://ajax.aspnetcdn.com/ajax/jquery.dataTables/1.9.4/css/jquery.dataTables.css'>
        <link href='//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css' rel='stylesheet'>
        <style>
        .ui-tooltip {
            font-size: 12px;
          }
        </style>

        <script src='http://code.jquery.com/jquery-1.11.0.min.js'></script>
        <script src='//code.jquery.com/ui/1.11.2/jquery-ui.js'></script>
        <script src='http://ajax.aspnetcdn.com/ajax/jquery.dataTables/1.9.4/jquery.dataTables.min.js'></script>

        <script>

          
          $(document).ready( function() {
            var nationalTable = $('#nationalTable').dataTable( { iDisplayLength :-1, sDom : 't'});
            var countyTable = $('#countyTable').dataTable( { iDisplayLength :-1, sDom : 't'});
            var zoneTable = $('#zoneTable').dataTable( { iDisplayLength :-1, sDom : 't'});

            $('select').on('change',function() {
              year    = $('#year-select').val().toLowerCase()
              month   = $('#month-select').val().toLowerCase()
              county  = $('#county-select').val().toLowerCase()
              zone  = $('#zone-select').val().toLowerCase()
              
              //Callback for reloading the page - swap commented lines for dev/prod
              document.location = 'http://#{$settings[:host]}/_csv/reimbursement/#{group}/#{workflowIds}/'+year+'/'+month+'/'+county+'/'+zone+'.html';
              //document.location = 'http://localhost:9292/reimbursement/#{group}/#{workflowIds}/'+year+'/'+month+'/'+county+'/'+zone+'.html';
            });

            countyTable.$('a').tooltip({
                content: function () {
                    return $(this).prop('title');
                }
            });

          });

        </script>

      </head>

      <body>
        <h1><img style='vertical-align:middle;' src=\"http://databases.tangerinecentral.org/tangerine/_design/ojai/images/corner_logo.png\" title=\"Go to main screen.\"> Reimbursement Report - Kenya National Tablet Programme</h1>
  
        <label for='year-select'>Year</label>
        <select id='year-select'>
          <option #{"selected" if year == "2013"}>2013</option>
          <option #{"selected" if year == "2014"}>2014</option>
          <option #{"selected" if year == "2015"}>2015</option>
        </select>

        <label for='month-select'>Month</label>
        <select id='month-select'>
          <option value='1'  #{"selected" if month == "1"}>Jan</option>
          <option value='2'  #{"selected" if month == "2"}>Feb</option>
          <option value='3'  #{"selected" if month == "3"}>Mar</option>
          <option value='4'  #{"selected" if month == "4"}>Apr</option>
          <option value='5'  #{"selected" if month == "5"}>May</option>
          <option value='6'  #{"selected" if month == "6"}>Jun</option>
          <option value='7'  #{"selected" if month == "7"}>Jul</option>
          <option value='8'  #{"selected" if month == "8"}>Aug</option>
          <option value='9'  #{"selected" if month == "9"}>Sep</option>
          <option value='10' #{"selected" if month == "10"}>Oct</option>
          <option value='11' #{"selected" if month == "11"}>Nov</option>
          <option value='12' #{"selected" if month == "12"}>Dec</option>
        </select>

        <h2>
          National Report
          #{year} #{["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][month.to_i]}
        </h2>
        #{nationalTableHtml}
        <br>
        <hr>
        <br>
        
        
        <label for='county-select'>County</label>
        <select id='county-select'>
          #{
            geography['counties'].map { | countyName, county |
              "<option #{"selected" if countyName.downcase == params[:county].downcase}>#{countyName.capitalize}</option>"
            }.join("")
          }
        </select>
        <h2>
          #{currentCountyName.capitalize} County Report
          #{year} #{["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][month.to_i]}
        </h2>
        #{countyTableHtml}
        <br>
        <hr>
        <br>
        
        
        <label for='zone-select'>Zone</label>
        <select id='zone-select'>
          #{
            result['visits']['byCounty'][currentCountyName]['zones'].map { | zoneName, zone |
              "<option #{"selected" if zoneName.downcase == params[:zone].downcase}>#{zoneName.capitalize}</option>"
            }.join("")
          }
        </select>
        <h2>
          #{currentZoneName.capitalize} Zone Report
          #{year} #{["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][month.to_i]}
        </h2>
        #{zoneTableHtml}
        </body>
      </html>
      "
    
    return html


  end # of report

end
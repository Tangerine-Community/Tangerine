#encoding: utf-8

class Brockman < Sinatra::Base

  get '/class/:group/:id' do

    #
    # Authentication
    #

    authenticate = couch.authenticate(cookies[:AuthSession])

    unless authenticate[:valid] == true
      $logger.info "Authentication failed"
      status 401
      return { :error => "not logged in" }.to_json
    end

    group   = params[:group]
    klassId = params[:id]

    groupPath = calcGroupName group

    # get students hashed by id
    studentResponse = JSON.parse(RestClient.post("http://#{$login}@#{$host}/#{groupPath}/_design/ojai/_view/byCollection",{"keys"=>["student"]}.to_json, :content_type => :json,:accept => :json ))
    studentsById = Hash[ studentResponse['rows'].map { | row | [ row['id'], row['value'] ] } ]

    # get the curriculum id for this class
    klassResponse = JSON.parse(RestClient.get("http://#{$login}@#{$host}/#{groupPath}/#{params[:id]}",{ :content_type => :json,:accept => :json }))
    curriculumId = klassResponse['curriculumId']

    # get subtests from curriculum, hash by id
    subtestResponse = JSON.parse(RestClient.post("http://#{$login}@#{$host}/#{groupPath}/_design/ojai/_view/subtestsByAssessmentId",{"keys"=>["#{curriculumId}"]}.to_json, :content_type => :json,:accept => :json ))
    subtestsById = Hash[ subtestResponse['rows'].map { | row | [ row['value']['_id'], row['value'] ] } ]

    # Get csv rows for klass
    csvData = {
      :keys => [klassId]
    }
    csvRows = JSON.parse(RestClient.post("http://#{$login}@#{$host}/#{groupPath}/_design/ojai/_view/csvRows",csvData.to_json, :content_type => :json,:accept => :json ))

    studentRows = {}
    columnHeaders = ["student_id", "student_name"]


    for row in csvRows["rows"]

      for obj in row['value']
        studentId = obj['value']
        break if obj['machineName'] == "universal-studentId"
      end

      studentRows[studentId] = [] if studentRows[studentId].nil?

      studentRows[studentId].push row

    end


    columnNames = []
    machineNames = []
    csvRows = []


    studentRows.each { | studentId, results |

      row = []

      results.each_with_index { | result, resultIndex |

        for cell in result['value']

          key         = cell['key']
          value       = cell['value']
          machineName = cell['machineName']+resultIndex.to_s
          unless machineNames.include?(machineName)
            machineNames.push machineName
            columnNames.push key
          end

          index = machineNames.index(machineName)

          row[index] = value

        end

      }

      csvRows.push row

    }


    csvRows.unshift(columnNames)
    csvData = ""
    for row in csvRows
      csvData += row.map { |title|
        "\"#{title.to_s.gsub(/"/,'”')}\""
      }.join(",") + "\n"
    end

    response.headers["Content-Disposition"] = "attachment;filename=class #{timestamp()}.csv"
    response.headers["Content-Type"]        = "application/octet-stream"

    return csvData

  end

end
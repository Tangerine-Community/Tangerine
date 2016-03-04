require_relative "../utilities/cloneDeep.rb"

class CouchIterator

  def initialize (options)
    @couch          = options[:couch]
    @requestOptions = options[:requestOptions]
    @chunkSize      = options[:chunkSize] || 500
    @index          = options[:index]     || 0
    @method         = options[:method]    || "get"
    @noMoreRows     = false
  end


  def hasChunk()
    return ! @noMoreRows
  end

  def getChunk()

    requestIndex = @chunkSize * @index

    chunkyOptions = cloneDeep(@requestOptions)
    chunkyOptions[:params] ||= {}
    chunkyOptions[:params]["limit"] = @chunkSize
    chunkyOptions[:params]["skip"]  = requestIndex
    
    response = doRequest(chunkyOptions)

    @noMoreRows = response['rows'].length == 0

    @index += 1

    return response
  end

  def doRequest(options)

    if @method == "get"
      result = @couch.getRequest(options)
    elsif @method == "post"
      result = @couch.postRequest(options)
    end

    return JSON.parse(result) if result.class == String
    return result

  end

end

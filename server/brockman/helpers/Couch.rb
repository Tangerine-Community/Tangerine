# encoding: utf-8

require 'rest-client'
require 'json'
require_relative "Stash"
require_relative "../utilities/cloneDeep"

class Couch

  JSON_OPTIONS = {
    :content_type => :json,
    :accept       => :json
  }

  DEFAULT_PROTOCOL = "http://"

  def initialize( options = {} )

    @protocol  = options[:protocol] || DEFAULT_PROTOCOL
    @host      = options[:host]
    @db        = options[:db]
    @designDoc = options[:designDoc]

    @login = options[:login] || ""


  end # of initialize

  def getRequest( arOptions )
    processRequest( arOptions, lambda { | req | RestClient.get( req['url'], req['options'] ) } )
  end # of getRequest

  # sends a post request to
  def postRequest( arOptions )
    processRequest( arOptions, lambda { | req | RestClient.post( req['url'], req['data'], req['options'] ) } )

  end # of postRequest

  # sends a put request to
  def putRequest( arOptions )
    processRequest( arOptions, lambda { | req | RestClient.put( req['url'], req['data'], req['options'] ) } )
  end # of postRequest

  def processRequest( arOptions, process )

    req = {
      'url'  => getUrl(arOptions),
      'data' => (arOptions[:data] || arOptions[:newDoc] || {}).to_json
    }

    parseJson = arOptions[:parseJson] || false

    # pull from cache first if possible

    if arOptions[:cache] == true
      s = Stash.new(:name => req['url'])
    end

    if arOptions[:cache] == true && arOptions[:data] && arOptions[:data]['keys']
      keys = arOptions[:data]['keys']
      dbResponse = s.getMany({
        :keys  => keys
      })
      dbKeys = dbResponse.keys
      keys.reject! { |el| dbKeys.include? el }
      req['data'] = {'keys'=>keys}.to_json
    end

    # remove method options
    methodOptions = [ :data, :newDoc, :parseJson ]
    req['options'] = arOptions.merge(JSON_OPTIONS).select { |k,v| ! methodOptions.include?(k) }

    # category cache
    if arOptions[:data] && arOptions[:categoryCache] == true
      categoryKeys = arOptions[:data]['keys'].join('')
      s = Stash.new( :name => req['url'] )


      testReq = cloneDeep(req)
      testReq['options'][:params] ||= {}
      testReq['options'][:params]['limit'] = 1

      testReq['data'] = {"keys"=>arOptions[:data]['keys']}.to_json

      testResponse = JSON.parse RestClient.post( testReq['url'], testReq['data'], testReq['options'] )

      # `total_rows` gives us a number of rows for the entire view
      # when we ask for a certain key, the number in the key should be the same
      # this will work because we're not expecting the documents to change

      totalRows = testResponse['total_rows']

      # returns nil if empty. nil.to_i == 0
      cacheCount = s.getOne("#{categoryKeys}-total-rows").to_i

      # best cache invalidation ever
      shouldRefreshCache = cacheCount < totalRows

      unless shouldRefreshCache
        return JSON.parse( s.getOne(categoryKeys) )
      end
    end

    response = process.call( req )

    if shouldRefreshCache

      totalRows = response.match(/"total_rows":(.+?),/)[1].to_i
      s.setOne( "#{categoryKeys}-total-rows", totalRows)
      s.setOne( categoryKeys, response )

    end

    if arOptions[:cache] == true

      # parse response for Stash
      parsedResponse = JSON.parse response

      # if there are any rows stash it for next time
      if parsedResponse['rows'].length != 0
        dbEntries = {}
        parsedResponse['rows'].each{ |el| dbEntries[el['key']] = el['value'].to_json }
        s.setMany(dbEntries)
      end

      # merge db results with server results
      if dbResponse
        dbResponse.each { |key, value| parsedResponse['rows'].push({"id"=>key,"value"=>JSON.parse(value)}) }
      end

      return parsedResponse

    end

    return JSON.parse response if parseJson
    return response

  end

  # Cookie authenticates with AuthSession cookie
  def authenticate( authSession )

    # authenticate session cookie and get userCtx
    sessionResponse = getRequest( :db => "_session", :cookies => {"AuthSession"=>authSession}, :login => nil, :parseJson => true)

    if sessionResponse['ok'] && ! sessionResponse['userCtx']['name'].nil?
      return { :valid => true, :name => sessionResponse['userCtx']['name']}
    else
      return { :valid => false }
    end

  end # of authenticate

  # Calculate new urls
  def getUrl(arOptions)


    login = arOptions[:login] || @login

    if login != ""
      loginString = login + "@"
    else
      loginString = ''
    end

    options = arOptions

    # use defaults where no specifics
    options[:db]        = @db        unless options[:db]
    options[:designDoc] = @designDoc unless options[:designDoc]

    raise ArgumentError "getUrl requires protocol and host" if @host.nil? || @protocol.nil?
    host = "#{@protocol}#{loginString}#{@host}/"


    # make url
    if options[:list]
      raise ArgumentError "getUrl for list requires db, designDoc, and view" if options[:db].nil? || options[:designDoc].nil? || options[:view].nil?
      url = File.join host, options[:db], "_design", options[:designDoc], "_list", options[:list], options[:view]
    elsif options[:view]
      raise ArgumentError "getUrl for view requires db and designDoc" if options[:db].nil? || options[:designDoc].nil?
      url = File.join host, options[:db], "_design", options[:designDoc], "_view", options[:view]
    elsif options[:doc]
      raise ArgumentError "getUrl for document requires db" if options[:db].nil?
      url = File.join host, options[:db], options[:doc]
    elsif options[:db] # @todo this is unreachable if there's a db specified at init
      url = File.join host, options[:db]
    else
      url = host
    end

    return url

  end # of getUrl

end
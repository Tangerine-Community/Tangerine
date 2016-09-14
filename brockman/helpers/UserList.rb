# encoding: utf-8


class UserList

  def initialize( options )
    @couch = options[:couch]
    @userDocs = @couch.getRequest({
      :doc => "_all_docs",
      :params => { 
        "startkey" => "user-".to_json,
        "include_docs" => true
      },
      :parseJson => true
    })
    @userIndex ||= {}
    indexUsers()
  end

  def indexUsers()
    @userDocs['rows'].map{ | user | 
      username              = user['doc']['name']
      @userIndex[username]  = user['doc']
    }
  end

  def getUser( username )
    return (@userIndex[username] || {})
  end 

end

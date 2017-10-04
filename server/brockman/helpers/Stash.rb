require 'sqlite3'

# This class is a basic key-value store implementation using sqlite
# the methods don't try to clarify your arguments or be extra convenient
# so program what you mean and mean what you program
class Stash

  DB_PATH = Dir.pwd + "/stash/"

  def initialize( options = {} )

    raise ArgumentError.new "name requred" if options[:name].nil?
    @name = options[:name]

    file = fileSafetyDance( @name )

    @db = SQLite3::Database.new( file )

    @db.execute "
      CREATE TABLE IF NOT EXISTS stash
      (key varchar(100) PRIMARY KEY, 
      value varchar(1000))
    "

  end

  # @param key String
  def getOne( key )

    result = @db.execute "SELECT value FROM stash WHERE key=?", [ key ]

    return result.flatten[0]

  end
  
  # @param key Array
  def getMany( options )

    whereIn = options[:keys].map{ |el| "'" + el + "'" }.join(',')
    limit   = "LIMIT #{options[:limit]}" if options[:limit]
    offset  = "OFFSET #{options[:skip]}" if options[:skip]
    result = @db.execute "SELECT key, value FROM stash WHERE key in (#{whereIn}) #{limit} #{offset}"
    result = Hash[*result.flatten]
    return result

  end

  # @param key String
  # @param value String
  def setOne( key, value )

    @db.execute "REPLACE INTO stash ( key, value ) VALUES ( ?, ? )", [ key, value ]

  end

  # @param aHash Hash
  def setMany( aHash )

    aHash.each do |pair|
      key = pair[0]
      value = pair[1]
      @db.execute "REPLACE INTO stash ( key, value ) VALUES ( ?, ? )", [key, value]
    end

  end

  # @param key String
  def deleteOne( key )

    result = @db.execute "DELETE from stash WHERE key='?'", [ key ]

    return result

  end

  # @param keys Array
  def deleteMany( keys )

    whereClause = "key in (#{keys.map{|x| "'#{x}'"}.join(',')})"

    result = @db.execute 'DELETE from stash WHERE ' + whereClause

    return result

  end


  private 

  def fileSafetyDance( name = "" )
    return DB_PATH + name.gsub(/[^a-zA-Z0-9]/,'-') + '.db'
  end

end
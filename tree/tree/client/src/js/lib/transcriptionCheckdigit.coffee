#This is a base21 encoding
# "ABCEFGHKMNPQRSTUVWXYZ"

# http://en.wikipedia.org/wiki/Check_digit
# A good checkdigit will catch all single character changes and most transcriptions
# This requires a weighted checkdigit scheme.
# We need our weightings to be comprime with 21
# This will catch all single digit errors and most transpositions

# A 5 character string will allow for more than 4 million possibilities:
# 21^5 = 4084101

# So we need 5 differnet numbers that are coprime to 21 to use as our weightings
# 1
# 2
# 5
# 11
# 13

# To calculate our checkdigit we multiply each character by its weighting which is determined by its position
# Example: "BABAS"
# Convert from Base 21 to base 10
# B=1, A=0, B=1, A=0, S=13
# Weight them
# 1*1, 0*2, 1*5, 0*11, 13*13
# Add them up
# 1 + 0 + 5 + 0 + 169 = 175
# Do a mod 21 on it
# 175%21 = 7
# Convert 20 from base 10 to our base21 encoding:
# K
# Hence our result:
# BABASK

# This class allows you to set a string of 5 digits in permissible characters.
# `get` returns the string with a check digit.
# `set` changes
# `generate` returns a complete check digit, does not change the id
class CheckDigit

  allowed : "ABCEFGHKMNPQRSTUVWXYZ".split ""

  weights : [1,2,5,11,13]   # TODO automatically calculate coprimes

  constructor: ( id = "" ) ->
    @set( id )
  
  # set id, force uppercase
  set: ( id ) ->
    @id = id.toUpperCase()

  # return full check digit sequence
  get: ( id = @id ) ->
    return null if !~( !~@allowed.indexOf(ch) for ch in id.split "" ).indexOf(false)
    return id + @getDigit id
  
  # return full check digit sequence
  generate: ->
    return @get( (@allowed[Math.floor(Math.random() * @allowed.length)] for i in @weights ).join "" )

  isValid: (id=@id) ->
    return false if id.length != 6
    return (@get(id.slice(0,id.length-1))) == (id)

  isNotValid: (id=@id) ->
    return not @isValid(id)

  # return characters in id not allowed
  getErrors: ->
    errors = []
    result = []
    (result.push(@id[i]) if ch == -1) for ch, i in (@allowed.indexOf(ch) for ch in @id.split "" )
    if result.length != 0 then errors.push "Error: '#{result}' is not a valid student id character. Only the following characters are allowed: #{@allowed}<br/>(this helps reduce errors while writing down student IDs)" for i in result
    if @id.length    != 6 then errors.push "Error: Identifier must be 6 letters"
    if errors.length is 0 and @isNotValid() then errors.push "Error: Invalid ID. Maybe it was written down incorrectly. Generate a new one then write down the old ID and the new one a piece of paper. Include both IDs in comments section at end of assessment."

    return errors

  # helper function that does all the work
  # return check digit
  getDigit: ( id = @id ) ->
    id_10 = (@allowed.indexOf(ch) for ch in id.split "" )
    checkDigit_10 = ((id_10[i] * weight ) for weight, i in @weights).reduce (x,y) -> x + y
    return @allowed[checkDigit_10 % @allowed.length]


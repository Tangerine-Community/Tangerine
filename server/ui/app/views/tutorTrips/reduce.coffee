# return counts for cache
( keys, values, rereduce ) ->
  if rereduce
    return sum(values)
  else
    return values.length

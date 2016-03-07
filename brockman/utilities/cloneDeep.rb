def cloneDeep(obj)
  if obj.class == Array
    result = []
    obj.each_index {|index| result[index] = cloneDeep(obj[index])}
  elsif obj.class == Hash
    result = {}
    obj.each_pair {|key, value| result[key] = cloneDeep(value)}
  else
    return obj
  end
  return result
end

def pushUniq(anArray, aValue, aHash)
  unless aHash[aValue]
    anArray.push aValue
    aHash[aValue] = true
  end
end
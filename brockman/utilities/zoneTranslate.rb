def zoneTranslate(zone)
  if zone.index("zone")
    return zone.gsub(" zone", "")
  else
    return zone
  end
end



function parseDbUrl(dbUrl) {
  const urlObject = new URL(dbUrl)
  return {
    username: urlObject.username,
    password: urlObject.password,
    url: `${urlObject.origin}${urlObject.pathname}` 
  }
}

export async function get(dbUrl) {
  const dbUrlInfo = parseDbUrl(dbUrl)
  const headers = {
    'Authorization': 'Basic ' + window.btoa(`${dbUrlInfo.username}:${dbUrlInfo.password}`),
    'Content-Type': 'application/json'
  }
  const response = await fetch(dbUrlInfo.url, {
    headers 
  })
  if (!response.ok) {
    throw new Error(response)
  } else {
    return await response.json()
  }
}


export async function put(dbUrl, data) {
  const dbUrlInfo = parseDbUrl(dbUrl)
  const headers = {
    'Authorization': 'Basic ' + window.btoa(`${dbUrlInfo.username}:${dbUrlInfo.password}`),
    'Content-Type': 'application/json'
  }
  const response = await fetch(dbUrlInfo.url, {
    method: 'PUT',
    headers,
    ...data
      ? { body: JSON.stringify(data) }
      : { }
  })
  return await response.json()
}

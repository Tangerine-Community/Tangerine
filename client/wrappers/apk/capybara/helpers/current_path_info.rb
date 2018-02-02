def current_path_info
  current_url.sub(%r{.*?://},'')[%r{[/\?\#].*}] || '/'
end
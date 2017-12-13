def ensure_on(path)
  visit(path) unless current_path == path
end
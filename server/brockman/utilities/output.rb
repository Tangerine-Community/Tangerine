def output (message, redirect = false)
  redirectHtml = "<meta http-equiv=\"refresh\" content=\"1;url=#{redirect}\">" if redirect
  return "<html><head>#{redirectHtml}<style>body { font-family: Helvetica; text-align:center; } h1 { font-size:200px; margin: 20px; color: rgba(0,0,0,0); text-shadow: 0 0 10px rgba(255,255,255,0.5), 0 12px 15px rgba(255,0,0,0.2), -6px -10px 15px rgba(0,255,0,0.2), 6px -10px 15px rgba(0,0,255,0.2); }</style></head><body><h1>#{message}</h1></body></html>"
end
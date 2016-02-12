class Breadcrumb

  constructor: (router) ->
    @locations = []
    @limit     = 10
    @router = router
    @router.on "all", @update

  update: (location) =>
    split = location.split(":")
    @locations.push split[Math.min(0,split.length-1)]
    @locations.shift() if @locations.length > 10
      
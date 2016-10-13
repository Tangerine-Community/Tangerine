# For clarity, this controller is written assuming save and fetch methods are synchronous. In practice, this will need to be updated.
# To initialize, need either a tripId for an existing Trip or a workflowId for a new Trip.
class TripController extends Backbone.Controller
  
  constructor: (options = {tripId: null, workflowId: null }) ->
    @options = options

  render: () ->

    # Clean this Controller given this may not be the first render. This is good for memory usage.
    @clean()

    # Get the Trip StateModel ready that will contain the state for this controller.
    if @options.tripId
      @trip = new TripModel({ id: @options.tripId })
      @trip.fetch()
    else if @options.workflowId
      @trip = new TripModel({ workflowId: @options.workflowId })
      @trip.save()
    else
      throw "No workflowId or tripId provided."

    # Models hold state thus state can be saved and restored. When this Model changes, time to render again.
    @trip.on('sync', @render)

    # Get the Workflow related to this Trip. It will contain the map of sections.
    @workflow = new WorkflowModel({ id: @trip.get('workflowId') })
    @workflow.fetch()

    # Get the Section that is the last Section ID in the Trip's breadcrumb.
    # With breadcrumb "/sectionId1/sectionId2" this will return "sectionId2".
    @section = new SectionModel({ id: (@trip.get('breadcrumb').split('/')).pop() })
    @section.fetch()

    # See if we should skip this section. If so, set new trip state and render again.
    if CoffeeScript.eval.apply(section.get('skipLogic'), {trip: @trip, workflow: @workflow})
      # Save away `null` data with breadcrumb as the key as string like `/sectionId1/sectionId2/section3`.
      @trip.set( '/' + @trip.get('breadcrumb').join('/'),  null)
      # Calculate the next breadcrumb state.
      @trip.set('breadcrumb', @workflow.calculateNextBreadcrumb(@trip.get('breadcrumb')))
      @trip.save()
      # State has changed, render again.
      @render()

    @item = new ItemModel({ id: @section.get('itemId')})
    @item.fetch()

    @elements = new ElementsCollection({params: {itemId: item.id}})
    @elements.fetch()

    # Filter elements if Section's Filter Logic dictates it. Default returns all elements.
    @elements = CoffeeScript.eval.apply(section.get('filterLogic'), {trip: @trip, workflow: @workflow, item: @item, elements: @elements})

    @itemView = new ItemView({workflow: @workflow, item: @item, elements: @elements})
    @itemView.on "done", =>
      # Save away `null` data with breadcrumb as the key as string like `/sectionId1/sectionId2/section3`.
      @trip.set( '/' + @trip.get('breadcrumb').join('/'),  null)
      # Calculate the next breadcrumb state.
      @trip.set('breadcrumb', @workflow.calculateNextBreadcrumb(@trip.get('breadcrumb')))
      @trip.save()
      # State has changed, render again.
      @render()

    App.main.html(@itemView.el)
    @itemView.render()


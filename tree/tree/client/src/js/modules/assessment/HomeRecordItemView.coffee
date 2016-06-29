HomeRecordItemView = Backbone.Marionette.ItemView.extend
#  el: '#content table tbody'
#  el: ''
  tagName: 'tr'
  template: JST["SubtestRunItemView"]

#  initialize : ->
#    this.listenTo this.collection, 'all', this.update

#render: =>
#    @$el.html "
#    <td><a href=\"/#show/case/#{@model.get "_id"}\">#{@model.get "question"}</a></td><td>#{@model.get "user"}</td>
#                    <td>#{@model.get "lastModifiedAt"}</td>
#            "

#  render: =>
#    @$el.html "
#                       <tr id='#{@model.get "_id"}'>
#        <td><a href=\"/#show/case/#{@model.get "_id"}\">#{@model.get "question"}</a></td><td>#{@model.get "user"}</td>
#                        <td>#{@model.get "lastModifiedAt"}</td></tr>
#                "

#

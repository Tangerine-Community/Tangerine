class CurriculumListElementView extends Backbone.View

  className : "CurriculumListElementView"
  tagName: "li"

  events:
    'click .toggle_menu' : 'toggleMenu'
    'click .duplicate'   : 'duplicate'
    'click .delete'         : 'deleteToggle'
    'click .delete_cancel'  : 'deleteToggle'
    'click .delete_confirm' : 'delete'




  initialize: (options) ->
    @curriculum = options.curriculum
    @subtests = options.subtests

  duplicate: ->
    newName = "Copy of " + @curriculum.get("name")
    @curriculum.duplicate { name : newName }, null, null, (curriculum) => 
      @curriculum.trigger "new", curriculum

  toggleMenu: ->
    @$el.find(".sp_down, .sp_right").toggleClass('sp_down').toggleClass('sp_right')
    @$el.find(".menu").fadeToggle(150)

  deleteToggle: -> @$el.find(".delete_confirm").fadeToggle(250); false

  # deep non-gerneric delete
  delete: =>
    # remove from collection
    @curriculum.destroy()


  render: ->
    toggleButton    = "<div class='toggle_menu sp_right'><div> </div></div>"
    editButton      = "<a href='#curriculum/#{@curriculum.id}'><img class='link_icon edit' title='Edit' src='images/icon_edit.png'></a>"
    duplicateButton = "<img class='link_icon duplicate' title='Duplicate' src='images/icon_duplicate.png'>"
    deleteButton    = "<img class='delete link_icon' title='Delete' src='images/icon_delete.png'>"
    deleteConfirm   = "<span class='delete_confirm'><div class='menu_box'>Confirm <button class='delete_yes command_red'>Delete</button> <button class='delete_cancel command'>Cancel</button></div></span>"
    downloadKey     = "<span class='download_key small_grey'>Download key <b>#{@curriculum.id.substr(-5,5)}</b></span>"

    name = "<span class='toggle_menu'>#{@curriculum.escape('name')}</span>"
    menu = "
      #{editButton}
      #{duplicateButton}
      #{deleteButton}
      #{downloadKey}
      #{deleteConfirm}
    " if Tangerine.user.isAdmin()

    menu = "
      #{editButton}
      #{downloadKey}
    " if not Tangerine.user.isAdmin()

    @$el.html "
      <div>
        #{toggleButton}
        #{name}
      </div>
      <div>
        <div class='confirmation menu'>
          #{menu}
        </div>
      </div>

    "
    @trigger "rendered"
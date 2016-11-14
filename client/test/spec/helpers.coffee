Tangerine = new Marionette.Application()
Tangerine.user = new TabletUser();
if typeof Tangerine.settings == 'undefined'
  Tangerine.settings = new Settings({
    "_id": "settings"
  });

window.Tangerine = Tangerine


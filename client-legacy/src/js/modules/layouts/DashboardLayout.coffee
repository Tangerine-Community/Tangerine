DashboardLayout = Backbone.Marionette.LayoutView.extend
    template: JST["DashboardLayout"],
    regions:
        headerRegion: "#header-region",
        contentRegion: "#content-region"
        footerRegion: "#footer-region"

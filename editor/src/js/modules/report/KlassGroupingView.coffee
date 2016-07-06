class KlassGroupingView extends Backbone.View

  className : "KlassGroupingView"

  # Used to calculate percentiles
  # Use indices where Index = Standard Deviation * 100 for negative deviations
  normalCurve : [0.00000, 0.00399, 0.00798, 0.01197, 0.01595, 0.01994, 0.02392, 0.02790, 0.03188, 0.03586,0.03983, 0.04380, 0.04776, 0.05172, 0.05567, 0.05962, 0.06356, 0.06749, 0.07142, 0.07535,0.07926, 0.08317, 0.08706, 0.09095, 0.09483, 0.09871, 0.10257, 0.10642, 0.11026, 0.11409,0.11791, 0.12172, 0.12552, 0.12930, 0.13307, 0.13683, 0.14058, 0.14431, 0.14803, 0.15173,0.15542, 0.15910, 0.16276, 0.16640, 0.17003, 0.17364, 0.17724, 0.18082, 0.18439, 0.18793,0.19146, 0.19497, 0.19847, 0.20194, 0.20540, 0.20884, 0.21226, 0.21566, 0.21904, 0.22240,0.22575, 0.22907, 0.23237, 0.23565, 0.23891, 0.24215, 0.24537, 0.24857, 0.25175, 0.25490,0.25804, 0.26115, 0.26424, 0.26730, 0.27035, 0.27337, 0.27637, 0.27935, 0.28230, 0.28524,0.28814, 0.29103, 0.29389, 0.29673, 0.29955, 0.30234, 0.30511, 0.30785, 0.31057, 0.31327,0.31594, 0.31859, 0.32121, 0.32381, 0.32639, 0.32894, 0.33147, 0.33398, 0.33646, 0.33891,0.34134, 0.34375, 0.34614, 0.34849, 0.35083, 0.35314, 0.35543, 0.35769, 0.35993, 0.36214,0.36433, 0.36650, 0.36864, 0.37076, 0.37286, 0.37493, 0.37698, 0.37900, 0.38100, 0.38298,0.38493, 0.38686, 0.38877, 0.39065, 0.39251, 0.39435, 0.39617, 0.39796, 0.39973, 0.40147,0.40320, 0.40490, 0.40658, 0.40824, 0.40988, 0.41149, 0.41308, 0.41466, 0.41621, 0.41774,0.41924, 0.42073, 0.42220, 0.42364, 0.42507, 0.42647, 0.42785, 0.42922, 0.43056, 0.43189,0.43319, 0.43448, 0.43574, 0.43699, 0.43822, 0.43943, 0.44062, 0.44179, 0.44295, 0.44408,0.44520, 0.44630, 0.44738, 0.44845, 0.44950, 0.45053, 0.45154, 0.45254, 0.45352, 0.45449,0.45543, 0.45637, 0.45728, 0.45818, 0.45907, 0.45994, 0.46080, 0.46164, 0.46246, 0.46327,0.46407, 0.46485, 0.46562, 0.46638, 0.46712, 0.46784, 0.46856, 0.46926, 0.46995, 0.47062,0.47128, 0.47193, 0.47257, 0.47320, 0.47381, 0.47441, 0.47500, 0.47558, 0.47615, 0.47670,0.47725, 0.47778, 0.47831, 0.47882, 0.47932, 0.47982, 0.48030, 0.48077, 0.48124, 0.48169,0.48214, 0.48257, 0.48300, 0.48341, 0.48382, 0.48422, 0.48461, 0.48500, 0.48537, 0.48574,0.48610, 0.48645, 0.48679, 0.48713, 0.48745, 0.48778, 0.48809, 0.48840, 0.48870, 0.48899,0.48928, 0.48956, 0.48983, 0.49010, 0.49036, 0.49061, 0.49086, 0.49111, 0.49134, 0.49158,0.49180, 0.49202, 0.49224, 0.49245, 0.49266, 0.49286, 0.49305, 0.49324, 0.49343, 0.49361,0.49379, 0.49396, 0.49413, 0.49430, 0.49446, 0.49461, 0.49477, 0.49492, 0.49506, 0.49520,0.49534, 0.49547, 0.49560, 0.49573, 0.49585, 0.49598, 0.49609, 0.49621, 0.49632, 0.49643,0.49653, 0.49664, 0.49674, 0.49683, 0.49693, 0.49702, 0.49711, 0.49720, 0.49728, 0.49736,0.49744, 0.49752, 0.49760, 0.49767, 0.49774, 0.49781, 0.49788, 0.49795, 0.49801, 0.49807,0.49813, 0.49819, 0.49825, 0.49831, 0.49836, 0.49841, 0.49846, 0.49851, 0.49856, 0.49861,0.49865, 0.49869, 0.49874, 0.49878, 0.49882, 0.49886, 0.49889, 0.49893, 0.49896, 0.49900,0.49903, 0.49906, 0.49910, 0.49913, 0.49916, 0.49918, 0.49921, 0.49924, 0.49926, 0.49929,0.49931, 0.49934, 0.49936, 0.49938, 0.49940, 0.49942, 0.49944, 0.49946, 0.49948, 0.49950, 0.49952, 0.49953, 0.49955, 0.49957, 0.49958, 0.49960, 0.49961, 0.49962, 0.49964, 0.49965,0.49966, 0.49968, 0.49969, 0.49970, 0.49971, 0.49972, 0.49973, 0.49974, 0.49975, 0.49976,0.49977, 0.49978, 0.49978, 0.49979, 0.49980, 0.49981, 0.49981, 0.49982, 0.49983, 0.49983,0.49984, 0.49985, 0.49985, 0.49986, 0.49986, 0.49987, 0.49987, 0.49988, 0.49988, 0.49989,0.49989, 0.49990, 0.49990, 0.49990, 0.49991, 0.49991, 0.49992, 0.49992, 0.49992, 0.49992,0.49993, 0.49993, 0.49993, 0.49994, 0.49994, 0.49994, 0.49994, 0.49995, 0.49995, 0.49995,0.49995, 0.49995, 0.49996, 0.49996, 0.49996, 0.49996, 0.49996, 0.49996, 0.49997, 0.49997,0.49997, 0.49997, 0.49997, 0.49997, 0.49997, 0.49997, 0.49998, 0.49998, 0.49998, 0.49998]
  colorClass  : ["concerning", "poor", "good", "great"]
  status      : ["Concerning", "Poor", "Good", "Great"]

  events:
    "click .back"                      : "goBack"
    "change #selector_container input" : "selector"
    'click .student_name' : 'showItemized' 

  showItemized: (event) ->
    $target = $(event.target)
    studentId = $(event.target).attr "data-studentId"
    $studentResults = @$el.find ".student_#{studentId}"

    if $studentResults.is ":visible"
      $studentResults.addClass "confirmation"
      $target.css "color" : "black"
    else
      @$el.find(".student_name").css "color" : "black"
      $target.css "color" : "white"
      @$el.find(".itemized_results").addClass "confirmation"
      @$el.find(".student_#{studentId}").removeClass "confirmation"

  selector: ->
    subtestId = @$el.find("#selector_container input:checked").attr("data-subtestId")
    @selected.subtestId = subtestId
    @selected.results   = @results.where("subtestId" : subtestId)

    @updateTable()
    @render()

  goBack: -> history.back()

  initialize: ( options ) -> 

    @results = options.results
    @subtests = options.subtests
    @students = options.students

    @selected = {}
    
    for subtest, i in @subtests.models
      @selected.subtestId = @subtests.models[i].id
      break if (@selected.results = @results.where("subtestId" : subtest.id)).length != 0

    @updateTable()

  updateTable: ->

    @table   = []
    aCorrect = 0

    @subtest = @subtests.get @selected.subtestId
    @summary =
      "name"        : @subtest.get("name")
      "classSize"   : @students.length
      "resultCount" : @selected.results.length
      "aCorrect"    : 0
      "anCorrect"   : 0
      "stdDev"      : 0
      "attempted"   : 0
      "totalItems"  : @selected.results[0]?.get("total")
      "watchList"   : []

    for result in @selected.results
      person =
        'studentId'  : result.get("studentId")
        'items'      : result.getItemized()
        'name'       : @students.get( result.get("studentId") ).get("name")
        'pCorrect'   : 0
        'nCorrect'   : result.get("correct")
        'attempted'  : result.get("total") - result.get("missing")
        'total'      : result.get("total")
        'deviation'  : 0
        'percentile' : 0
        'status'     : ""

      person.pCorrect = Math.round(person.nCorrect / person.attempted * 100)

      @summary.aCorrect += person.pCorrect
      @summary.anCorrect += person.nCorrect
      @summary.attempted += person.attempted

      @table.push person

    @summary.aCorrect  = Math.decimals( @summary.aCorrect / @table.length, 0 )
    @summary.anCorrect = Math.decimals( @summary.anCorrect / @table.length, 2 )
    @summary.attempted = Math.decimals( @summary.attempted / @table.length, 2 )

    for person in @table
      @summary.stdDev += Math.pow(person.pCorrect - @summary.aCorrect, 2)

    @summary.stdDev = Math.decimals(Math.pow( @summary.stdDev / @table.length, 0.5), 2)

    for person, i in @table

      dev = (person.pCorrect - @summary.aCorrect) / @summary.stdDev

      devIndex = Math.round(dev * 100)
      
      percentile = if devIndex > 409 or devIndex < -409
          0
        else if devIndex > 0
          100 * Math.round(50 + 100 * @normalCurve[devIndex] ) / 100 
        else if devIndex < 0
          100 * Math.round(50 - 100 * @normalCurve[devIndex * -1] ) / 100
        else
          50

      pc = person.pCorrect

      index = 
        if pc >= 80
          index = 3
        else if pc >= 60 && pc <= 79
          index = 2
        else if pc >= 30 && pc <= 59
          index = 1
        else
          index = 0


      # old way
      # index = @getQuartile(percentile)
      
      ### semi-old way
      Math.floor(person.pCorrect / 100 * 4)
      index = 3 if index == 4
      ###

      @table[i].deviation  = devIndex / 100
      @table[i].percentile = percentile
      @table[i].index      = index
      @table[i].status     = @status[index]

      @summary.watchList.push person.name if index == 0 && !~@summary.watchList.indexOf(person.name )

    # Sort descending by %-correct
    @table.sort (a, b) -> b.pCorrect - a.pCorrect

    
    # warning flags
    nStudentsNotReady = 0
    (nStudentsNotReady++ if person.pCorrect < 75) for person in @table
    pNotReady = (nStudentsNotReady/@table.length) * 100
    isClassReady = pNotReady < 20

    warningIcon = "<img src='images/icon_warn.png'>"
    @readyPercentage = "<p>#{Math.round(pNotReady)}% of your students are not ready to move on to the next lessons.</p>"

    classReady = "It is ok to move on in the lesson sequence. Make sure that those children performing in the “poor” or “concerning” category get extra attention and practice and don’t fall behind. This can be done during practice lessons on Tuesday and Thursdays, or during another subject on the timetable."
    classNotReady = "Your class needs extra practice. Consider re-teaching Monday and Wednesday lessons introducing the new curriculum items or organize intense practice activities for the entire class. To find out which items students are particularly struggling with, select the name of a few students in the “poor” or “concerning” category and review their performance item by item. Take note of items that seem particularly troublesome."

    @readinessWarning = if isClassReady then classReady else classNotReady

  render: ->

    #
    # Warnings
    #

    if !~@subtests.pluck("reportType").indexOf("progress") #dont data guidance for progress

      # dynamic
      warningsHTML = "
      <section>
        #{@readyPercentage}
        #{@readinessWarning}
      </section>
      "
      # static
      warningsHTML += '
      <section>
        <p>Refer to the file “Kiswahili Wordlists” on your tablet for a list of additional words that may be useful for such group-based activities or practice for students performing in the “poor” or “concerning” category.</p>
        <p>For the students to watch – consider also communicating with parents for extra practice at home.</p>
        <p>Identify items these students need further practice on by selecting their name in the grouping report to see their performance on each item.</p>
        <p>Give parents some help: Write out on a piece of paper the letters for them to practice with their child; or copy applicable words from the “Kiswahili Wordlists” that contain the letters for the child to practice.</p>
      </section>
      '



    #
    # Empty warning
    #
    emptyHTML = "
      <h1>#{t('student grouping report')}</h1>
      <p>No students tested for #{@subtests.get(@selected.subtestId).get("name")} on assessment ##{@subtests.models[0].get("part")} yet. Return to the <a href='#class'>class menu</a> and click the <img src='images/icon_run.png'> icon to collect data.</p>
    "

    #
    # Menu
    #
    menuHTML = "<div id='selector_container' class='buttonset'>"
    for subtest in @subtests.models
      checkedAttribute = if subtest.id == @selected.subtestId then "checked='checked'" else ""
      menuHTML += "
        <label for='#{subtest.id}'>#{subtest.get("name")}</label>
        <input type='radio' class='selector' name='selector' id='#{subtest.id}' data-subtestId='#{subtest.id}' #{checkedAttribute}>
      "
    menuHTML += "</div>"

    #
    # summary
    #
    summaryHTML = "<h1>Summary</h1>
    <table class='summary'>
      <tr><th>Subtest Name</th>          <td>#{@summary.name}</td></tr>
      <tr><th>Class Size</th>            <td>#{@summary.classSize}</td></tr>
      <tr><th>Students Assessed</th>     <td>#{@summary.resultCount}</td></tr>
      <tr><th>Average Correct (%)</th>   <td>#{@summary.aCorrect}%</td></tr>
      <tr><th>Average Correct</th>       <td>#{@summary.anCorrect} / #{@summary.attempted}</td></tr>
      <tr><th>Students to watch</th>     <td>#{@summary.watchList.join(', ')}</td></tr>
    </table>"

    #
    # details
    #
    detailsHTML = "
      <h1>Student grouping</h1>
      <table class='details'>
      <tr>
        <th>Name</th>
        <th>% correct</th>
        <th>Status</th>
      </tr>
    "

    itemizedResults = ""

    for person in @table
      detailsHTML += "
        <tr class='#{@colorClass[person.index]}'>
          <td class='student_name icon' data-studentId='#{person.studentId}'>#{person.name}</td>
          <td>#{person.pCorrect}</td>
          <td>#{person.status}</td>
        </tr>
        "

      itemizedResults += "
        <table class='itemized_results confirmation student_#{person.studentId}'>
          <tbody><tr><th>Item</th><th>Result</th></tr>
      "

      for datum, i in person.items
        itemizedResults += "<tr><td>#{datum.itemLabel}</td><td>#{t(datum.itemResult)}</td></tr>"
      itemizedResults += "</tbody></table>"


    detailsHTML += "</table>"



    if @selected.results.length != 0
      html = "
        #{menuHTML}
        #{summaryHTML}
        #{detailsHTML}
        #{itemizedResults}
        #{warningsHTML || ""}
        <button class='navigation back'>Back</button>
      "
    else
      html = "
        #{menuHTML}
        #{emptyHTML}
        <button class='navigation back'>Back</button>
      "

    @$el.html html
    @trigger "rendered"
  
  # 0-indexed quartile
  getQuartile: (percentile) -> Math.round ((percentile / 100) * 3)

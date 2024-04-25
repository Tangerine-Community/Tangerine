/**
 * Many thanks to the WolfChart project, from which most of this code was taken.
 * https://github.com/ballantynedewolf/WolfChart
 */
export class ConfigWolfChart {
    self = this;
    ver = 2.41;

    constructor(self) {
        var functionConfigWolfChart = this;
        var objWolf = {};
        var notation, numeratorType, oldCharacter = [];
        var chartArray = [], timeOut;
        var anims = ['slide-out-top', 'slide-out-right', 'slide-out-bottom', 'slide-out-left', 'slide-in-top', 'slide-in-right', 'slide-in-bottom', 'slide-in-left'];
        var colours = {
            optotype: "",
            backgrounds: {
                optotype: "",
                binocular: "",
            },
            fRedHue: "",
            fGreenHue: "",
            themes: {
                R: 'rgb(174,39,96)',
                B: 'rgb(104,154,104)',
                M: 'rgb(214, 116, 10)',
            },
        }
        var shortcuts = ['u', 'n', 'g', 'k', 'q', 'z'];

        this.initObjWolf =  () =>  {
            objWolf = {
                dateCreated: Date.now(),
                useCountTimer: null,
                catsLength: 0,
                catThis: "",
                chartThis: "",
                chartThisId: "",
                isMasked: false,
                //array of charts with spacebar functions, and the function type
                hasSBFunc: [['rJCCDots', 'zoom'], ['rBullseye', 'zoom'], ['rSeptumChart', 'interspace'], ['rDuoSeptumChart', 'interspace'], ['bFixDisp', 'rotate'], ['bWorth4Dot', 'zoom'], ['bDPhoriaArrows', 'rotate'], ['mWhiteDot', 'zoom']],
                pointer: 0,
                animIn: "",
                animOut: "",
                catLeft: function () {
                    return (this.catThis > 0) ? this.catThis - 1 : this.catsLength - 1;
                },
                catRight: function () {
                    return (this.catThis == this.catsLength - 1) ? 0 : this.catThis + 1;
                },
                chartU: function () {
                    return (this.chartThis < this[this.catThis].arCharts.length - 1) ? this.chartThis + 1 : 0;
                },
                chartD: function () {
                    return (this.chartThis > 0) ? this.chartThis - 1 : this[this.catThis].arCharts.length - 1;
                },
                setUseCount: function (cat, id) {
                    //increment the useCount of the chart up one
                    var obj = this[cat].arCharts[id];
                    obj.useCount++;
                },
                getLastUsed: function (cat) {
                    return this[cat].lastUsed;
                },
                getMostUsed: function (cat) {
                    //calculate most browsed in the category
                    var max = -1, result = "";
                    var ar = this[cat].arCharts;
                    ar.forEach(function (el, idx) {
                        if (el.useCount > max) {
                            max = el.useCount;
                            result = idx;
                        }
                    });
                    return result;
                },
                cycler: function (idx, len) {
                    (idx < len - 1) ? idx++ : idx = 0;
                    return idx;
                }
            }

        }
        this.Clock = function () {
            var today = new Date(), h = today.getHours(), m = today.getMinutes(), s = today.getSeconds();
            h = (h < 10) ? "0" + h : h;
            m = (m < 10) ? "0" + m : m;
            $('#clock-div', this.self.shadowRoot).html(h + ":" + m);
            var t = setTimeout(functionConfigWolfChart.Clock, 5000);
        }

        this.DisplayArrows = function () {
            /*Charts are arranged in categories. User navigates left
        and right between categories, and up and down within
        categories.
        Navigation links are built from the array of categories
        and the categories are populated by divs in this page
        (and later from external files also).
        */
            //populate the arrow-button-div with arrows
            const btRight = $('#btRight', this.self.shadowRoot);
            const btLeft = $('#btLeft', this.self.shadowRoot);
            const btUp = $('#btUp', this.self.shadowRoot);
            const btDn = $('#btDn', this.self.shadowRoot);
            $('.arrow-button-prototype', this.self.shadowRoot).clone().appendTo(btRight).attr({class: 'arrow-button'}).on('click', function () {
                functionConfigWolfChart.navCat(objWolf.catRight(), 'right')
            });
            $('.arrow-button-prototype', this.self.shadowRoot).clone().appendTo(btLeft).css('transform', 'rotate(180deg)').attr({class: 'arrow-button'}).on('click', function () {
                functionConfigWolfChart.navCat(objWolf.catLeft(), 'left')
            });
            $('.arrow-button-prototype', this.self.shadowRoot).clone().appendTo(btUp).css('transform', 'rotate(-90deg)').attr({
                class: 'arrow-button',
                id: 'up-arrow'
            }).on('click', function () {
                functionConfigWolfChart.scrollChart(objWolf.catThis, objWolf.chartU(), 'top')
            });
            $('.arrow-button-prototype', this.self.shadowRoot).clone().appendTo(btDn).css('transform', 'rotate(90deg)').attr({
                class: 'arrow-button',
                id: 'dn-arrow'
            }).on('click', function () {
                functionConfigWolfChart.scrollChart(objWolf.catThis, objWolf.chartD(), 'bottom')
            });
            //$('.nav-button-prototype', this.self.shadowRoot).clone().appendTo('#thisBadge', this.self.shadowRoot).attr({class:''});
            $('.up-arrow-prototype', this.self.shadowRoot).clone().appendTo(btUp).attr({class: 'pic-arrow', id: 'up-pic-arrow'}).css({
                width: '100%',
                left: '0px',
                top: '0px',
            }).on('click', function () {
                functionConfigWolfChart.scrollChart(objWolf.catThis, objWolf.chartU(), 'top')
            });
            $('.dn-arrow-prototype', this.self.shadowRoot).clone().appendTo(btDn).attr({class: 'pic-arrow', id: 'dn-pic-arrow'}).css({
                width: '100%',
                left: '0px',
                bottom: '0px',
            }).on('click', function () {
                functionConfigWolfChart.scrollChart(objWolf.catThis, objWolf.chartD(), 'bottom')
            });
            //populate the function-button-div with function buttons
            const btFullscreenFunc = $('#btFullscreenFunc', this.self.shadowRoot);
            const btSpacebarFunc = $('#btSpacebarFunc', this.self.shadowRoot);
            // disabled Shuffle button
            // const btShuffleFunc = $('#btShuffleFunc', this.self.shadowRoot);
            const btBgFunc = $('#btBgFunc', this.self.shadowRoot);
            $('.fullscreen-button-prototype', this.self.shadowRoot).clone().appendTo(btFullscreenFunc).attr({class: 'f-button fullscreen-button'}).on('click', function () {
                functionConfigWolfChart.fullscreenChange(objWolf.catThis, objWolf.chartThis);
            }).hide();
            $('.zoom-button-prototype', this.self.shadowRoot).clone().appendTo(btSpacebarFunc).attr({class: 'f-button zoom-button'}).hide();
            $('.rotate-button-prototype', this.self.shadowRoot).clone().appendTo(btSpacebarFunc).attr({class: 'f-button rotate-button'}).hide();
            $('.interspace-button-prototype', this.self.shadowRoot).clone().appendTo(btSpacebarFunc).attr({class: 'f-button interspace-button'}).hide();
            // disabled Shuffle button
            // $('.shuffle-button-prototype', this.self.shadowRoot).clone().appendTo(btShuffleFunc).attr({class: 'f-button shuffle-button'}).on('click',  () => {
            //     functionConfigWolfChart.shuffleLetters();
            // }).hide();
            $('.bg-button-prototype', this.self.shadowRoot).clone().appendTo(btBgFunc).attr({class: 'f-button bg-button'}).on('click', function () {
                functionConfigWolfChart.duoBGFunction()
            }).hide();
            //Hover function for buttons
            $('.arrow-active', this.self.shadowRoot).hide();
            //mediaMatch here to set hover only for desktopdu
            $('.arrow-button, .pic-arrow, .f-button', this.self.shadowRoot).hover(()=> {
                $(this).find('.arrow-active').show();
            }, function () {
                $(this).find('.arrow-active').hide();
            });

            const collapse = (e) => {
                var el = $(e.currentTarget, this.self.shadowRoot);
                el.removeClass('expanded');
                el.off('click').on('click', expand);
            }

            const expand = (e) =>  {
                var el = $(e.currentTarget, this.self.shadowRoot);
                el.addClass('expanded');
                el.off('click').on('click', collapse);
                timer(parkFlyout, 3000);
            }

            //animate flyout nav bar - also animated by mousenter below
            $('#nav-button-div', this.self.shadowRoot).on('click', expand);

            const parkFlyout = () => {
                $('#nav-button-div', this.self.shadowRoot).removeClass('expanded');
                //navDiv.className = '';
            }

            const timer = (fn, secs) => {
                clearTimeout(timeOut);
                timeOut = setTimeout(fn, secs);
            }

            $('#nav-button-outer-div', this.self.shadowRoot).on('mouseenter',  () => {
                $('#nav-button-div', this.self.shadowRoot).addClass('expanded');
                timer(parkFlyout, 3000);
            });

        }
        this.DisplayNavigations = function () {
            for (let r = 0; r < objWolf.catsLength; r++) {
                var thing = objWolf[r];
                //populate the nav-button-div with category links
                $('#nav-button-div', this.self.shadowRoot).append("<a class='nav-link' id='bt" + thing.cat + "' title='" + thing.title + "'></a>");
                $('#bt' + thing.cat, this.self.shadowRoot).on('click', {id: r}, (event) => {
                    var data = event.data;
                    functionConfigWolfChart.navCat(data.id, 'fav');
                });
                const bt = $('#bt' + thing.cat, this.self.shadowRoot);
                $('.nav-button-prototype', this.self.shadowRoot).clone().appendTo(bt).attr({class: 'nav-button'}).css({marginBottom: '10px'});
                $('#bt' + thing.cat + ' .dot', this.self.shadowRoot).attr({fill: thing.col});
                $('#bt' + thing.cat + ' svg text', this.self.shadowRoot).text(thing.cat);
                $('.dot-active', this.self.shadowRoot).hide();
                $('.nav-button', this.self.shadowRoot).hover(function () {
                    $(this).find('.dot-active').show();
                }, function () {
                    $(this).find('.dot-active').hide();
                });

            }
        }
        this.sidebarControls = function (selCat, selChart) {
            var thisLink = $('#bt' + objWolf[selCat].cat, this.self.shadowRoot);
            var thisCol = objWolf[selCat].col;
            $('#nav-button-div a', this.self.shadowRoot).css('background-color', 'transparent');
            thisLink.css('background-color', 'rgb(102,102,102)');
            //select and colour the arrows
            if (selCat == 0) {
                $('#up-pic-arrow, #dn-pic-arrow', this.self.shadowRoot).hide();
                $('#up-arrow, #dn-arrow', this.self.shadowRoot).show();
            } else {
                $('#up-pic-arrow, #dn-pic-arrow', this.self.shadowRoot).show();
                $('#up-arrow, #dn-arrow', this.self.shadowRoot).hide();
            }
            $('#btUp,#btDn', this.self.shadowRoot).find('.arrow-dot').attr({fill: thisCol});
            $('#btUp,#btDn', this.self.shadowRoot).find('.pic-border').attr({stroke: thisCol});
            $('#thisBadge', this.self.shadowRoot).find('svg text').text(objWolf[selCat].cat).attr({fill: thisCol});
            $('#thisBadge', this.self.shadowRoot).find('.dot').attr({
                fill: 'white',
                opacity: '80%',
                stroke: thisCol,
                'stroke-width': '0.25px'
            });
            $('#btLeft .arrow-dot', this.self.shadowRoot).attr({fill: thisCol});
            $('#btRight .arrow-dot', this.self.shadowRoot).attr({fill: thisCol});
            //display the single charts above and below the current in the pic-arrows
            $('.scrollPic', this.self.shadowRoot).remove();
            var chartUId = objWolf[selCat].cat + objWolf.chartU(),
                chartDId = objWolf[selCat].cat + objWolf.chartD();
            if (selCat != 0) {
                var upArrowInsLayer = $('#up-pic-arrow', this.self.shadowRoot).find('.up-arrow-g1');
                var upArrowPanel = $('#up-pic-arrow', this.self.shadowRoot).find('.up-arrow-g0 path');
                var upMiniChart = $('#' + chartUId, this.self.shadowRoot);
                upMiniChart.find('svg').clone().appendTo(upArrowInsLayer).attr({
                    width: '80%',
                    x: '10%',
                    y: '-10%',
                    class: 'scrollPic',
                    transform: '',
                    height: '80%',
                }).show();
                upArrowPanel.attr('fill', upMiniChart.css('background-color'));
                var dnArrowInsLayer = $('#dn-pic-arrow', this.self.shadowRoot).find('.dn-arrow-g1');
                var dnArrowPanel = $('#dn-pic-arrow', this.self.shadowRoot).find('.dn-arrow-g0 path');
                var dnMiniChart = $('#' + chartDId, this.self.shadowRoot);
                dnMiniChart.find('svg').clone().appendTo(dnArrowInsLayer).attr({
                    width: '80%',
                    x: '10%',
                    y: '30%',
                    class: 'scrollPic',
                    transform: '',
                    height: '80%',
                }).show();
                dnArrowPanel.attr('fill', dnMiniChart.css('background-color'));
            }
            //select ánd configure the buttons for this category
            if (objWolf.catThis == 0) {
                $('.f-button', this.self.shadowRoot).hide();
                $('.bg-button', this.self.shadowRoot).show();
                $('.shuffle-button', this.self.shadowRoot).show();
                $('.fullscreen-button', this.self.shadowRoot).show();
            } else {
                $('.f-button', this.self.shadowRoot).hide();
                $('.bg-button', this.self.shadowRoot).hide();
                $('.shuffle-button', this.self.shadowRoot).hide();
                $('.fullscreen-button', this.self.shadowRoot).show();
                // display a space bar function button
                var thisChart = objWolf[selCat].arCharts[selChart], thisSVG = $('#' + thisChart.id).find('svg');
                if (thisSVG.length > 0) {
                    objWolf.hasSBFunc.forEach(function (el, idx) {
                        if (thisSVG[0].id == el[0]) {
                            var sbfb = $('.' + el[1] + '-button', this.self.shadowRoot);
                            var buttonLayers = sbfb.find('g');
                            sbfb.show();
                            //set function button state
                            if (thisChart.isToggled) {
                                $(buttonLayers[0]).hide();
                                $(buttonLayers[1]).show();
                            } else {
                                $(buttonLayers[0]).show();
                                $(buttonLayers[1]).hide();
                            }
                            //special case for Worth4Dot, where zoom is in reverse - default is double-size
                            if (thisSVG[0].id == "bWorth4Dot") {
                                $(buttonLayers[0]).hide();
                                $(buttonLayers[1]).show();
                            }
                            sbfb.off('click').on('click', function () {
                                $("#" + objWolf.chartThisId).trigger('click');
                            })
                        }
                    });
                }
            }

        }
        this.navCat = (selCat, anim) =>  {
            objWolf.catThis = selCat;
            // var thisCat = objWolf[selCat].cat;
            const displayOrder = $('#display', this.self.shadowRoot).val();
            if (!anim) {//anim=null is only used on initiating the chart
                var arCharts = objWolf[selCat].arCharts;
                if (displayOrder == 2 || displayOrder == 3) {
                    // objWolf.chartThis = arCharts.length - 1;
                    objWolf.chartThis = arCharts.length - this.self.sequenceNumber;
                } else {
                    objWolf.chartThis = this.self.sequenceNumber - 1;
                }
                // $('.scoreBoxSummary', this.self.shadowRoot).append("hey");
            } else if (anim == 'fav') {//nav buttons display most used chart in category
                objWolf.chartThis = objWolf.getMostUsed(selCat);
            } else if (anim == 'fscreen') {
                objWolf.chartThis = objWolf.getLastUsed(selCat);
            } else {//arrow buttons display last used chart in category
                objWolf.chartThis = objWolf.getLastUsed(selCat);
            }
            functionConfigWolfChart.scrollChart(objWolf.catThis, objWolf.chartThis, anim);
        }

        this.scrollChart = (selCat, selChart, anim) =>  {
            //select charts from the divs in page
            //also here we can pull charts from
            //external files.
            if (selCat == 0) {
                $('#otherChart', this.self.shadowRoot).hide();
                $('#letterChart', this.self.shadowRoot).show();
            } else {
                $('#letterChart', this.self.shadowRoot).hide();
                $('#otherChart', this.self.shadowRoot).show();
            }
            var charts = $('.' + objWolf[selCat].cat, this.self.shadowRoot);
            switch (anim) {
                case "top":
                    objWolf.animOut = "slide-out-bottom"
                    break;
                case "bottom":
                    objWolf.animOut = "slide-out-top"
                    break;
                case "left":
                    objWolf.animOut = "slide-out-right"
                    break;
                case "right":
                    objWolf.animOut = "slide-out-left"
                    break;

            }

            //When animating charts in and out, start sliding in the new chart
            //shortly after starting to slide out the old chart, rather than waiting til
            //slide out has finished. Then configure the sidebar controls when new chart
            //has finished sliding in
            if (anim != null) {//after first use
                var outGoingChart = $('#' + objWolf.chartThisId, this.self.shadowRoot);
                var inComingChart = $('#' + charts[selChart].id, this.self.shadowRoot);
                $('#otherChart', this.self.shadowRoot).css({
                    'background-color': inComingChart.css('background-color'),
                })
                if (anim != 'fav') {//using arrow buttons
                    objWolf.animIn = 'slide-in-' + anim;
                    var animPromise = new Promise(function (resolve, reject) {
                        outGoingChart.removeClass(anims.join(' ')).addClass(objWolf.animOut);
                        outGoingChart.on('animationstart', resolve());
                    });
                    animPromise.then(
                        function () {
                            setTimeout(function () {
                                outGoingChart.removeClass(anims.join(' ')).hide();
                                inComingChart.addClass(objWolf.animIn).show();
                                functionConfigWolfChart.sidebarControls(selCat, selChart);
                            }, 200);
                        },
                        function () {
                            console.log("something went wrong with the animations");
                        }
                    );
                } else {//using navigation buttons
                    outGoingChart.removeClass(anims.join(' ')).hide();
                    inComingChart.show();
                    functionConfigWolfChart.sidebarControls(selCat, selChart);
                }

            } else {//first use
                $(charts[selChart], this.self.shadowRoot).show();
                functionConfigWolfChart.sidebarControls(selCat, selChart);
                this.self.value = charts[selChart].querySelector('.scoreBox').innerHTML
            }
            //navigation to and display of chart is now finished
            //update cat and chartThis
            objWolf.chartThis = selChart;
            objWolf.chartThisId = charts[selChart].id;
            //store objWolf so that we can come back to the same chart after a reload
            localStorage.setItem("ObjWolf", JSON.stringify(objWolf));
            objWolf[selCat].lastUsed = selChart;

            //select animation script for any charts that are animated external to their svg
            var thisSVG = $('#' + objWolf.chartThisId, this.self.shadowRoot).find('svg');
            if (thisSVG.parent().hasClass('animated')) {
                switch (thisSVG.attr('id')) {
                    case 'mLetterMorph':
                        functionConfigWolfChart.letterMorph();
                        break;
                }
            }
            //darken the sidebar in the case of the blank black chart only, id=M0
            //the purpose of this chart is for room darkening, so it is always the first chart
            //in the M category
            // $('#side-bar', this.self.shadowRoot).css({
            //     'opacity': 1,
            // });
            // if (objWolf.chartThisId == "M0") {
            //     $('#side-bar', this.self.shadowRoot).css({
            //         'opacity': 0.1,
            //     });
            // }
            //record a use count for this chart after n seconds
            var timer = objWolf.useCountTimer;
            if (timer) {
                clearTimeout(timer);
            }
            objWolf.useCountTimer = setTimeout(function () {
                objWolf.setUseCount(selCat, selChart);
            }, 3000);
        }


        this.SelectOptotype = () =>  {
            $('#sOptotype', this.self.shadowRoot).on('change', (event) =>  {
                var optotype = $(event.target).val();
                $('#sAlphabet', this.self.shadowRoot).html('');
                switch (optotype) {
                    case '1':
                        $('#sAlphabet', this.self.shadowRoot).append('<option value="2">BS4274.3</option><option value="1">SnellenU</option>')
                        break;
                    case '2':
                        $('#sAlphabet', this.self.shadowRoot).append('<option value="3">ETDRS</option><option value="4">SloanU</option>');
                        break;
                    case '3':
                        $('#sAlphabet', this.self.shadowRoot).append('<option value="5">Landolt_5Chars_01</option>');
                        break;
                    case '4':
                        $('#sAlphabet', this.self.shadowRoot).append('<option value="6">Tumbling_5Chars_01</option>');
                        break;
                    case '5':
                        $('#sAlphabet', this.self.shadowRoot).append('<option value="7">Vanishing_5Chars_01</option>');
                        break;
                    case '6':
                        $('#sAlphabet', this.self.shadowRoot).append('<option value="8">Shapes_5Chars_01</option>');
                        break;
                    case '7':
                        $('#sAlphabet', this.self.shadowRoot).append('<option value="9">Chinese_5Chars_01</option>');
                        break;
                    case '8':
                        $('#sAlphabet', this.self.shadowRoot).append('<option value="10">Arabic_5chars_01</option>');
                        break;
                    case '9':
                        $('#sAlphabet', this.self.shadowRoot).append('<option value="11">Hebrew_5Chars_01</option>');
                        break;
                    case '10':
                        $('#sAlphabet', this.self.shadowRoot).append('<option value="12">Crowded HOTV</option><option value="13">Crowded HOTV 2</option>');
                        break;
                    case '11':
                        $('#sAlphabet', this.self.shadowRoot).append('<option value="14">Auckland</option>');
                        break;

                }
            });
        };

        //separating rgb from opacity allows letters to have overlapping elements
        this.SetColorCharacter =  (optoCol) => {
            var rgba = optoCol.replace(/[^\d.,]/g, '').split(',');
            var colorRGB = "rgb(" + rgba[0] + "," + rgba[1] + "," + rgba[2] + ")";
            var dotA = (parseInt(rgba[3]) + 1) * 0.5;
            $('#list-character', this.self.shadowRoot).find('svg.optotype-symbol').css('opacity', rgba[3]);
            //only update fill of black fills, or Vanishing optotypes won't work
            $('#list-character', this.self.shadowRoot).find('svg.optotype-symbol').find('path').not('.white').css({fill: colorRGB});
            $('#list-character', this.self.shadowRoot).find('svg.optotype-symbol').find('polygon').not('.white').css({fill: colorRGB});
        };
        this.SetBgColor =  (bgCol) => {
            var halftone = "", regExp = /\(([^)]+)\)/g;  // get the values within () of optotype colour
            var matches = regExp.exec(colours.optotype);
            var splits = matches[1].split(',');
            for (let i = 0; i < 3; i++) {
                splits[i] = parseInt(splits[i]) + Math.round((255 - splits[i]) / 2);
            }
            halftone = 'rgba(' + splits[0] + ',' + splits[1] + ',' + splits[2] + ',1)'
            var alphabetType = $('#sAlphabet', this.self.shadowRoot).val()
            if (alphabetType == 7) {//Vanishing optotype needs background same hue and half the saturation of the optotype color
                $(document.body).css('background-color', halftone);
                $('.char-line', this.self.shadowRoot).css('background-color', halftone);
            } else {
                $(document.body).css('background-color', bgCol);
                $('.char-line', this.self.shadowRoot).css('background-color', bgCol);
            }
        };
        this.SetHeightCharacter =  (distance) => {
            var lolb = $('#iLengOfLine', this.self.shadowRoot).val();//get length of line below
            var localOptotype = $('#sOptotype', this.self.shadowRoot).val()
            var countArr = -1;
            for (var d = 0; d < chartArray.length; d++) {
                countArr++;
                var letterSubtense = (localOptotype != 10) ? chartArray[d][0] * 5 : chartArray[d][0] * 9; //all letters 5 limbs high, crowded letters 9 limbs high
                var degrees = letterSubtense / 60;
                var radians = degrees * (Math.PI / 180);
                var tanNumber = (Math.tan(radians));
                var minCharacter = tanNumber * distance * (120 / lolb); // 120 because calibration line is 120 mm
                chartArray[d].push(minCharacter);
            }
            ;
        };
        this.CaculatorCharacterHeight =  (numeratorType) =>  {
            //sets the VA value to be displayed in scoreBox div
            var setHeightFunction = this;
            var dist = $('#iDistance', this.self.shadowRoot).val();
            let notation = $('#sNotation', this.self.shadowRoot).val();
            switch (notation) {
                case "1"://metres
                    var ar = [0.501, 0.631, 0.794, 1, 1.259, 1.585, 2, 2.512, 3.162, 3.981, 5.012, 6.31, 7.943, 10];
                    //always input mm
                    if (numeratorType == "2") {
                        var scoreDisplay = ['6/3', '6/3.8', '6/4.8', '6/6', '6/7.5', '6/9.5', '6/12', '6/15', '6/19', '6/24', '6/30', '6/38', '6/48', '6/60'];
                        for (let a = 0; a < ar.length; a++) {
                            chartArray[a] = [ar[a], scoreDisplay[a]];
                        }
                    } else {
                        var numerator = Math.round(dist / 100) / 10;
                        for (let a = 0; a < ar.length; a++) {
                            if (a < 6) {
                                var score = Math.round(ar[a] * numerator * 10) / 10;
                            } else {
                                var score = Math.round(ar[a] * numerator);
                            }
                            var str = numerator + "!" + score;
                            chartArray[a] = [ar[a], str];
                        }
                    }
                    break;
                case "2"://feet
                    var ar = [0.501, 0.631, 0.794, 1, 1.259, 1.585, 2, 2.512, 3.162, 3.981, 5.012, 6.31, 7.943, 10];
                    if (numeratorType == "2") {
                        var scoreDisplay = ['20/10', '20/12.5', '20/16', '20/20', '20/25', '20/32', '20/40', '20/50', '20/63', '20/80', '20/100', '20/125', '20/160', '20/200'];
                        for (let a = 0; a < ar.length; a++) {
                            chartArray[a] = [ar[a], scoreDisplay[a]];
                        }
                    } else {
                        var numerator = Math.round(dist * 3.28084 / 500) / 2;
                        for (let a = 0; a < ar.length; a++) {
                            var score = Math.round(ar[a] * numerator);
                            var str = numerator + "!" + score;
                            chartArray[a] = [ar[a], str];
                        }
                    }
                    break;
                case "3"://logMar
                    var ar = [0.501, 0.631, 0.794, 1, 1.259, 1.585, 2, 2.512, 3.162, 3.981, 5.012, 6.31, 7.943, 10];
                    var scoreDisplay = ['-0.3', '-0.2', '-0.1', '0', '0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1'];
                    for (let a = 0; a < ar.length; a++) {
                        chartArray[a] = [ar[a], scoreDisplay[a]];
                    }
                    break;
                case "4"://Decimal
                    var ar = [0.501, 0.631, 0.794, 1, 1.259, 1.585, 2, 2.512, 3.162, 3.981, 5.012, 6.31, 7.943, 10];
                    var scoreDisplay = ['2', '1.6', '1.25', '1', '0.8', '0.63', '0.5', '0.4', '0.32', '0.25', '0.2', '0.16', '0.125', '0.1'];
                    for (let a = 0; a < ar.length; a++) {
                        chartArray[a] = [ar[a], scoreDisplay[a]];
                    }
                    break;
            }

            //set height for character
            setHeightFunction.SetHeightCharacter(dist)
        };
        this.GenerateCharacter =  (alphabetType, localOptotype) => {
            var arrayCharacter = [],
                convertFunction = this;
            if (this.self.characterName) {
                for (let i = 0; i < 14; i++) {
                    arrayCharacter.push(this.self.characterName)
                }
            } else {
                switch (alphabetType) {
                    //set alphabet for each optotype
                    case '1'://SnellenU
                        arrayCharacter = ['Snellen_N,Snellen_L,Snellen_A,Snellen_Y,Snellen_Z', 'Snellen_E,Snellen_F,Snellen_R,Snellen_D,Snellen_U', 'Snellen_T,Snellen_P,Snellen_V,Snellen_H,Snellen_X', 'Snellen_Y,Snellen_E,Snellen_L,Snellen_R,Snellen_T', 'Snellen_F,Snellen_X,Snellen_U,Snellen_D,Snellen_H', 'Snellen_A,Snellen_N,Snellen_P,Snellen_V,Snellen_Z', 'Snellen_H,Snellen_Z,Snellen_T,Snellen_Y,Snellen_D', 'Snellen_V,Snellen_F,Snellen_X,Snellen_N,Snellen_R', 'Snellen_A,Snellen_L,Snellen_P,Snellen_U,Snellen_E', 'Snellen_P,Snellen_U,Snellen_V,Snellen_F,Snellen_Y', 'Snellen_T,Snellen_A,Snellen_H,Snellen_E,Snellen_D', 'Snellen_L,Snellen_R,Snellen_N,Snellen_Z,Snellen_X', 'Snellen_D,Snellen_Y,Snellen_P,Snellen_L,Snellen_N', 'Snellen_Z,Snellen_A,Snellen_T,Snellen_F,Snellen_R']
                        break;
                    case '2'://BS4274.3
                        arrayCharacter = ['Snellen_U,Snellen_R,Snellen_N,Snellen_D,Snellen_V', 'Snellen_N,Snellen_F,Snellen_R,Snellen_Z,Snellen_E', 'Snellen_P,Snellen_H,Snellen_D,Snellen_F,Snellen_V', 'Snellen_R,Snellen_U,Snellen_N,Snellen_E,Snellen_Z', 'Snellen_D,Snellen_V,Snellen_E,Snellen_P,Snellen_R', 'Snellen_U,Snellen_D,Snellen_H,Snellen_V,Snellen_N', 'Snellen_Z,Snellen_U,Snellen_V,Snellen_F,Snellen_P', 'Snellen_E,Snellen_R,Snellen_D,Snellen_H,Snellen_Z', 'Snellen_U,Snellen_D,Snellen_P,Snellen_N,Snellen_F', 'Snellen_V,Snellen_E,Snellen_H,Snellen_U,Snellen_P', 'Snellen_F,Snellen_Z,Snellen_V,Snellen_R,Snellen_N', 'Snellen_H,Snellen_R,Snellen_E,Snellen_Z,Snellen_D', 'Snellen_N,Snellen_F,Snellen_H,Snellen_P,Snellen_Z', 'Snellen_U,Snellen_V,Snellen_F,Snellen_E,Snellen_H']
                        break;
                    case '3':
                        arrayCharacter = ['Sloan_C,Sloan_H,Sloan_N,Sloan_R,Sloan_V', 'Sloan_D,Sloan_K,Sloan_O,Sloan_S,Sloan_V', 'Sloan_V,Sloan_O,Sloan_R,Sloan_D,Sloan_N', 'Sloan_H,Sloan_Z,Sloan_C,Sloan_K,Sloan_X', 'Sloan_O,Sloan_K,Sloan_V,Sloan_H,Sloan_D', 'Sloan_Z,Sloan_R,Sloan_N,Sloan_S,Sloan_C', 'Sloan_K,Sloan_S,Sloan_D,Sloan_C,Sloan_H', 'Sloan_R,Sloan_N,Sloan_O,Sloan_V,Sloan_Z', 'Sloan_D,Sloan_H,Sloan_R,Sloan_O,Sloan_K', 'Sloan_C,Sloan_N,Sloan_Z,Sloan_S,Sloan_V', 'Sloan_H,Sloan_O,Sloan_S,Sloan_D,Sloan_N', 'Sloan_C,Sloan_V,Sloan_K,Sloan_Z,Sloan_R', 'Sloan_D,Sloan_H,Sloan_R,Sloan_N,Sloan_O', 'Sloan_S,Sloan_V,Sloan_C,Sloan_K,Sloan_Z']
                        break;
                    case '4':
                        arrayCharacter = ['Sloan_V,Sloan_N,Sloan_T,Sloan_C,Sloan_E', 'Sloan_P,Sloan_X,Sloan_R,Sloan_Z,Sloan_S', 'Sloan_D,Sloan_H,Sloan_O,Sloan_L,Sloan_K', 'Sloan_E,Sloan_T,Sloan_K,Sloan_O,Sloan_D', 'Sloan_C,Sloan_S,Sloan_N,Sloan_R,Sloan_H', 'Sloan_P,Sloan_L,Sloan_X,Sloan_Z,Sloan_V', 'Sloan_N,Sloan_K,Sloan_Z,Sloan_P,Sloan_O', 'Sloan_E,Sloan_V,Sloan_R,Sloan_X,Sloan_D', 'Sloan_T,Sloan_C,Sloan_S,Sloan_L,Sloan_H', 'Sloan_V,Sloan_H,Sloan_X,Sloan_D,Sloan_S', 'Sloan_R,Sloan_O,Sloan_K,Sloan_L,Sloan_E', 'Sloan_Z,Sloan_P,Sloan_C,Sloan_N,Sloan_T', 'Sloan_T,Sloan_E,Sloan_V,Sloan_C,Sloan_R', 'Sloan_H,Sloan_L,Sloan_D,Sloan_P,Sloan_N']
                        break;
                    case '5':
                        arrayCharacter = ['LandoltC_N,LandoltC_S,LandoltC_E,LandoltC_N,LandoltC_W', 'LandoltC_E,LandoltC_E,LandoltC_N,LandoltC_W,LandoltC_S', 'LandoltC_E,LandoltC_S,LandoltC_S,LandoltC_W,LandoltC_N', 'LandoltC_N,LandoltC_W,LandoltC_N,LandoltC_S,LandoltC_E', 'LandoltC_S,LandoltC_W,LandoltC_N,LandoltC_W,LandoltC_E', 'LandoltC_W,LandoltC_E,LandoltC_S,LandoltC_N,LandoltC_S', 'LandoltC_W,LandoltC_N,LandoltC_E,LandoltC_S,LandoltC_W', 'LandoltC_S,LandoltC_N,LandoltC_N,LandoltC_W,LandoltC_E', 'LandoltC_N,LandoltC_E,LandoltC_S,LandoltC_W,LandoltC_W', 'LandoltC_N,LandoltC_S,LandoltC_E,LandoltC_N,LandoltC_W', 'LandoltC_E,LandoltC_E,LandoltC_N,LandoltC_W,LandoltC_S', 'LandoltC_E,LandoltC_S,LandoltC_S,LandoltC_W,LandoltC_N', 'LandoltC_N,LandoltC_W,LandoltC_N,LandoltC_S,LandoltC_E', 'LandoltC_S,LandoltC_W,LandoltC_N,LandoltC_W,LandoltC_E']
                        break;
                    case '6':
                        arrayCharacter = ['TumblingE_N,TumblingE_S,TumblingE_E,TumblingE_N,TumblingE_W', 'TumblingE_E,TumblingE_E,TumblingE_N,TumblingE_W,TumblingE_S', 'TumblingE_E,TumblingE_S,TumblingE_S,TumblingE_W,TumblingE_N', 'TumblingE_N,TumblingE_W,TumblingE_N,TumblingE_S,TumblingE_E', 'TumblingE_S,TumblingE_W,TumblingE_N,TumblingE_W,TumblingE_E', 'TumblingE_W,TumblingE_E,TumblingE_S,TumblingE_N,TumblingE_S', 'TumblingE_W,TumblingE_N,TumblingE_E,TumblingE_S,TumblingE_W', 'TumblingE_S,TumblingE_N,TumblingE_N,TumblingE_W,TumblingE_E', 'TumblingE_N,TumblingE_E,TumblingE_S,TumblingE_W,TumblingE_W', 'TumblingE_N,TumblingE_S,TumblingE_E,TumblingE_N,TumblingE_W', 'TumblingE_E,TumblingE_E,TumblingE_N,TumblingE_W,TumblingE_S', 'TumblingE_E,TumblingE_S,TumblingE_S,TumblingE_W,TumblingE_N', 'TumblingE_N,TumblingE_W,TumblingE_N,TumblingE_S,TumblingE_E', 'TumblingE_S,TumblingE_W,TumblingE_N,TumblingE_W,TumblingE_E'];
                        break;
                    case '7':
                        arrayCharacter = ['VanSloan_C,VanSloan_H,VanSloan_N,VanSloan_R,VanSloan_V', 'VanSloan_D,VanSloan_K,VanSloan_O,VanSloan_S,VanSloan_V', 'VanSloan_V,VanSloan_O,VanSloan_R,VanSloan_D,VanSloan_N', 'VanSloan_H,VanSloan_Z,VanSloan_C,VanSloan_K,VanSloan_X', 'VanSloan_O,VanSloan_K,VanSloan_V,VanSloan_H,VanSloan_D', 'VanSloan_Z,VanSloan_R,VanSloan_N,VanSloan_S,VanSloan_C', 'VanSloan_K,VanSloan_S,VanSloan_D,VanSloan_C,VanSloan_H', 'VanSloan_R,VanSloan_N,VanSloan_O,VanSloan_V,VanSloan_Z', 'VanSloan_D,VanSloan_H,VanSloan_R,VanSloan_O,VanSloan_K', 'VanSloan_C,VanSloan_N,VanSloan_Z,VanSloan_S,VanSloan_V', 'VanSloan_H,VanSloan_O,VanSloan_S,VanSloan_D,VanSloan_N', 'VanSloan_C,VanSloan_V,VanSloan_K,VanSloan_Z,VanSloan_R', 'VanSloan_D,VanSloan_H,VanSloan_R,VanSloan_N,VanSloan_O', 'VanSloan_S,VanSloan_V,VanSloan_C,VanSloan_K,VanSloan_Z'];
                        break;
                    case '8':
                        arrayCharacter = ['Shape5_0,Shape5_3,Shape5_1,Shape5_4,Shape5_2', 'Shape5_1,Shape5_2,Shape5_0,Shape5_3,Shape5_4', 'Shape5_4,Shape5_0,Shape5_2,Shape5_1,Shape5_3', 'Shape5_2,Shape5_3,Shape5_1,Shape5_4,Shape5_0', 'Shape5_1,Shape5_4,Shape5_3,Shape5_0,Shape5_2', 'Shape5_3,Shape5_0,Shape5_4,Shape5_2,Shape5_1', 'Shape5_2,Shape5_1,Shape5_0,Shape5_4,Shape5_3', 'Shape5_0,Shape5_2,Shape5_1,Shape5_3,Shape5_4', 'Shape5_3,Shape5_1,Shape5_0,Shape5_4,Shape5_2', 'Shape5_4,Shape5_0,Shape5_2,Shape5_3,Shape5_1', 'Shape5_2,Shape5_4,Shape5_3,Shape5_1,Shape5_0', 'Shape5_1,Shape5_3,Shape5_4,Shape5_0,Shape5_2', 'Shape5_0,Shape5_4,Shape5_2,Shape5_1,Shape5_3', 'Shape5_4,Shape5_1,Shape5_3,Shape5_0,Shape5_2'];
                        break;
                    case '9':
                        arrayCharacter = ['Chinese01_0,Chinese01_1,Chinese01_6,Chinese01_3,Chinese01_2', 'Chinese01_3,Chinese01_2,Chinese01_4,Chinese01_8,Chinese01_7', 'Chinese01_6,Chinese01_9,Chinese01_5,Chinese01_0,Chinese01_1', 'Chinese01_4,Chinese01_3,Chinese01_0,Chinese01_7,Chinese01_9', 'Chinese01_8,Chinese01_1,Chinese01_2,Chinese01_5,Chinese01_6', 'Chinese01_9,Chinese01_8,Chinese01_6,Chinese01_4,Chinese01_0', 'Chinese01_1,Chinese01_7,Chinese01_3,Chinese01_9,Chinese01_5', 'Chinese01_5,Chinese01_0,Chinese01_2,Chinese01_7,Chinese01_8', 'Chinese01_6,Chinese01_3,Chinese01_8,Chinese01_4,Chinese01_1', 'Chinese01_2,Chinese01_4,Chinese01_1,Chinese01_7,Chinese01_9', 'Chinese01_8,Chinese01_5,Chinese01_3,Chinese01_0,Chinese01_6', 'Chinese01_4,Chinese01_2,Chinese01_1,Chinese01_8,Chinese01_7', 'Chinese01_9,Chinese01_6,Chinese01_5,Chinese01_3,Chinese01_2', 'Chinese01_7,Chinese01_4,Chinese01_0,Chinese01_9,Chinese01_5'];
                        break;
                    case '10':
                        arrayCharacter = ['Arabic01_0,Arabic01_1,Arabic01_6,Arabic01_3,Arabic01_2', 'Arabic01_3,Arabic01_2,Arabic01_4,Arabic01_8,Arabic01_7', 'Arabic01_6,Arabic01_9,Arabic01_5,Arabic01_0,Arabic01_1', 'Arabic01_4,Arabic01_3,Arabic01_0,Arabic01_7,Arabic01_9', 'Arabic01_8,Arabic01_1,Arabic01_2,Arabic01_5,Arabic01_6', 'Arabic01_9,Arabic01_8,Arabic01_6,Arabic01_4,Arabic01_0', 'Arabic01_1,Arabic01_7,Arabic01_3,Arabic01_9,Arabic01_5', 'Arabic01_5,Arabic01_0,Arabic01_2,Arabic01_7,Arabic01_8', 'Arabic01_6,Arabic01_3,Arabic01_8,Arabic01_4,Arabic01_1', 'Arabic01_2,Arabic01_4,Arabic01_1,Arabic01_7,Arabic01_9', 'Arabic01_8,Arabic01_5,Arabic01_3,Arabic01_0,Arabic01_6', 'Arabic01_4,Arabic01_2,Arabic01_1,Arabic01_8,Arabic01_7', 'Arabic01_9,Arabic01_6,Arabic01_5,Arabic01_3,Arabic01_2', 'Arabic01_7,Arabic01_4,Arabic01_0,Arabic01_9,Arabic01_5'];
                        break;
                    case '11':
                        arrayCharacter = ['Hebrew01_2,Hebrew01_8,Hebrew01_0,Hebrew01_6,Hebrew01_4', 'Hebrew01_7,Hebrew01_1,Hebrew01_5,Hebrew01_9,Hebrew01_3', 'Hebrew01_8,Hebrew01_0,Hebrew01_2,Hebrew01_4,Hebrew01_6', 'Hebrew01_9,Hebrew01_5,Hebrew01_7,Hebrew01_3,Hebrew01_1', 'Hebrew01_6,Hebrew01_4,Hebrew01_8,Hebrew01_0,Hebrew01_2', 'Hebrew01_1,Hebrew01_3,Hebrew01_9,Hebrew01_5,Hebrew01_7', 'Hebrew01_0,Hebrew01_6,Hebrew01_4,Hebrew01_2,Hebrew01_8', 'Hebrew01_5,Hebrew01_7,Hebrew01_3,Hebrew01_1,Hebrew01_9', 'Hebrew01_4,Hebrew01_2,Hebrew01_8,Hebrew01_6,Hebrew01_0', 'Hebrew01_3,Hebrew01_9,Hebrew01_1,Hebrew01_7,Hebrew01_5', 'Hebrew01_2,Hebrew01_6,Hebrew01_0,Hebrew01_8,Hebrew01_4', 'Hebrew01_7,Hebrew01_5,Hebrew01_9,Hebrew01_1,Hebrew01_3', 'Hebrew01_8,Hebrew01_4,Hebrew01_2,Hebrew01_0,Hebrew01_6', 'Hebrew01_1,Hebrew01_5,Hebrew01_7,Hebrew01_3,Hebrew01_9'];
                        break;
                    case '12':
                        arrayCharacter = ['CrowdedHOTV01_0', 'CrowdedHOTV01_2', 'CrowdedHOTV01_3', 'CrowdedHOTV01_1', 'CrowdedHOTV01_2', 'CrowdedHOTV01_0', 'CrowdedHOTV01_1', 'CrowdedHOTV01_3', 'CrowdedHOTV01_1', 'CrowdedHOTV01_0', 'CrowdedHOTV01_2', 'CrowdedHOTV01_3', 'CrowdedHOTV01_0', 'CrowdedHOTV01_2'];
                        break;
                    case '13':
                        arrayCharacter = ['CrowdedHOTV01_0,CrowdedHOTV01_2', 'CrowdedHOTV01_2,CrowdedHOTV01_3', 'CrowdedHOTV01_3,CrowdedHOTV01_1', 'CrowdedHOTV01_1,CrowdedHOTV01_0', 'CrowdedHOTV01_2,CrowdedHOTV01_3', 'CrowdedHOTV01_0,CrowdedHOTV01_1', 'CrowdedHOTV01_1,CrowdedHOTV01_2', 'CrowdedHOTV01_3,CrowdedHOTV01_0', 'CrowdedHOTV01_1,CrowdedHOTV01_2', 'CrowdedHOTV01_0,CrowdedHOTV01_3', 'CrowdedHOTV01_2,CrowdedHOTV01_1', 'CrowdedHOTV01_3,CrowdedHOTV01_0', 'CrowdedHOTV01_0,CrowdedHOTV01_3', 'CrowdedHOTV01_2,CrowdedHOTV01_1'];
                        break;
                    case '14':
                        arrayCharacter = ['Auckland_A', 'Auckland_B', 'Auckland_C', 'Auckland_D', 'Auckland_E','Auckland_A', 'Auckland_B', 'Auckland_C', 'Auckland_D', 'Auckland_E','Auckland_A', 'Auckland_B', 'Auckland_C', 'Auckland_D'];
                        break;
                }
            }

            //reverse the order of each line if config set to Mirrored
            const localsMirrored = $('#sMirrored', this.self.shadowRoot).val()
            if (localsMirrored == 2) {
                for (let p = 0; p < arrayCharacter.length; p++) {
                    var arSplit = arrayCharacter[p].split(',');
                    arSplit.reverse();
                    var arJoined = arSplit.join(',');
                    arrayCharacter[p] = arJoined;
                }
            }
            var arrayHeight = -1, counter = 0;
            for (var i = 0; i < arrayCharacter.length; i++) {
                arrayHeight++;
                var scoreText = chartArray[arrayHeight][1]; //get score text
                var heightText = chartArray[arrayHeight][2]; //get height for character
                var marginText = heightText / 2; //get margin for character
                var splitArr = (arrayCharacter[i].length == 1) ? [arrayCharacter[i]] : arrayCharacter[i].split(',');//deal with 1 letter per line alphabets
                for (var x = 0; x < splitArr.length; x++) {
                    var alphabet = splitArr[x];
                    //set style and append svg
                    const el = $('#line-' + (i + 1), this.self.shadowRoot);
                    $('#list-character #' + alphabet, this.self.shadowRoot).clone().css({
                        height: heightText + 'mm',
                        margin: heightText + 'mm ' + marginText + 'mm',
                    }).attr({
                        id: alphabet + '_' + counter,
                    // }).appendTo('#line-' + (i + 1), this.self.shadowRoot);
                    }).appendTo(el);
                    counter++;
                }
                ;
                var attrWidth = 0;
                $('#line-' + (i + 1), this.self.shadowRoot).find('svg').each( ()  => {
                    if ($(this).find('>:first-child').is('polygon')) {
                        attrWidth = $(this).find('>:first-child').width();
                    }
                });
                if (attrWidth != 0) {
                    $('#line-' + (i + 1), this.self.shadowRoot).find('svg', this.self.shadowRoot).attr('width', attrWidth);
                }
                //set height for parent line
                $('#line-' + (i + 1), this.self.shadowRoot).css({
                    'height': heightText + 'mm',
                    'line-height': heightText + 'mm',
                    'margin': heightText / 2 + 'mm'
                });
                var parentHeight = convertFunction.ConvertPixelToMM($('#line-' + (i + 1), this.self.shadowRoot).parent().height() / 2 - 12.5);
                var scoreBoxCol = colours.optotype.replace(/[\d\.]+\)$/g, '1');

                const el = $('#line-' + (i + 1), this.self.shadowRoot);
                // CEK disabled scorebox here; look for it elsewhere.
                $('<div class="scoreBox" >' + scoreText + '</div>').insertAfter(el).css({color: scoreBoxCol});
                //add indicator lines for  6/6 and 6/12
                // if (i == 2) {
                    //$('*[data-line="'+(i+1)+'"] > .guideline').addClass('blueline');
                // }
                // if (i == 3) {
                //     $('*[data-line="' + (i + 1) + '"] > .guideline', this.self.shadowRoot).addClass('greenline');
                // }
                // if (i == 6) {
                //     $('*[data-line="' + (i + 1) + '"] > .guideline', this.self.shadowRoot).addClass('redline');
                // }

                //calculator viewport width - here we check if 5 letters plus 2 margins will fit on screen and if not,
                //chop off end letters and try again. If even one letter won't fit, don't display the line at all
                var svgBox = $('#line-' + (i + 1), this.self.shadowRoot).find('svg:first-child').width(), //get widht of line
                    svgMargin = parseFloat($('#line-' + (i + 1), this.self.shadowRoot).find('svg:first-child').css('margin-left')) * 2;
                var svgWidth = svgBox + svgMargin; //get width for each character
                var firstChartRemove = $('#line-' + (i + 1), this.self.shadowRoot).find('svg:nth-child(1)'),
                    secondChartRemove = $('#line-' + (i + 1), this.self.shadowRoot).find('svg:nth-child(2)'),
                    thirdChartRemove = $('#line-' + (i + 1), this.self.shadowRoot).find('svg:nth-child(3)'),
                    fourthChartRemove = $('#line-' + (i + 1), this.self.shadowRoot).find('svg:nth-child(4)'),
                    fifthChartRemove = $('#line-' + (i + 1), this.self.shadowRoot).find('svg:nth-child(5)');
                //allow for the scoreBox when fitting letters on lines
                // const sideBarWidth = parseFloat($('#side-bar', this.self.shadowRoot).css('width'));
                const sideBarWidth = 0;
                const letterChartViewWidth = this.viewWidth - sideBarWidth
                var lineWidth = letterChartViewWidth - 60;//60 is the width of scoreBox set in style header
                if (lineWidth >= svgWidth * 5) {
                    //console.log('5');
                    //remove dots
                    $('#line-' + (i + 1), this.self.shadowRoot).find('svg').show();
                } else if (lineWidth >= svgWidth * 4) {
                    //console.log('4');
                    //remove dots
                    $('#line-' + (i + 1), this.self.shadowRoot).find('svg').show();
                    thirdChartRemove.hide();
                } else if (lineWidth >= svgWidth * 3) {
                    //console.log('3');
                    $('#line-' + (i + 1), this.self.shadowRoot).find('svg').show();
                    secondChartRemove.hide();
                    thirdChartRemove.hide();
                } else if (lineWidth >= svgWidth * 2) {
                    //console.log('2');
                    $('#line-' + (i + 1), this.self.shadowRoot).find('svg').show();
                    secondChartRemove.hide();
                    thirdChartRemove.hide();
                    fourthChartRemove.hide();
                } else if (lineWidth >= svgWidth) {
                    //console.log('1');
                    $('#line-' + (i + 1), this.self.shadowRoot).find('svg').show();
                    secondChartRemove.hide();
                    thirdChartRemove.hide();
                    fourthChartRemove.hide();
                    fifthChartRemove.hide();
                } else {
                    //console.log('0');
                    $('#line-' + (i + 1), this.self.shadowRoot).find('svg').hide();
                    $('#line-' + (i + 1), this.self.shadowRoot).parent().find('.scoreBox').hide();
                    $('#line-' + (i + 1), this.self.shadowRoot).parent().addClass('display-none');
                }
            }
            ;

        };

        this.GenerateSingleCharts =  () =>  {
            //make all charts not class V 100% height
            const localsMirrored = $('#sMirrored', this.self.shadowRoot).val()
            var otherChart = $('#otherChart');
            otherChart.css({
                'height': this.viewHeight,
                'width': this.viewWidth,
            });
            //select svg of all the charts that aren't class V
            var charts = $('.chart:not(.V)', this.self.shadowRoot)
            var chartsSVG = charts.find('svg');
            //all single charts except animations are based on minimum element subtense equivalent to a 6/12 letter
            //get subtense of 2 arcmin calculated already for the letter charts, converted to pixels
            var elSubtense = functionConfigWolfChart.ConvertMMToPixel(chartArray[6][2] / 5);
            for (var s = 0; s < chartsSVG.length; s++) {
                var svg = chartsSVG[s];
                //svg is centred with css text-align on the chart
                var svgW = svg.viewBox.baseVal.width * elSubtense, svgH = svg.viewBox.baseVal.height * elSubtense,
                    svgX = this.viewWidth / 2 - svgW / 2, svgY = this.viewHeight / 2 - svgH / 2;
                var strTrans = 'translate(0,' + svgY + 'px)';
                if (localsMirrored == 2) {
                    strTrans += 'scale(-1,1)';
                }
                var thisChart = $('#' + chartsSVG[s].id);
                if (!thisChart.parent().hasClass('animated')) {//exclude animated charts which will be fullscreen
                    thisChart.attr({
                        'width': svgW,
                    }).css({
                        'transform': strTrans,//svg 1.0 doesn't allow transform on SVG, so only some browsers allow it
                    });
                } else {
                    thisChart.attr({
                        'width': this.viewWidth,
                        'height': this.viewHeight * 0.8,
                    }).css({
                        'transform': 'translate(0,' + this.viewHeight * 0.1 + 'px)',//but does allow css transform
                    });
                }
            }
            //update filter hues
            $('.filterGreen', this.self.shadowRoot).attr('fill', 'hsl(' + colours.fGreenHue + ',80%,60%)');
            $('.filterRed', this.self.shadowRoot).attr('fill', 'hsl(' + colours.fRedHue + ',80%,60%)');
            //put a function on each single chart that can be mapped to spacebar
            var singleCharts = $('.chart:not(.V)');
            singleCharts.each(function (idx, el) {
                var elem = $(el).find('svg');
                if (elem.length > 0) {
                    $(el).off();
                    $(el).on('click', functionConfigWolfChart.spaceBarFunc);
                }
            });
        };

        this.fullscreenChange = (ct, cht) => {

            const reConfigCharts = (ct, cht) => {
                //the new screen sizes take a few hundred milliseconds to update
                let counter = -1, oldHt = this.viewHeight,
                    looper = setInterval(() => {
                        counter++;
                        if (this.viewHeight < (oldHt - 5) || this.viewHeight > (oldHt + 5)) {
                            // viewHeight = window.innerHeight;
                            console.log('this.viewHeight: ' + this.viewHeight);
                            clearInterval(looper);
                            functionConfigWolfChart.GenerateSingleCharts();
                            functionConfigWolfChart.removeLetterChartPages();
                            $('#letterChart', this.self.shadowRoot).css('height', this.viewHeight);
                            functionConfigWolfChart.PageLetterChart();
                            functionConfigWolfChart.navCat(ct, 'fscreen');
                        } else {
                            if (counter >= 50) {
                                clearInterval(looper);
                            }
                        }

                    }, 25);
            }

            //reload the charts as we go in and out of fullscreen
            if (!document.fullscreenElement) {
                swapSVGLayers($('.fullscreen-button'));
                openFullscreen();
                reConfigCharts(ct, cht);
            } else {
                swapSVGLayers($('.fullscreen-button'));
                closeFullscreen();
                reConfigCharts(ct, cht);
            }

            function openFullscreen() {
                var docElm = document.documentElement;
                if (docElm.requestFullscreen) {
                    docElm.requestFullscreen();
                } else if (docElm.msRequestFullscreen) {
                    docElm = document.body; //overwrite the element (for IE)
                    docElm.msRequestFullscreen();
                } else if (docElm.mozRequestFullScreen) {
                    docElm.mozRequestFullScreen();
                } else if (docElm.webkitRequestFullScreen) {
                    docElm.webkitRequestFullScreen();
                }
            }

            function closeFullscreen() {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.webkitCancelFullScreen) {
                    document.webkitCancelFullScreen();
                }
            }

            function swapSVGLayers(el) {
                var layers = $(el).children('g');
                layers.each(function (idx, el) {
                    $(el).toggle();
                });
            }


        }
        this.spaceBarFunc = (e)  => {
            var el = $(e.currentTarget).children('svg')[0];
            var thisChart = objWolf[objWolf.catThis].arCharts[objWolf.chartThis];
            switch (el.id) {
                case 'rSeptumChart':
                case 'rDuoSeptumChart':
                    spaceSeptumChart(el.id);
                    break;
                case 'bFixDisp':
                    rotate90(el);
                    swapSVGLayers($('.rotate-button', this.self.shadowRoot));
                    thisChart.isToggled = !thisChart.isToggled;
                    break;
                case 'rJCCDots':
                case 'rBullseye':
                case 'bWorth4Dot':
                case 'bDPhoriaArrows':
                case 'mWhiteDot':
                    swapSVGLayers(el);
                    swapSVGLayers($('.zoom-button', this.self.shadowRoot));
                    thisChart.isToggled = !thisChart.isToggled;
                    break;
                default:
                    break;
            }

            function swapSVGLayers(el) {
                var layers = $(el).children('g');
                layers.each(function (idx, el) {
                    $(el).toggle();
                });
            }

            function rotate90(el) {
                var angle = 90, trans = $(el).css('transform');
                if (!thisChart.isToggled) {
                    trans += ' rotate(-' + angle + 'deg)';
                } else {
                    trans += ' rotate(' + angle + 'deg)';
                }
                $(el).css('transform', trans);
            }

            const spaceSeptumChart = (id) => {
                thisChart.isToggled = true;
                //bit messy next 8 lines due to the charts being designed differently
                var transXStart = [], maxTransX = 7;
                switch (id) {
                    case 'rDuoSeptumChart':
                        transXStart = [0, 0];//this is not x,y - it's x of two elements
                        maxTransX = 5;
                        break;
                    case 'rSeptumChart':
                        transXStart = [15, -3];
                        maxTransX = 7;
                        break;
                }
                var buttonLayers = $('.interspace-button', this.self.shadowRoot).find('g');
                $(buttonLayers[0]).hide();
                $(buttonLayers[1]).show();
                var LGroup = $('#' + id + ' .LGroup'), RGroup = $('#' + id + ' .RGroup');
                var trans = [RGroup.attr('transform'), LGroup.attr('transform')], transX = [];
                trans.forEach(function (el, idx) {
                    transX[idx] = getXTrans(el);
                });
                if (transX[0] == (transXStart[0] + maxTransX)) {
                    transX = transXStart;
                    thisChart.isToggled = false;
                    swapSVGLayers($('.interspace-button'));
                }
                RGroup.attr('transform', 'translate(' + (transX[0] + 1) + ',0)');
                LGroup.attr('transform', 'translate(' + (transX[1] - 1) + ',0)');

                function getXTrans(str) {
                    var temp = str.substring(
                        str.lastIndexOf("(") + 1,
                        str.lastIndexOf(",")
                    );
                    return parseInt(temp);
                }

            }
        }
        this.YatesShuffle = (array) => {
            for (var i = array.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * i); // no +1 here!
                var temp = array[i];
                array[i] = array[j];
                array[j] = temp;
            }
            return array;
        }

        this.shuffleLetters = () => {
            console.log("shuffleLetters")
            if (objWolf.catThis == 0) {
                //check if letters are displayed in a column or singled
                var colCheck = $('.in-a-column, .disable', this.self.shadowRoot);
                //if not, shuffle, else do nothing
                if (colCheck.length == 0) {
                    var functionConfigWolfChart = this;
                    functionConfigWolfChart.swapSVGLayers($('.shuffle-button', this.self.shadowRoot));
                    if (!objWolf.isShuffled) {
                        const charLines = $('.char-line', this.self.shadowRoot)
                        $(charLines).each( (index) =>  {
                            // var parent = $(this);
                            var parent = charLines[index].parentElement;
                            var arVisible = $(parent).find('svg:not([style*="display: none"])');
                            //count how many letters are visible
                            var lineLength = arVisible.length;
                            //hide all the letters
                            let arAlphabet = $(parent).find('svg.optotype-symbol').hide();
                                //shuffle them
                            const arAlphabetShuffled = functionConfigWolfChart.YatesShuffle(arAlphabet);
                            //append shuffled letters to the number in the pre-shuffled line
                            for (let i = 0; i < lineLength; i++) {
                                $(arAlphabetShuffled[i]).appendTo(parent).show();

                            }
                            $('#sUnshuffled', this.self.shadowRoot).attr('display', 'block');
                            $('#sShuffled', this.self.shadowRoot).attr('display', 'none');
                        });
                    } else {
                        functionConfigWolfChart.UnShuffleFunction(oldCharacter);
                        $('#sUnshuffled', this.self.shadowRoot).attr('display', 'none');
                        $('#sShuffled', this.self.shadowRoot).attr('display', 'block');
                    }
                    objWolf.isShuffled = !objWolf.isShuffled;
                }
            }
        }

        this.UnShuffleFunction = (oldCharacter) =>  {
            for (let i = 0; i < oldCharacter.length; i++) {
                var id = oldCharacter[i][0],
                    svg = oldCharacter[i][1];
                var dataLine = $('.chart.V', this.self.shadowRoot).find('>div[data-line=' + id + ']').html(svg);
            }
        };

        this.duoBGFunction = () =>  {
            //only activate if not letter or column masked
            if (!objWolf.isMasked) {
                if (objWolf.catThis == 0) {
                    $('#letterChart, .char-line', this.self.shadowRoot).toggleClass('duo');
                    objWolf.isDuo = !objWolf.isDuo;
                    functionConfigWolfChart.swapSVGLayers($('.bg-button'));
                    if (objWolf.isDuo) {
                        $('.guideline', this.self.shadowRoot).hide();
                    } else {
                        if (!objWolf.isMasked)
                            $('.guideline', this.self.shadowRoot).show();
                    }
                }
            }
        };
        this.swapSVGLayers = (el) =>  {
            var layers = $(el).children('g');
            layers.each(function (idx, el) {
                $(el).toggle();
            });
        }

        this.letterMorph = () =>  {
            var arPolygons = $('#list-character .optotype-symbol[id^=Snellen_] polygon', this.self.shadowRoot), maxLen = 0, counter = 0;
            var interval = arPolygons.length * 1350;
            var hue = 0;
            //find the max length the polygon points array
            for (var a = 0; a < arPolygons.length; a++) {
                var len = arPolygons[a].points.length
                if (len > maxLen) {
                    maxLen = len;
                }
            }
            //make all the polygon points arrays the same length
            for (var b = 0; b < arPolygons.length; b++) {
                var len = maxLen - arPolygons[b].points.length, ar = [];
                if (arPolygons[b].points.length < 12) {
                    for (var d = 0; d < len; d++) {
                        var dummyPt = document.getElementById("mLetterMorph").createSVGPoint({
                            x: 0,
                            y: 0,
                        })
                        arPolygons[b].points.appendItem(dummyPt);
                    }
                }
            }
            //make animations between each polygon
            var starter = setTimeout(() => {
                newLetterMorph();
            }, 1000);
            var timer = setInterval(() => {
                newLetterMorph();
            }, (interval + 1000));
            var timer2 = setInterval(() => {
                hue = Math.random() * 360;
                $('#SVGLetter', this.self.shadowRoot).attr({
                    fill: 'hsl(' + hue + ',50%,50%)',
                })

            }, 450);

            function newLetterMorph() {
                arPolygons = functionConfigWolfChart.YatesShuffle(arPolygons);
                var newTarget = $('#mLetterMorph', this.self.shadowRoot).clone();
                newTarget.find('#SVGLetter :not(:first-child)').remove();
                makeAnimations(newTarget.find('#SVGLetter'));
                $('#mLetterMorph', this.self.shadowRoot).replaceWith(newTarget);

            }

            function makeAnimations(targetPolygon) {
                targetPolygon.find('#morph0').attr({
                    from: $(arPolygons[0]).attr('points'),
                    to: $(arPolygons[1]).attr('points'),
                });
                for (var e = 1; e < arPolygons.length; e++) {
                    var animId = "morph" + (e - 1);
                    targetPolygon.find('#morph0').clone().attr({
                        id: "morph" + e,
                        begin: animId + ".end +1s",
                        from: $(arPolygons[e]).attr('points'),
                        to: $(arPolygons[e + 1]).attr('points'),
                    }).appendTo(targetPolygon);
                }
                var lastAnim = $(targetPolygon).find(':last-child');
                lastAnim.attr({
                    to: $(arPolygons[0]).attr('points'),
                })
                //console.log(targetPolygon);
            }

        }

        this.ShortCutKey = (pageUp, pageDown, pageLeft, pageRight, shuffle, duoBG) => {
            document.body.onkeyup =  (e) => {
                //disable shortcuts if setting bar is active
                if (!$('#setting-bar', this.self.shadowRoot).hasClass('active')) {
                    //exclude the ctrl key wherever a letter is the keycode, but not the arrows
                    if (pageUp != "") {
                        if (e.keyCode == pageUp && e.ctrlKey == false) {
                            functionConfigWolfChart.scrollChart(objWolf.catThis, objWolf.chartU(), 'top');
                        }
                        ;
                    }
                    ;
                    if (pageDown != "") {
                        if (e.keyCode == pageDown && e.ctrlKey == false) {
                            functionConfigWolfChart.scrollChart(objWolf.catThis, objWolf.chartD(), 'bottom');
                        }
                        ;
                    }
                    ;
                    if (pageLeft != "") {
                        if (e.keyCode == pageLeft && e.ctrlKey == false) {
                            functionConfigWolfChart.navCat(objWolf.catLeft(), 'left');
                        }
                        ;
                    }
                    ;
                    if (pageRight != "") {
                        if (e.keyCode == pageRight && e.ctrlKey == false) {
                            functionConfigWolfChart.navCat(objWolf.catRight(), 'right');
                        }
                        ;
                    }
                    ;
                    if (e.keyCode == 38) {
                        e.preventDefault();
                        functionConfigWolfChart.scrollChart(objWolf.catThis, objWolf.chartU(), 'top');
                    }
                    ;
                    if (e.keyCode == 40) {
                        e.preventDefault();
                        functionConfigWolfChart.scrollChart(objWolf.catThis, objWolf.chartD(), 'bottom');
                    }
                    ;
                    if (e.keyCode == 37) {
                        e.preventDefault();
                        functionConfigWolfChart.navCat(objWolf.catLeft(), 'left');
                    }
                    ;
                    if (e.keyCode == 39) {
                        e.preventDefault();
                        functionConfigWolfChart.navCat(objWolf.catRight(), 'right');
                    }
                    ;
                    if (e.keyCode == 86 && e.ctrlKey == false) {
                        e.preventDefault();
                        functionConfigWolfChart.navCat(0, 'fav');
                    }
                    ;
                    if (e.keyCode == 82 && e.ctrlKey == false) {
                        e.preventDefault();
                        functionConfigWolfChart.navCat(1, 'fav');
                    }
                    ;
                    if (e.keyCode == 66 && e.ctrlKey == false) {
                        e.preventDefault();
                        functionConfigWolfChart.navCat(2, 'fav');
                    }
                    ;
                    if (e.keyCode == 77 && e.ctrlKey == false) {
                        e.preventDefault();
                        functionConfigWolfChart.navCat(3, 'fav');
                    }
                    ;
                    if (e.key === ' ' || e.key === 'Spacebar') {
                        e.preventDefault();
                        $("#" + objWolf.chartThisId).trigger('click');
                    }
                    // F key for full screen
                    if (e.keyCode == 70) {
                        e.preventDefault();
                        functionConfigWolfChart.fullscreenChange(objWolf.catThis, objWolf.chartThis);
                    }
                    ;
                    if (shuffle != "") {
                        if (e.keyCode == shuffle && e.ctrlKey == false) {
                            e.preventDefault();
                            functionConfigWolfChart.shuffleLetters();
                        }

                    }
                    ;
                    if (duoBG != "") {
                        if (e.keyCode == duoBG && e.ctrlKey == false) {
                            e.preventDefault();
                            functionConfigWolfChart.duoBGFunction();
                        }
                        ;
                    }
                    ;
                }
            };//end of onkeyup
        };
        this.ValidateFunction = function () {
            var result = false,
                resultDistance, resultLength;
            var validateFunction = this;
            $('#iDistance', this.self.shadowRoot).on('change', () => {
                resultDistance = validateFunction.ValidateDistance();
            });
            $('#iLengOfLine', this.self.shadowRoot).on('change', () =>  {
                resultLength = validateFunction.ValidateLengOfLine();
            });
            if (resultDistance || resultLength) {
                result = true;
            }
            return result;
        };
        this.ValidateDistance = function () {
            var result = false,
                message = "",
                distance = $('#iDistance', this.self.shadowRoot).val();
            $('.errorDistance', this.self.shadowRoot).remove();
            if (distance == "") {
                result = true;
                message = "Distance is required.";
            } else if (distance != parseInt(distance, 10)) {
                result = true;
                message = "Distance must be integer.";
            } else if (distance < 3000) {
                result = true;
                message = "Distance must be greater than or equal to 3000.";
            }
            if (result) {
                $('#iDistance', this.self.shadowRoot).parent().append('<span class="errorMsg errorDistance">' + message + '</span>');
                $('#updateSetting', this.self.shadowRoot).removeClass('disabled-btn').addClass('disabled-btn');
            }
            return result;
        };
        this.ValidateLengOfLine = function () {
            var result = false,
                message = "",
                lengOfLine = $('#iLengOfLine', this.self.shadowRoot).val();
            $('.errorLenghtLine', this.self.shadowRoot).remove();
            if (lengOfLine == "") {
                result = true;
                message = "Length of line below is required.";
            } else if (isNaN(lengOfLine)) {
                result = true;
                message = "Length of line below must be numbered.";
            } else if (parseFloat(lengOfLine) < 25 || parseFloat(lengOfLine) > 250) {
                result = true;
                message = "The length of line must be between 25 and 250.";
            }
            if (result) {
                $('#iLengOfLine', this.self.shadowRoot).parent().append('<span class="errorMsg errorLenghtLine">' + message + '</span>');
                $('#updateSetting', this.self.shadowRoot).removeClass('disabled-btn').addClass('disabled-btn');
            }
            return result;
        };
        this.ValidateDuplicateKey = function (element) {
            $('.errorShortKey', this.self.shadowRoot).remove();
            var arr = $('.js-shortkey', this.self.shadowRoot).map(function () {
                return this.value; // $(this).val()
            }).get();
            //reserve the shortcut keys for chart categories and fullscreen
            arr = [...arr, 'v', 'r', 'b', 'm', 'f'];

            function countInArray(array, what) {
                return array.filter(item => item == what).length;
            }

            var result = false;
            var currentVal = $(element).val();
            if (currentVal.trim() != "") {
                if (countInArray(arr, currentVal) > 1) {
                    result = true;
                }
            }
            if (result) {
                $(element).parent().append('<span class="errorMsg errorShortKey">ShortKey ' + currentVal + ' is duplicate, or is reserved for another function. Please try again.</span>');
                $(element).val("");
            } else {
                $(element).parent().find('.errorShortKey').remove();
            }
            return result;
        };
        this.SetLocalStorage = function () {

            let notation = $('#sNotation', this.self.shadowRoot).val(),
                localOptotype = $('#sOptotype', this.self.shadowRoot).val(),
                localsMirrored = $('#sMirrored', this.self.shadowRoot).val(),
                localDistance = $('#iDistance', this.self.shadowRoot).val().trim(),
                numeratorType = $('#sNumerator', this.self.shadowRoot).val(),
                alphabetType = $('#sAlphabet', this.self.shadowRoot).val()
            // shortcuts[0] = $('#pageUp', this.self.shadowRoot).val().trim(),
            //     shortcuts[1] = $('#pageDown', this.self.shadowRoot).val().trim(),
            //     shortcuts[2] = $('#pageLeft', this.self.shadowRoot).val().trim(),
            //     shortcuts[3] = $('#pageRight', this.self.shadowRoot).val().trim(),
            //     shortcuts[4] = $('#shuffle', this.self.shadowRoot).val().trim(),
            //     shortcuts[5] = $('#duoBG', this.self.shadowRoot).val().trim()
            let lenghOfline = $('#iLengOfLine', this.self.shadowRoot).val().trim(),
                displayOrder = $('#display', this.self.shadowRoot).val()

            localStorage.setItem("Ver", this.ver);
            localStorage.setItem("Optotype", localOptotype);
            localStorage.setItem("Alphabet", alphabetType);
            localStorage.setItem("Notation", notation);
            localStorage.setItem("Numerator", numeratorType);
            localStorage.setItem("Distance", localDistance);
            localStorage.setItem("LengthOfLine", lenghOfline);
            localStorage.setItem("DisplayOptions", displayOrder);
            localStorage.setItem("DisplayWidth", this.viewWidth);
            localStorage.setItem("Mirrored", localsMirrored);
            localStorage.setItem("Colours", JSON.stringify(colours));
            localStorage.setItem("ObjWolf", JSON.stringify(objWolf));
            localStorage.setItem("Shortcuts", JSON.stringify(shortcuts));
        };
        this.SetScoreBoxFont = function () {
            //reduce font size of scoreBox from that set in css
            //if Notation is Feet, or is Metres and Numerator is Actual
            //other Notations have no numerator so are max 4 chars
            if (notation == 2 || (notation == 1 && numeratorType == 1)) {
                $('.scoreBox', this.self.shadowRoot).css({
                    'font-size': '4mm',
                });
            }
        }
        //reverse the characters for mirrored display. The order of characters is also reversed at the point where
        //the lines are built from the arrayCharacter variable above
        this.SetDirectCharacter = function (localsMirrored) {
            if (localsMirrored == "2") {
                $('#letterChart svg', this.self.shadowRoot).css('transform', 'rotateY(180deg)');
            } else {
                $('#letterChart svg', this.self.shadowRoot).css('transform', 'rotateY(0deg)');
            }
        };
        this.ResetValueToDefault = function () {
            var setConfigDefault = this;
            $('#reset', this.self.shadowRoot).on('click', ()=> {
                setConfigDefault.SetConfigDefault();
                //set variable for local storage
                let notation = $('#sNotation', this.self.shadowRoot).val(),
                    localOptotype = $('#sOptotype', this.self.shadowRoot).val(),
                    localsMirrored = $('#sMirrored', this.self.shadowRoot).val(),
                    localDistance = $('#iDistance', this.self.shadowRoot).val().trim(),
                    numeratorType = $('#sNumerator', this.self.shadowRoot).val(),
                    alphabetType = $('#sAlphabet', this.self.shadowRoot).val()
                    shortcuts[0] = $('#pageUp', this.self.shadowRoot).val().trim(),
                    shortcuts[1] = $('#pageDown', this.self.shadowRoot).val().trim(),
                    shortcuts[2] = $('#pageLeft', this.self.shadowRoot).val().trim(),
                    shortcuts[3] = $('#pageRight', this.self.shadowRoot).val().trim(),
                    shortcuts[4] = $('#shuffle', this.self.shadowRoot).val().trim(),
                    shortcuts[5] = $('#duoBG', this.self.shadowRoot).val().trim()
                    let lenghOfline = $('#iLengOfLine', this.self.shadowRoot).val().trim(),
                    displayOrder = $('#display', this.self.shadowRoot).val()
                    setConfigDefault.SetLocalStorage();
                $('#letterChart > div', this.self.shadowRoot).find('.char-line').html('');
                $('#letterChart > div', this.self.shadowRoot).find('.scoreBox').remove();
                $('#updateSetting', this.self.shadowRoot).removeClass('disabled-btn').addClass('disabled-btn');
                setConfigDefault.removeLetterChartPages();
                $('.char-line', this.self.shadowRoot).removeAttr('style');
                configBar.init();
            });
        };
        /**
         * let gOptotype = "3",
         * gAlphabet = "5",
         * gDisplayOptions = "2",
         * @constructor
         */
        this.GetConfigByValueHardCoded = function () {
            let gOptotype = "11",
                gAlphabet = "14",
                gNotation = "2",
                gNumerator = "2",
                gDistance = "3000",
                gLengthOfLine = "100",
                gDisplayOptions = "2",
                gDisplayWidth = "939",
                gDisplayHeight = null,
                gMirrored = "2"
            const gColours = JSON.parse('{"optotype":"rgba(0,0,0,1)","backgrounds":{"optotype":"rgba(255,255,255,1)","binocular":""},"fRedHue":"360","fGreenHue":"160","themes":{"R":"rgb(174,39,96)","B":"rgb(104,154,104)","M":"rgb(214, 116, 10)"}}'),
                objWolf = JSON.parse('{"0":{"cat":"V","title":"VA","col":"rgb(0,0,0)","lastUsed":0,"mostUsed":0,"arCharts":[{"id":"V0","useCount":0,"isToggled":false},{"id":"V1","useCount":0,"isToggled":false},{"id":"V2","useCount":0,"isToggled":false}]},"1":{"cat":"R","title":"Refraction","col":"rgb(174,39,96)","lastUsed":0,"mostUsed":0,"arCharts":[{"id":"R0","useCount":0,"isToggled":false},{"id":"R1","useCount":0,"isToggled":false},{"id":"R2","useCount":0,"isToggled":false},{"id":"R3","useCount":0,"isToggled":false},{"id":"R4","useCount":0,"isToggled":false},{"id":"R5","useCount":0,"isToggled":false}]},"2":{"cat":"B","title":"Binocular","col":"rgb(104,154,104)","lastUsed":0,"mostUsed":0,"arCharts":[{"id":"B0","useCount":0,"isToggled":false},{"id":"B1","useCount":0,"isToggled":false},{"id":"B2","useCount":0,"isToggled":false},{"id":"B3","useCount":0,"isToggled":false},{"id":"B4","useCount":0,"isToggled":false},{"id":"B5","useCount":0,"isToggled":false}]},"3":{"cat":"M","title":"Misc.","col":"rgb(214, 116, 10)","lastUsed":0,"mostUsed":0,"arCharts":[{"id":"M0","useCount":0,"isToggled":false},{"id":"M1","useCount":0,"isToggled":false},{"id":"M2","useCount":0,"isToggled":false},{"id":"M3","useCount":0,"isToggled":false}]},"dateCreated":1708320131426,"useCountTimer":null,"catsLength":4,"catThis":0,"chartThis":0,"chartThisId":"V0","isMasked":false,"hasSBFunc":[["rJCCDots","zoom"],["rBullseye","zoom"],["rSeptumChart","interspace"],["rDuoSeptumChart","interspace"],["bFixDisp","rotate"],["bWorth4Dot","zoom"],["bDPhoriaArrows","rotate"],["mWhiteDot","zoom"]],"pointer":0,"animIn":"","animOut":""}'),
                gShortcuts = JSON.parse('["u","n","g","k","q","z"]');
            //set value for input
            $('#sOptotype', this.self.shadowRoot).val(gOptotype).change();
            $('#sAlphabet', this.self.shadowRoot).val(gAlphabet);
            $('#sNotation', this.self.shadowRoot).val(gNotation);
            $('#sNumerator', this.self.shadowRoot).val(gNumerator);
            $('#iDistance', this.self.shadowRoot).val(gDistance);
            $('#iLengOfLine', this.self.shadowRoot).val(gLengthOfLine);
            $('#display', this.self.shadowRoot).val(gDisplayOptions);
            $('#sMirrored', this.self.shadowRoot).val(gMirrored);
            $('#tOptoColour', this.self.shadowRoot).val(gColours.optotype);
            $('#tBgColour', this.self.shadowRoot).val(gColours.backgrounds.optotype);
            $('#sliderRed', this.self.shadowRoot).val(gColours.fRedHue);
            $('#sliderGreen', this.self.shadowRoot).val(gColours.fGreenHue);
            $('#pageUp', this.self.shadowRoot).val(gShortcuts[0]);
            $('#pageDown', this.self.shadowRoot).val(gShortcuts[1]);
            $('#pageLeft', this.self.shadowRoot).val(gShortcuts[2]);
            $('#pageRight', this.self.shadowRoot).val(gShortcuts[3]);
            $('#shuffle', this.self.shadowRoot).val(gShortcuts[4]);
            $('#duoBG', this.self.shadowRoot).val(gShortcuts[5]);
        };
        this.GetConfigByValue =  () => {
            var gOptotype = localStorage.getItem("Optotype"),
                gAlphabet = localStorage.getItem("Alphabet"),
                gNotation = localStorage.getItem("Notation"),
                gNumerator = localStorage.getItem("Numerator"),
                gDistance = localStorage.getItem("Distance"),
                gLengthOfLine = localStorage.getItem("LengthOfLine"),
                gDisplayOptions = localStorage.getItem("DisplayOptions"),
                gDisplayWidth = localStorage.getItem("DisplayWidth"),
                gDisplayHeight = localStorage.getItem("DisplayHeight"),
                gMirrored = localStorage.getItem("Mirrored"),
                gColours = JSON.parse(localStorage.getItem("Colours")),
                objWolf = JSON.parse(localStorage.getItem("ObjWolf")),
                gShortcuts = JSON.parse(localStorage.getItem("Shortcuts"));
            //set value for input
            $('#sOptotype', this.self.shadowRoot).val(gOptotype).change();
            $('#sAlphabet', this.self.shadowRoot).val(gAlphabet);
            $('#sNotation', this.self.shadowRoot).val(gNotation);
            $('#sNumerator', this.self.shadowRoot).val(gNumerator);
            $('#iDistance', this.self.shadowRoot).val(gDistance);
            $('#iLengOfLine', this.self.shadowRoot).val(gLengthOfLine);
            $('#display', this.self.shadowRoot).val(gDisplayOptions);
            $('#sMirrored', this.self.shadowRoot).val(gMirrored);
            $('#tOptoColour', this.self.shadowRoot).val(gColours.optotype);
            $('#tBgColour', this.self.shadowRoot).val(gColours.backgrounds.optotype);
            $('#sliderRed', this.self.shadowRoot).val(gColours.fRedHue);
            $('#sliderGreen', this.self.shadowRoot).val(gColours.fGreenHue);
            $('#pageUp', this.self.shadowRoot).val(gShortcuts[0]);
            $('#pageDown', this.self.shadowRoot).val(gShortcuts[1]);
            $('#pageLeft', this.self.shadowRoot).val(gShortcuts[2]);
            $('#pageRight', this.self.shadowRoot).val(gShortcuts[3]);
            $('#shuffle', this.self.shadowRoot).val(gShortcuts[4]);
            $('#duoBG', this.self.shadowRoot).val(gShortcuts[5]);
        };
        this.SetConfigDefault = function () {
            //set value for input
            $('#sOptotype', this.self.shadowRoot).val("1").change();
            $('#sAlphabet', this.self.shadowRoot).val("2");
            $('#sNotation', this.self.shadowRoot).val("1");
            $('#sNumerator', this.self.shadowRoot).val("2");
            $('#display', this.self.shadowRoot).val('2');
            $('#sMirrored', this.self.shadowRoot).val('2');
            $('#sMirrored', this.self.shadowRoot).val('2');
            $('#sMirrored', this.self.shadowRoot).val('2');
            $('#iDistance', this.self.shadowRoot).val('3000');
            $('#iLengOfLine', this.self.shadowRoot).val('100');
            colours = {
                optotype: 'rgba(0,0,0,1)',
                backgrounds: {
                    optotype: 'rgba(255,255,255,1)',
                    binocular: 'hsl(0,0%,60%)',
                },
                fRedHue: '360',
                fGreenHue: '160',
                themes: {
                    R: 'rgb(174,39,96)',
                    B: 'rgb(154,204,154)',
                    M: 'rgb(214, 116, 10)',
                },
            }
            $('#tOptoColour', this.self.shadowRoot).val(colours.optotype).siblings('i').css('background-color', colours.optotype);
            $('#tBgColour', this.self.shadowRoot).val(colours.backgrounds.optotype).siblings('i').css('background-color', colours.backgrounds.optotype);
            $('#sliderRed', this.self.shadowRoot).val(colours.fRedHue).css('background', 'hsl(' + colours.fRedHue + ',80%,60%)');
            $('#sliderGreen', this.self.shadowRoot).val(colours.fGreenHue).css('background', 'hsl(' + colours.fGreenHue + ',80%,60%)');
            $('#iDistance', this.self.shadowRoot).val('');
            $('#iLengOfLine', this.self.shadowRoot).val('');
            shortcuts = ['u', 'n', 'g', 'k', 'q', 'z'];
            $('#pageUp', this.self.shadowRoot).val(shortcuts[0]);
            $('#pageDown', this.self.shadowRoot).val(shortcuts[1]);
            $('#pageLeft', this.self.shadowRoot).val(shortcuts[2]);
            $('#pageRight', this.self.shadowRoot).val(shortcuts[3]);
            $('#shuffle', this.self.shadowRoot).val(shortcuts[4]);
            $('#duoBG', this.self.shadowRoot).val(shortcuts[5]);
        };
        this.UpdateVersion = function (version) {
            //returns true if an upgrade is required, false if not
            var majVer = Math.floor(version), minVer = (version - majVer) * 10;
            //upgrade from 1.x to 2.x and above. Prior to v2.0 localStorage had no "Ver" value
            if (version === null) {
                //create new storage items
                localStorage.setItem("Ver", JSON.stringify(version));
                //convert old storage items
                var reserved = ['v', 'r', 'b', 'm'], oldShortcuts = [], banned = "", errMess = "";
                oldShortcuts[0] = localStorage.getItem("PageUp");
                oldShortcuts[1] = localStorage.getItem("PageDown");
                oldShortcuts[4] = localStorage.getItem("Shuffle");
                oldShortcuts[5] = localStorage.getItem("duoBG");
                oldShortcuts.forEach(function (val, idx) {
                    if (reserved.includes(val)) {
                        shortcuts[idx] = "";
                        errMess = "Warning:\nOne or more of your keyboard shortcuts will no longer work, as it is now reserved for something else. Please assign new shortcut(s) at the bottom of the config menu";
                    } else {
                        shortcuts[idx] = val;
                    }
                });
                colours.optotype = localStorage.getItem("TextColor");
                colours.backgrounds.optotype = localStorage.getItem("BgColor");
                localStorage.setItem("Colours", JSON.stringify(colours));
                localStorage.setItem("Shortcuts", JSON.stringify(shortcuts));
                //destroy no longer needed items
                localStorage.removeItem("PageUp");
                localStorage.removeItem("PageDown");
                localStorage.removeItem("Shuffle");
                localStorage.removeItem("Unshuffle");
                localStorage.removeItem("duoBG");
                localStorage.removeItem("TextColor");
                localStorage.removeItem("BgColor");
                //alert
                var alertMess = "You have updated to WolfChart " + majVer + ". Please take a moment to review your settings."
                if (errMess != "") {
                    alert(alertMess + "\n" + errMess);
                } else {
                    alert(alertMess);
                }
                return true;
            }//end of upgrade from version 1.x
            else {
                if (majVer == 2) {
                    var oldVer = JSON.parse(localStorage.getItem("Ver"));
                    var oldMajVer = Math.floor(oldVer), oldMinVer = Math.round((oldVer - oldMajVer) * 10);
                    if (oldMinVer < 4) {
                        //optotype background colour rgb not rgba
                        var regExp = /\(([^)]+)\)/g;  // get the values within () of optotype backgroud colour
                        var storedCols = JSON.parse(localStorage.getItem("Colours"));
                        var matches = regExp.exec(storedCols.backgrounds.optotype);
                        var splits = matches[1].split(',');
                        var newBgCol = 'rgb(' + splits[0] + ',' + splits[1] + ',' + splits[2] + ')';
                        storedCols.backgrounds.optotype = newBgCol;
                        localStorage.setItem("Colours", JSON.stringify(storedCols));
                        //$('#tBgColour', this.self.shadowRoot).val(newBgCol).siblings('i').css('background-color',newBgCol);

                        var alertMess2_4 = "You have updated to WolfChart " + version + ". Please take a moment to review your settings."
                        alert(alertMess2_4);
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }

            }

        }

        this.ConvertPixelToMM = function (pixel) {
            var dpi = $("#dpi", this.self.shadowRoot).offsetHeight;
            return (pixel * 25.4) / dpi
        };
        this.ConvertMMToPixel = function (mm) {
            var dpi = $("#dpi", this.self.shadowRoot).offsetHeight;
            return (mm * dpi) / 25.4
        };
        this.removeLetterChartPages = function () {
            let unloaded = $('.character-line');
            for (let i = 1; i <= unloaded.length; i++) {
                let el = $('#letterChart', this.self.shadowRoot)
                $('*[data-line="' + i + '"]', this.self.shadowRoot).detach().appendTo(el);
            }
            $('.V', this.self.shadowRoot).remove();
        };
        this.PageLetterChart = () => {
            //#letterChart has been filled with lines of letters from smallest to largest but they are not in pages
            //Page the character lines from smallest to largest so each page fits on screen
            if (objWolf.chartThis) {
                objWolf.chartThis = null
            }
            const displayOrder = $('#display', this.self.shadowRoot).val();
            //not sure what this does, but may implement a chartThis in localStorage so that when you reload you are back on same page
            var characterLines = $('.character-line', this.self.shadowRoot), cumHt = 0, numLines = 0, pageNum = 0;//get the character-line DOM elements but then try to use mostly native js
            var arPages = [[]];//this 2-dim array will hold the page tree
            for (let i = 0; i < characterLines.length; i++) {
                // let ht = characterLines[i].clientHeight;
                // if (ht > 0 && ht <= this.viewHeight) {
                //     cumHt = cumHt + ht;
                //     if (cumHt <= this.viewHeight) {
                //         arPages[pageNum].push([characterLines[i]]);
                //     } else {
                //         cumHt = ht;
                //         pageNum++;
                //         arPages[pageNum] = [];
                //         arPages[pageNum].push([characterLines[i]]);
                //     }
                // } else {
                //     characterLines[i].remove();
                // }
                if (numLines < 1) {
                    arPages[pageNum].push([characterLines[i]]);
                } else {
                    pageNum++;
                    arPages[pageNum] = [];
                    arPages[pageNum].push([characterLines[i]]);
                }
                numLines++;

            }
            //---Display Order-----
            //Largest at top of each page. First displayed page is handled when scrollChart() is called
            if (displayOrder === "1" || displayOrder === "2") {
                //just need to reverse order of lines on each page
                for (let j = 0; j < arPages.length; j++) {
                    arPages[j].reverse();
                }
            } else {//Monoyer means smallest at top of each page, and page of smallest lines is highest numbered page
                arPages.reverse();
            }
            //create a div for each page and populate each page with character-lines
            arPages.forEach( (page, idx) => {
                const letterchart = $('#letterChart', this.self.shadowRoot);
                $('<div class="chart V" id="V' + idx + '"></div>', this.self.shadowRoot).css('display', 'none').appendTo(letterchart);
                page.forEach( (el, idx) =>  {
                    $(el).detach().appendTo($(letterchart).find('.V:last'));
                });
            });
        }

        this.loadCharts = ()=>  {
            var allCharts = $('.chart', this.self.shadowRoot), arTemp = [], counter = 0;
            //quick and dirty way to make unique categories
            allCharts.each( (idx, el) => {
                var category = el.id.substr(0, 1);
                arTemp[category] = 0;
            });
            //populate objWolf with numbered chart categories
            //each with all the charts of that class,
            //each chart with initial use count of 0
            //and some other useful properties
            for (var key in arTemp) {
                if (arTemp.hasOwnProperty(key)) {
                    objWolf[counter] = {cat: key, title: "", col: "", lastUsed: 0, mostUsed: 0, arCharts: []};
                    counter++;
                    objWolf.catsLength++;
                }
            }
            //add properties for each category
            var themeColours = colours.themes;

            for (let q = 0; q < objWolf.catsLength; q++) {
                var thing = objWolf[q];
                thing.col = "rgb(127,127,127)";
                if (thing.cat == "V") {
                    thing.title = "VA";
                    thing.col = "rgb(0,0,0)";
                }
                switch (thing.cat) {
                    case 'R':
                        thing.title = "Refraction";
                        thing.col = themeColours.R;
                        break;
                    case 'B':
                        thing.title = "Binocular";
                        thing.col = themeColours.B;
                        break;
                    case 'M':
                        thing.title = "Misc.";
                        thing.col = themeColours.M;
                }
                //add charts to each category in objWolf
                var catCharts = $('.' + thing.cat, this.self.shadowRoot);
                catCharts.each(function (idx, el) {
                    thing.arCharts[idx] = {id: el.id, useCount: 0, isToggled: false};
                });

            }
        }
        this.characterClick = function () {
            $(document).on('click', '.optotype-symbol', function () {
                var characterSVG = $('.char-line .optotype-symbol'), el = $(this);
                if (el.hasClass('in-a-column')) {
                    //show all letters
                    characterSVG.attr('class', 'optotype-symbol');
                    if (!objWolf.isDuo) {
                        $('.guideline', this.self.shadowRoot).show();
                        objWolf.isMasked = false;
                    }
                } else if (el.hasClass('active')) {
                    //show a column of letters containing this one
                    el.removeClass('active');
                    $('.guideline', this.self.shadowRoot).hide();
                    var lines = $('.char-line', this.self.shadowRoot).each(function (idx, elem) {
                        var b = objWolf.pointer;
                        $(elem).find('.optotype-symbol').each(function (idx, elem) {
                            if (idx == b) {
                                $(elem).addClass('in-a-column');
                                $(elem).removeClass('disable');

                            }
                        });

                    });
                    objWolf.isMasked = true;
                } else {
                    //show only the letter clicked
                    el.addClass('active');
                    characterSVG.addClass('disable');
                    el.removeClass('disable');
                    $('.guideline', this.self.shadowRoot).hide();
                    //find the position of the clicked letter along the line
                    var parent = this.parentNode, callBack = this, pos = "";
                    $('#' + parent.id, this.self.shadowRoot).find('.optotype-symbol').each( (idx, elem) =>  {
                        if (elem.id == callBack.id) {
                            objWolf.pointer = idx;
                        }
                    });
                    objWolf.isMasked = true;
                }
            });
        };
        this.scoreBoxClick = () => {
            $(document).on('click', '.scoreBox', () => {
                var clicked = $(this), lineSVG = "", characterLine = $('.character-line .char-line'),
                    characterSVG = $('.char-line .optotype-symbol');
                if (clicked[0].getAttribute('class') == "scoreBox") {
                    lineSVG = $(this).prev();
                } else {
                    lineSVG = clicked.parent();
                }
                var activeElems = lineSVG.parent().find('.scoreBox')
                if (clicked.hasClass('active')) {
                    activeElems.removeClass('active');
                    characterLine.css('visibility', 'visible')
                    characterSVG.removeClass('disable active');
                    $('.guideline', this.self.shadowRoot).show();
                    objWolf.isMasked = false;
                } else {
                    $('.character-line .scoreBox', this.self.shadowRoot).removeClass('active');
                    activeElems.addClass('active');
                    characterLine.css('visibility', 'hidden')
                    lineSVG.css('visibility', 'visible');
                    characterSVG.removeClass('disable active');
                    $('.guideline', this.self.shadowRoot).hide();
                    objWolf.isMasked = true;
                }
            });
        };
        this.hideIdleMouse = function () {
            var idleMouseTimer;
            var forceMouseHide = false;
            $("body").css('cursor', 'none');
            $("#letterChart, #otherChart", this.self.shadowRoot).mousemove(function (ev) {
                if (!forceMouseHide) {
                    $("body").css('cursor', '');
                    clearTimeout(idleMouseTimer);
                    idleMouseTimer = setTimeout(function () {
                        $("body").css('cursor', 'none');
                        forceMouseHide = true;
                        setTimeout(function () {
                            forceMouseHide = false;
                        }, 200);
                    }, 5000);
                }
            });
        };

        this.swipeDetect = function (el, callback) {
            var touchsurface = el,
                swipedir,
                startX,
                startY,
                distX,
                distY,
                threshold = 150, //required min distance traveled to be considered swipe
                restraint = 100, // maximum distance allowed at the same time in perpendicular direction
                allowedTime = 300, // maximum time allowed to travel that distance
                elapsedTime,
                startTime,
                handleswipe = callback || function (swipedir) {
                }

            touchsurface.addEventListener('touchstart', function (e) {
                var touchobj = e.changedTouches[0]
                swipedir = 'none'
                var dist = 0
                startX = touchobj.pageX
                startY = touchobj.pageY
                startTime = new Date().getTime() // record time when finger first makes contact with surface
                e.preventDefault()
            }, false)

            touchsurface.addEventListener('touchmove', function (e) {
                e.preventDefault() // prevent scrolling when inside DIV
            }, false)

            touchsurface.addEventListener('touchend', function (e) {
                var touchobj = e.changedTouches[0]
                distX = touchobj.pageX - startX // get horizontal dist traveled by finger while in contact with surface
                distY = touchobj.pageY - startY // get vertical dist traveled by finger while in contact with surface
                elapsedTime = new Date().getTime() - startTime // get time elapsed
                if (elapsedTime <= allowedTime) { // first condition for awipe met
                    if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint) { // 2nd condition for horizontal swipe met
                        swipedir = (distX < 0) ? 'left' : 'right' // if dist traveled is negative, it indicates left swipe
                    } else if (Math.abs(distY) >= threshold && Math.abs(distX) <= restraint) { // 2nd condition for vertical swipe met
                        swipedir = (distY < 0) ? 'up' : 'down' // if dist traveled is negative, it indicates up swipe
                    }
                }
                handleswipe(swipedir)
                e.preventDefault()
            }, false)
        }
        this.UpdateSetting =  () => {
            // const sideBarWidth = parseFloat($('#side-bar', this.self.shadowRoot).css('width'));
            $('#updateSetting', this.self.shadowRoot).on('click', () => {
                //set var from user input
                var notation = $('#sNotation', this.self.shadowRoot).val(),
                    localOptotype = $('#sOptotype', this.self.shadowRoot).val(),
                    localsMirrored = $('#sMirrored', this.self.shadowRoot).val(),
                    localDistance = $('#iDistance', this.self.shadowRoot).val().trim(),
                    // cardContentWidth = $('.card-content', this.self.shadowRoot).css('width'),
                    // viewWidth = window.innerWidth - sideBarWidth,
                    viewWidth = this.viewWidth,
                    numeratorType = $('#sNumerator', this.self.shadowRoot).val()

                    colours.optotype = $('#tOptoColour', this.self.shadowRoot).val().trim(),
                    colours.backgrounds.optotype = $('#tBgColour', this.self.shadowRoot).val().trim(),
                    colours.fRedHue = $('#sliderRed', this.self.shadowRoot).val(),
                    colours.fGreenHue = $('#sliderGreen', this.self.shadowRoot).val()
                    var alphabetType = $('#sAlphabet', this.self.shadowRoot).val()
                    shortcuts[0] = $('#pageUp', this.self.shadowRoot).val().trim(),
                    shortcuts[1] = $('#pageDown', this.self.shadowRoot).val().trim(),
                    shortcuts[2] = $('#pageLeft', this.self.shadowRoot).val().trim(),
                    shortcuts[3] = $('#pageRight', this.self.shadowRoot).val().trim(),
                    shortcuts[4] = $('#shuffle', this.self.shadowRoot).val().trim(),
                    shortcuts[5] = $('#duoBG', this.self.shadowRoot).val().trim();
                var lenghOfline = $('#iLengOfLine', this.self.shadowRoot).val().trim(),
                    displayOrder = $('#display', this.self.shadowRoot).val();
                    //reset div
                    $('#letterChart', this.self.shadowRoot).html('<div data-line="1" class="character-line"><div class="guideline"></div><div class="char-line" id="line-1"></div></div><div data-line="2" class="character-line"><div class="guideline"></div><div class="char-line" id="line-2"></div></div>'
                        + '<div data-line="3" class="character-line"><div class="guideline"></div><div class="char-line" id="line-3"></div></div><div data-line="4" class="character-line"><div class="guideline"></div><div class="char-line" id="line-4"></div></div>'
                        + '<div data-line="5" class="character-line"><div class="guideline"></div><div class="char-line" id="line-5"></div></div><div data-line="6" class="character-line"><div class="guideline"></div><div class="char-line" id="line-6"></div></div>'
                        + '<div data-line="7" class="character-line"><div class="guideline"></div><div class="char-line" id="line-7"></div></div><div data-line="8" class="character-line"><div class="guideline"></div><div class="char-line" id="line-8"></div></div>'
                        + '<div data-line="9" class="character-line"><div class="guideline"></div><div class="char-line" id="line-9"></div></div><div data-line="10" class="character-line"><div class="guideline"></div><div class="char-line" id="line-10"></div></div>'
                        + '<div data-line="11" class="character-line"><div class="guideline"></div><div class="char-line" id="line-11"></div></div><div data-line="12" class="character-line"><div class="guideline"></div><div class="char-line" id="line-12"></div></div>'
                        + '<div data-line="13" class="character-line"><div class="guideline"></div><div class="char-line" id="line-13"></div></div><div data-line="14" class="character-line"><div class="guideline"></div><div class="char-line" id="line-14"></div></div>');

                functionConfigWolfChart.removeLetterChartPages();
                //validate required field
                var validate = functionConfigWolfChart.ValidateFunction();
                if (validate) {
                    $('#updateSetting', this.self.shadowRoot).removeClass('disabled-btn').addClass('disabled-btn');
                    return;
                } else {
                    //reset body div
                    // $('body,#letterChart', this.self.shadowRoot).removeAttr('style');
                    $('#letterChart', this.self.shadowRoot).removeAttr('style');
                    //reset letter chart
                    $('#letterChart > div >div', this.self.shadowRoot).html('');
                    $('#letterChart .scoreBox', this.self.shadowRoot).remove();
                    //hide all charts
                    $('.chart', this.self.shadowRoot).hide();
                    //empty nav div
                    $('.nav-link', this.self.shadowRoot).remove();
                    //create objWolf live operating object
                    functionConfigWolfChart.initObjWolf();
                    //set text color
                    functionConfigWolfChart.SetColorCharacter(colours.optotype);
                    functionConfigWolfChart.SetBgColor(colours.backgrounds.optotype);
                    functionConfigWolfChart.CaculatorCharacterHeight(numeratorType);
                    //generate letter charts
                    functionConfigWolfChart.GenerateCharacter(alphabetType, localOptotype);
                    //generate single charts
                    functionConfigWolfChart.GenerateSingleCharts();
                    //set shortcut
                    functionConfigWolfChart.ShortCutKey(shortcuts[0].toUpperCase().charCodeAt(0), shortcuts[1].toUpperCase().charCodeAt(0), shortcuts[2].toUpperCase().charCodeAt(0), shortcuts[3].toUpperCase().charCodeAt(0), shortcuts[4].toUpperCase().charCodeAt(0), shortcuts[5].toUpperCase().charCodeAt(0));
                    //close setting bar
                    $('.setting-bar', this.self.shadowRoot).removeClass('active');
                    $('.guide-section', this.self.shadowRoot).removeClass('active');
                    $('.mask', this.self.shadowRoot).removeClass('active');
                    var $Element, maxEleWidht = 0
                    $('#letterChart', this.self.shadowRoot).css({'width': this.viewWidth, 'height': this.viewHeight, 'margin': 'auto'});
                    //set direct or mirrored
                    functionConfigWolfChart.SetDirectCharacter(localsMirrored);
                    //set smaller font for long scoreBox strings
                    functionConfigWolfChart.SetScoreBoxFont();
                    //divide letter chart into pages
                    functionConfigWolfChart.PageLetterChart();
                    //load all charts into objWolf
                    functionConfigWolfChart.loadCharts();
                    //local storage
                    functionConfigWolfChart.SetLocalStorage();
                    //display the last used chart or a chart in the V category
                    functionConfigWolfChart.navCat(0, null);
                    //display nav bar
                    functionConfigWolfChart.DisplayNavigations();
                    functionConfigWolfChart.Clock();
                    //set old character array for the unshuffle function
                    $('.character-line', this.self.shadowRoot).each(function () {
                        var lineArray = [];
                        lineArray.push($(this).attr('data-line'), $(this).html());
                        oldCharacter.push(lineArray);
                    });
                    $('.modal-setting', this.self.shadowRoot).remove();
                }
            });
        };
        this.Init = () =>  {
            this.viewHeight = 280;
            this.viewWidth = 600;
            var validateElement = this;
            var validate = false,
                VresultDistance, VresultLength;
            $('#iDistance', this.self.shadowRoot).on('blur', () => {
                VresultDistance = validateElement.ValidateDistance();
                if (VresultDistance || VresultLength) {
                    validate = true;
                } else {
                    validate = false;
                }
                ;
                if (validate) {
                    $('#updateSetting', this.self.shadowRoot).removeClass('disabled-btn').addClass('disabled-btn');
                    $('.setting-button', this.self.shadowRoot).trigger('click');
                    return;
                } else {
                    $('#updateSetting', this.self.shadowRoot).removeClass('disabled-btn');
                }
            });
            $('#iLengOfLine', this.self.shadowRoot).on('blur',  () => {
                VresultLength = validateElement.ValidateLengOfLine();
                if (VresultDistance || VresultLength) {
                    validate = true;
                } else {
                    validate = false;
                }
                ;
                if (validate) {
                    $('#updateSetting', this.self.shadowRoot).removeClass('disabled-btn').addClass('disabled-btn');
                    $('.setting-button', this.self.shadowRoot).trigger('click');
                    return;
                } else {
                    $('#updateSetting', this.self.shadowRoot).removeClass('disabled-btn');
                }
            });
            $('.js-shortkey', this.self.shadowRoot).on('blur', function () {
                validateElement.ValidateDuplicateKey(this);
            });
            this.SelectOptotype();
            this.DisplayArrows();
            this.UpdateSetting();
            if (localStorage.getItem("Optotype") != null) {
                //check for latest version, perform major version upgrades
                // if (this.UpdateVersion(ver)) {
                //     this.GetConfigByValue();
                //     $('.setting-button', this.self.shadowRoot).trigger('click');
                //     $('#updateSetting', this.self.shadowRoot).removeClass('disabled-btn');
                // } else
                if (localStorage.getItem("Distance") != "" && localStorage.getItem("LengthOfLine") != "") {
                    this.GetConfigByValue();
                    $('#updateSetting', this.self.shadowRoot).trigger('click');
                    $('#updateSetting', this.self.shadowRoot).removeClass('disabled-btn');
                } else {
                    $('.setting-button', this.self.shadowRoot).trigger('click');
                }
            } else if ($('#iDistance', this.self.shadowRoot).val().trim() == "" || $('#iLengOfLine', this.self.shadowRoot).val().trim() == "") {
                $('.setting-button', this.self.shadowRoot).trigger('click');
            }
            // cek preset initial values
            // this.GetConfigByValue();
            // $('#updateSetting', this.self.shadowRoot).trigger('click');
            // $('#updateSetting', this.self.shadowRoot).removeClass('disabled-btn');

            this.ResetValueToDefault();
            this.characterClick();
            this.scoreBoxClick();
            // this.hideIdleMouse();
            /* this.swipeDetect(document.getElementById('letterChart'),function(swipedir) {
            console.log("Swiped "+swipedir);
        }); */
        };
    }
}
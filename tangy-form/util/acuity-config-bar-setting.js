/**
 * Many thanks to the WolfChart project, from which most of this code was taken.
 * https://github.com/ballantynedewolf/WolfChart
 */
export class ConfigBarSetting {
    self = null;
    constructor() {
        // replacing JQuery with vanilla JS
        // this.$ = function(selector) {
        //     return this.shadowRoot.querySelector(selector);
        // }
        this.sidebar =  () =>{
            $('.setting-button', this.self.shadowRoot).on('click',  (e) => {
                e.preventDefault();
                var target = $('.setting-button', this.self.shadowRoot).attr('href');
                $(target, this.self.shadowRoot).addClass('active');
                setColIconsAndPresets("tOptoColour");
                setColIconsAndPresets("tBgColour");
                $('body').append('<div class="modal-setting"></div>')
            });
            $('.close', this.self.shadowRoot).on('click',  (e) => {
                e.preventDefault();
                $('.setting-bar', this.self.shadowRoot).removeClass('active');
                $('.guide-section', this.self.shadowRoot).removeClass('active');
                $('.mask', this.self.shadowRoot).removeClass('active');
                $('.modal-setting', this.self.shadowRoot).remove();
            });
            $('.questions-btn', this.self.shadowRoot).on('click',  (e) => {
                e.preventDefault();
                $('.guide-section', this.self.shadowRoot).addClass('active');
                $('.mask', this.self.shadowRoot).addClass('active');
            });
            $('.close-guide', this.self.shadowRoot).on('click', (e)=>  {
                e.preventDefault();
                $('.guide-section', this.self.shadowRoot).removeClass('active');
                $('.mask', this.self.shadowRoot).removeClass('active');
            });
            $('body').on('click', function (e) {

            });
            $(document).on('click', '.modal-setting', () => {
                $('.setting-bar', this.self.shadowRoot).removeClass('active');
                $('.guide-section', this.self.shadowRoot).removeClass('active');
                $('.mask', this.self.shadowRoot).removeClass('active');
                $('.modal-setting', this.self.shadowRoot).remove();
            });
            //allow colour preset buttons to update colour field and icon
            $('.col-preset-opto', this.self.shadowRoot).on('click',  (e) => {
                e.preventDefault();
                $('.col-preset-opto').removeClass('disabled-btn');
                $(this).addClass('disabled-btn');
                $('#tOptoColour', this.self.shadowRoot).val(e.target.value);
                $('#tOptoColour ~ i', this.self.shadowRoot).css('background', e.target.value);
            });
            $('.col-preset-bg').on('click',  (e) => {
                e.preventDefault();
                $('.col-preset-bg', this.self.shadowRoot).removeClass('disabled-btn');
                $(this).addClass('disabled-btn');
                $('#tBgColour', this.self.shadowRoot).val(e.target.value);
                $('#tBgColour ~ i', this.self.shadowRoot).css('background', e.target.value);
            });

            //set the icon colours, enable/disable preset buttons
            const setColIconsAndPresets = (id)  => {
                var box = $('#' + id, this.self.shadowRoot);
                box.next('i').css('background', box.val());
                var presets = (id.includes("Opto")) ? ".col-preset-opto" : ".col-preset-bg";
                $(presets, this.self.shadowRoot).each( (idx, el) =>  {
                    $(el).removeClass('disabled-btn');
                    if (el.value == box.val()) {
                        $(el).addClass('disabled-btn');
                    }
                });
            }

            //on updating colour fields, update icon and preset buttons
            $('.col-setting input', this.self.shadowRoot).on('change',  (e) => {
                e.preventDefault();
                var colInput = $(this).attr('id');
                setColIconsAndPresets(colInput);

            });
            //let filter colour sliders update the slider background
            $('.slider').on('input', (e) => {
                e.preventDefault;
                var slider = $(this);
                slider.css('background', 'hsl(' + slider.val() + ',80%,60%)');

            })
            //disable background colour fg when Vanishing Sloan is selected
            $('#sOptotype').on('change',  (e) =>  {
                if (this.value == 5) {
                    $('#fgBgColour', this.self.shadowRoot).removeClass('disabled-fg').addClass('disabled-fg');
                    $('#fgPresetsBg', this.self.shadowRoot).removeClass('disabled-fg').addClass('disabled-fg');
                } else {
                    $('#fgBgColour', this.self.shadowRoot).removeClass('disabled-fg');
                    $('#fgPresetsBg', this.self.shadowRoot).removeClass('disabled-fg');
                }
            });

        };
        this.accordion = () => {
            // panel title click
            $('.panel-heading', this.self.shadowRoot).on('click',  (e) =>  {
                e.preventDefault();
                var target = $('.panel-heading', this.self.shadowRoot).next();
                if (!$(target).is(":visible")) {
                    $('.panel-heading', this.self.shadowRoot).removeClass('active');
                    $(this).toggleClass('active');
                    $('.panel-collapse', this.self.shadowRoot).slideUp();
                    $(target).slideDown();
                }
            });
            // question icon click
            $('.questions-btn', this.self.shadowRoot).on('click',  (e) => {
                e.preventDefault();
                var target = $('.questions-btn', this.self.shadowRoot).attr('href');
                var content = $(target).next();
                if (!$(content).is(":visible")) {
                    $('.panel-heading', this.self.shadowRoot).removeClass('active');
                    $('.panel-collapse', this.self.shadowRoot).slideUp();
                    $(target).addClass('active');
                    $(content).slideDown();
                }
            });
        };
        this.init = function () {
            this.sidebar();
            this.accordion();
        }
    }
}
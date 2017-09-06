function funcShow(_btn) {
    var ov = $("#overlay");
    var pos = $(_btn).offset();
    var doc = $(document);
    ov.css({
        left: pos.left + 'px',
        top: pos.top + 'px',
        width: 0,
        height: 0
    })
    .show()
    .animate({
        left: 0,
        top: 0,
        width: '100%',
        height: '100%'
        }, "slow");
    
}

function funcClose() {
   $("#overlay").hide("slow");
}
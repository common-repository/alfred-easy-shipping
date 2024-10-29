jQuery(function () {
    jQuery('.tabgroup > div').hide();
    jQuery('.tabgroup > div:first-of-type').show();
    jQuery('.tabs a').click(function(e){
        e.preventDefault();
        var $this = jQuery(this),
            tabgroup = '#'+$this.parents('.tabs').data('tabgroup'),
            others = $this.closest('li').siblings().children('a'),
            target = $this.attr('href');
        others.removeClass('active');
        $this.addClass('active');
        jQuery(tabgroup).children('div').hide();
        jQuery(target).show();

    })
});

jQuery(document).ready(function($) {
    $(".multitab-widget-content-widget-id").hide();
    $("ul.multitab-widget-content-tabs-id li:first a").addClass("multitab-widget-current").show();
    $(".multitab-widget-content-widget-id:first").show();
    $("ul.multitab-widget-content-tabs-id li a").click(function() {
        $("ul.multitab-widget-content-tabs-id li a").removeClass("multitab-widget-current a");
        $(this).addClass("multitab-widget-current");
        $(".multitab-widget-content-widget-id").hide();
        var activeTab = $(this).attr("href");
        $(activeTab).fadeIn();
        return false;
    });
});



(function($) {

    $.factory('shell', {
        singleton: true,
        main: function() {
            $('#content').tinyscrollbar();
            $.resize(function() {
                $('#content').tinyscrollbar_update('relative');
            });
        }
    });
})(jQuery);
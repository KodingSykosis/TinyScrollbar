(function($) {

    $.factory('shell', {
        singleton: true,
        main: function() {
            $('#content').tinyscrollbar({
                pagingUrl: '/content.txt'
            });
        }
    });
})(jQuery);
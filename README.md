TinyScrollbar
=============

This is a fork from <http://baijs.nl/tinyscrollbar/>

###$([selector]).tinyscrollbar(*[Options]*);

####Options
	pagingAt           - Position to trigger a paging (default: '75%')
	pagingUrl          - Url to submit
	pagingData         - Additional data copied to the query
	pagingKey          - Key name to set the page number to (default: 'page')
	pagingMax          - Max page to request (default: 10)
	pagingNum          - The current page number (default: 1)
	pagingAppendTo     - Element to append next page content to
	updateWithWindow   - Updates the scroll with window resize (default: true)

###Methods

###$([selector]).tinyscrollbar_update(*[command]*);
Updates the scrollable size and position

####command (Number, String)
	number     - x/y position for scroll thumb
	'relative' - Calculates the relative position for the thumb position to remain unchanged
	'bottom'   - Scroll to the bottom of the content

###$([selector]).tinyscrollbar_paging( *[resetScroll,]* PagingConfig);
Resets the paging config and optionally the scroll position.

####resetScroll _(Boolean)_
Resets the scroll position to top (0px).

####PagingConfig
    at     - Position to trigger a paging
    url    - Url to submit
    data   - Additional data copied to the query
    key    - Key name to set the page number to
    max    - Max page to request
    num    - The current page number

###Events
	scroll             - Triggered on wheel, touch, PgUp/PgDn, and Drag
	pagination         - Triggered after new content is appended
	pagingappend       - Triggered before content is appended
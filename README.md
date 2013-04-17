TinyScrollbar
=============

This is a fork from <http://baijs.nl/tinyscrollbar/>

	$([selector]).tinyscrollbar();

to update the scrollable container

	$([selector]).tinyscrollbar_update([top | left | 'relative']);

Options
-
	pagingAt           - Position to trigger a paging (default: '75%')
	pagingUrl          - Url to submit
	pagingData         - Additional data copied to the query
	pagingKey          - Key name to set the page number to (default: 'page')
	pagingMax          - Max page to request (default: 10)
	updateWithWindow   - Updates the scroll with window resize (default: true)

Events
-
	scroll             - Triggered on wheel, touch, PgUp/PgDn, and Drag
	pagination         - Triggered after new content is appended
	pagingappend       - Triggered before content is appended
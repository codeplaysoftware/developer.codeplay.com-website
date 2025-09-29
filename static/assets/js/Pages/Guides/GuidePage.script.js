$(document).ready(function() {
    $('footer').detach().appendTo('#footer-target').show();

    // Jump the main menu to the correct position
    if ($('.file-menu li.focused').length !== 0) {
        $('.file-menu-container').scrollTop(
            $('.file-menu li.focused').position().top - ($(window).height() - 300));
    }

    if ($('.file-menu .focused').parent().find('.anchor').length > 0) {
        $('.layout-file article').HeadingsInFocus($('.file-menu .focused').parent());
    }

    $('.layout-file article').HeadingsInFocus($('.in-page-jump-list'));

    // Cycle all the code blocks
    $('pre code').each(function() {
        const codeBlock = $(this);

        // Re-highlight
        hljs.highlightElement(codeBlock[0]);

        // If supported, add copy button
        if (navigator.clipboard) {
            // Create a copy button
            const copyButton = $('<a class="button copy"><span class="material-icons">file_copy</span>Copy</a>');
            copyButton.click(function() {
                navigator.clipboard.writeText($(this).parent().text().replace($(this).text(), ''));
            });

            // Attach the copy button to the code block
            $(this).parent().prepend(copyButton);
        }
    });

    // Rating system
    const rating = $('.rate');

    rating.find('.up').click(function() {
        rating.addClass('collapsed');
        rating.find('input[name="message"]').val('A user has thumbs-up a guide.');
        rating.find('form').submit();
    });

    rating.find('.down').click(function() {
        $(this).toggleClass('selected');

        rating.toggleClass('collapsed');
        rating.find('input[name="message"]').val('');
        rating.find('input[name="message"]')[0].focus();

        rating.find('input').on('keydown', function(event) {
            if(event.which === 13) {
                event.preventDefault();
                rating.find('form').submit();
            }
        });
    });

    // Content container resizer
    $('#content-container').Resizable(
        'defaultMenuWidth', 401, undefined, 'offset-left', 1);

    // Jump-list resizer
    $('#jump-list-container').Resizable(
        'layoutContentMaxWidth', 1000, $('#content-container'));
});

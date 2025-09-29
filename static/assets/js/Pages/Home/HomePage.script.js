$(document).ready(function() {
    $('section#splash #view-products-button').click(function(e) {
        e.preventDefault();
        productSelectorPopup.show();
    });

    $('section#projects .project-container > div:nth-of-type(1) a').click(function(e) {
        e.preventDefault();

        $('section#projects .project-container > div:nth-of-type(1) a').removeClass('selected');
        $(this).addClass('selected');

        $('section#projects .projects').addClass('hidden');
        $('section#projects .projects.' + $(this).data('target')).removeClass('hidden');
    });
});
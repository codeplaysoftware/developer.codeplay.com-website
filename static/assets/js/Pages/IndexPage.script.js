// Global so any script can access
let cookiePolicyManager = null;
let debounce = null;

// Global popups
let colorSchemePopup;
let searchPopup;
let siteSelecctorPopup;
let productSelectorPopup;

/**
 * Set (or create) a cookie with a value.
 * @param key
 * @param value
 */
function setCookie(key, value) {
    let expires = new Date();
    expires.setTime(expires.getTime() + (365 * 24 * 60 * 60 * 1000));

    let cookieValue = key + '=' + value + ';expires=' + expires.toUTCString() + ';path=/;SameSite=Strict;';

    if (location.protocol === 'https:') {
        cookieValue += 'Secure;';
    }

    document.cookie = cookieValue;
}

/**
 * Get a specific cookies value.
 * @param key
 * @returns {any}
 */
function getCookie(key) {
    let keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
    return keyValue ? keyValue[2] : null;
}

$(document).ready(function() {
    // Color scheme popup
    colorSchemePopup = $('div#colorSchemeDialog').PopupDialog('Color Scheme Dialog', function (parent) {
        function setDarkMode(enabled) {
            let darkMode = false;

            if (enabled) {
                $('html').addClass('dark-mode');
            } else {
                $('html').removeClass('dark-mode');
            }

            setCookie('CDPDARKMODE', enabled);
        }

        parent.find('.selectDarkMode').click(function() {
            setDarkMode(true);
            colorSchemePopup.close();
        });

        parent.find('.selectLightMode').click(function() {
            setDarkMode(false);
            colorSchemePopup.close();
        });
    });

    /**
     * Search
     * @param searchTerm
     * @param loadedCallbackFn
     */
    function search(searchTerm, loadedCallbackFn) {
        return $.ajax({
            dataType: 'json',
            url: '/api/v1/search?q=' + encodeURIComponent(searchTerm),
            success: function (response) {
                loadedCallbackFn(response);
            },
            error: function(xhr, response, err) {
                let errorResponse = [];
                errorResponse['message'] = 'There was a problem searching, please try again.';

                try {
                    errorResponse = JSON.parse(response);
                } catch (e) { }

                loadedCallbackFn(errorResponse, true);
            }
        });
    }

    // Search popup
    searchPopup = $('div#searchDialog').PopupDialog('Search Dialog', function (parent) {
        // Reset
        parent.find('input').val('');
        parent.find('ul.search-results').hide();
        parent.find('.message').hide();
        parent.find('.no-search').show().css('display', 'flex');

        parent.find('.search-ideas li').click(function() {
            $('div#searchDialog input')
                .val($(this).text())
                .keyup()
                .focus();
        });

        let searchRequest = null;
        let previousSearchTerm = '';
        parent.find('input').keyup(function(e) {
            const keypress = e.keyCode || e.which;
            const searchTerm = $(this).val();

            if (keypress == 13 && searchTerm.length) {
                const firstElement = parent.find('ul.search-results li:first-of-type a');

                if (firstElement.length) {
                    firstElement[0].click();
                }
            }

            // Skip identical searches
            if (previousSearchTerm === searchTerm) {
                return ;
            }

            previousSearchTerm = searchTerm;

            if (debounce) {
                clearTimeout(debounce);
            }

            if (searchRequest) {
                searchRequest.abort();
            }

            if(searchTerm.length == 0) {
                parent.find('ul.search-results').hide();
                parent.find('.message').hide();
                parent.find('.no-search').show().css('display', 'flex');
                return;
            }

            parent.find('.no-search').hide();
            parent.find('.searching').show().css('display', 'flex');

            debounce = setTimeout(function() {
                searchRequest = search(searchTerm, function(response, isError = false) {
                    if (searchTerm !== parent.find('input').val()) {
                        return ;
                    }

                    if (!Array.isArray(response) && !('results' in response)) {
                        isError = true;
                        response = [];
                        response['message'] = 'There was a problem searching, please try again.';
                    }

                    if (!isError) {
                        const searchResults = response['results'];

                        parent.find('ul.search-results').empty();
                        parent.find('.message').hide();

                        if (searchResults.length == 0) {
                            parent.find('.no-results').show().css('display', 'flex');
                        } else {
                            parent.find('ul.search-results').show();
                        }

                        for (const searchResult of searchResults) {
                            let type = searchResult['type'];
                            const message = ''

                            if(searchResult['product']) {
                                type = searchResult['product']['name'] + ' ' + searchResult['productVariant']['tag'];
                            }

                            const elementTypeTag = type.toLowerCase().replace(/[^0-9a-z]/gi, '');
                            let target = '_self';

                            if (searchResult['url'].startsWith('https')) {
                                target = '_blank';
                            }

                            parent.find('ul.search-results').append(
                                '<li>' +
                                '  <a href="' + searchResult['url'] + '" target="' + target + '">\n' +
                                '    <div>\n' +
                                '      <h1>' + searchResult['title'] + '</h1>\n' +
                                '      <h2>' + searchResult['description']  + '</h2>\n' +
                                '    </div>\n' +
                                '    <div>\n' +
                                '      <div class="tag ' + elementTypeTag + '">' + type.toUpperCase() + '</div>\n' +
                                '    </div>\n' +
                                '  </a>' +
                                '</li>');
                        }
                    } else {
                        parent.find('.message').hide();
                        parent.find('.error').text(response['message']).show().css('display', 'flex');
                    }
                });

            }, 300);
        });

        parent.find('input').focus();
    });

    // Site selector popup
    siteSelecctorPopup = $('div#siteSelectorDialog').PopupDialog('Site Selector', function (parent) {});

    // Product selector popup
    productSelectorPopup = $('div#productSelectorDialog').PopupDialog('Product Selector', function (parent) {
        $('#productSelectorDialog a.productSelection').click(function(event) {
            setProduct($(this).data('product'));
        });

        function setProduct(productTag) {
            parent.find('#products li').removeClass('selected');
            parent.find('#products .' + productTag).parent().addClass('selected');

            if(productTag) {
                parent.find('#product').show();
                parent.find('#no-product').hide();

                parent.find('div.product-view').hide();
                parent.find('div#product-' + productTag).show();
            } else {
                parent.find('#product').hide();
                parent.find('#no-product').show();
            }
        }

        // Default
        setProduct('oneapi');

        // Choose current product by default
        $('#products li a').each(function( index ) {
            const productTag = $(this).data('product');

            if (window.location.href.includes(productTag)) {
                setProduct(productTag);
            }
        });
    });

    // Global show search button
    $('.show-search').click(function() {
        $('nav.main a.search').click();
    });

    $('nav .search').click(function() {
        searchPopup.show();
    });

    // Global show search button
    $('.lightModeButton').click(function() {
        colorSchemePopup.show();
    });

    // Initialize CookiePolicyManager
    cookiePolicyManager = $('body').CookiePolicyManager(
        'https://codeplay.com/company/privacy/',
        '/cookies/',
        'CDPCOOKIESACCEPTED');

    $('nav.main > div:nth-of-type(1) a').click(function(e) {
        if(window.location.pathname == '' || window.location.pathname == '/home/') {
            e.preventDefault();
            siteSelecctorPopup.show();
        }
    });

    $('nav.main > div:nth-of-type(2) a').click(function(e) {
        e.preventDefault();
        productSelectorPopup.show();
    });

    $('nav.main > div:nth-of-type(4) ul > li:last-of-type a').click(function(e) {
        if($(this).parent().hasClass('selected')) {
            // Release scroll on background
            $('body').css({
                'position': 'static',
                'overflow-y': 'auto'
            });

            $(this).parent().removeClass('selected');
            $('#burger-menu').toggle();
        } else {
            // Lock scroll on background
            $('body').css({
                'position': 'fixed',
                'overflow-y': 'scroll',
                'width': '100%'
            });

            $(this).parent().addClass('selected');
            $('#burger-menu').toggle();
        }
    });

    // Copyright
    $('main').CopyrightText($('footer div#copyright'));
});

const scrollDebounce = (fn) => {
    let frame;
    return (...params) => {
        if (frame) {
            cancelAnimationFrame(frame);
        }

        frame = requestAnimationFrame(() => {
            fn(...params);
        });
    }
};

const storeScroll = () => {
    document.documentElement.dataset.scroll = window.scrollY;
}

document.addEventListener('scroll', scrollDebounce(storeScroll), { passive: true });

storeScroll();

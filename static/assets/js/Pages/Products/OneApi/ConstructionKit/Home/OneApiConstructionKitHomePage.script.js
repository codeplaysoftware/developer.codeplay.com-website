/**
 * Checks if the graphic is inview and starts the animation.
 * @param entries
 * @param observer
 */
function callbackFunc(entries, observer) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const element = $('#graphic');
            const elementOffsetRight = $(window).width() - (element.position().left + (element.width() / 2 + 40));

            $('#arm').animate({right: elementOffsetRight + 'px'}, {
                duration: 3000,
            });
        }
    });
}

/**
 * Load the latest GitHub repo details.
 */
function fetchLatestRepoDetails() {
    $.getJSON('https://api.github.com/repos/codeplaysoftware/oneapi-construction-kit', function(data) {
        $('#repo-details-forks').text(data['forks_count']);
        $('#repo-details-watchers').text(data['subscribers_count']);
        $('#repo-details-stars').text(data['stargazers_count']);

        let updateTime = new Date(data['updated_at']);

        if (new Date(data['pushed_at']) > updateTime) {
            updateTime = new Date(data['pushed_at']);
        }

        $('#repo-details-update').text(getLastUpdateReadable(updateTime));
        console.log('GitHub stats updated.');
    });
}

/**
 * Create a user-friendly time for the last update.
 * @param date
 * @returns {string}
 */
function getLastUpdateReadable(date) {
    const delta = Math.round((+new Date - date) / 1000);

    const minute = 60,
        hour = minute * 60,
        day = hour * 24,
        week = day * 7;

    if (delta < 30) {
        return 'just then';
    } else if (delta < minute) {
        return delta + ' seconds ago';
    } else if (delta < 2 * minute) {
        return 'a minute ago'
    } else if (delta < hour) {
        return Math.floor(delta / minute) + ' minutes ago';
    } else if (Math.floor(delta / hour) == 1) {
        return '1 hour ago'
    } else if (delta < day) {
        return Math.floor(delta / hour) + ' hours ago';
    } else if (delta < day * 2) {
        return 'yesterday';
    }
}

/**
 * Document is ready.
 */
$(document).ready(function() {
    const observer = new IntersectionObserver(callbackFunc, {
        root: null,
        rootMargin: '0px',
        threshold: 0.3
    });

    observer.observe(document.getElementById('target-audience'));

    // Load latest repo detals
    fetchLatestRepoDetails();
});

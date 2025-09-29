(function ($) {
    $.fn.HeadingsInFocus = function (menuContainer, callbackFunction) {
        const container = $(this);
        const offset = 100; // Navigation bar height

        /**
         * Initialize.
         */
        function init() {
            const elements = buildElementList();

            ['hashchange', 'scroll'].forEach(evt =>
                document.addEventListener(evt, () => reloadMenuSelectionStates(elements), false)
            );

            reloadMenuSelectionStates(elements);
        }

        /**
         * Reload all the selection states.
         */
        function reloadMenuSelectionStates(elements) {
            elements = refreshElements(elements);
            updateMenuSelectedItem(elements[1]);
        }

        /**
         * Refresh the element list.
         * @returns {(*[]|*)[]}
         */
        function refreshElements(elements) {
            const cp = ($(window).innerHeight() / 4) + $(document).scrollTop() - offset;

            const closestElementToCenter = elements.reduce(function(prev, curr) {
                return (Math.abs(curr['position'] - cp) < Math.abs(prev['position'] - cp) ? curr : prev);
            });

            $.each(elements, function(key, currentElement) {
                currentElement['focused'] = (currentElement == closestElementToCenter ? true : false)
            });

            return [elements, closestElementToCenter];
        }

        /**
         * Build a list of heading elements.
         * @returns {*[]}
         */
        function buildElementList() {
            let elementList = [];

            let previous = null;
            container.find('h1, h2').each(function () {
                const current = {
                    'element': $(this),
                    'focused': false,
                    'position': $(this).offset().top,
                    'previous': previous,
                };

                elementList.push(current);
                previous = current;
            });

            return elementList;
        }

        /**
         * Update the selected item.
         * @param selectedItem
         */
        function updateMenuSelectedItem(selectedItem) {
            let wasFound = false;

            menuContainer.find('a').each(function() {
                const currentMenuItem = $(this);

                currentMenuItem.parent().removeClass('selected');

                if (currentMenuItem.attr('href'))  {
                    if (currentMenuItem.attr('href').endsWith(selectedItem['element'].parent().attr('href'))) {
                        currentMenuItem.parent().addClass('selected');
                        wasFound = true;
                    }
                }
            });

            if (!wasFound) {
                const top = menuContainer.find('[href="' + window.location.pathname + '"]');

                if (top) {
                    top.parent().addClass('selected');
                }

                if (selectedItem['previous']) {
                    updateMenuSelectedItem(selectedItem['previous']);
                }
            }
        }

        /**
         * Then the DOM is read, start!
         */
        $(document).ready(function() {
            init();
        });

        return this;
    }
})(jQuery);

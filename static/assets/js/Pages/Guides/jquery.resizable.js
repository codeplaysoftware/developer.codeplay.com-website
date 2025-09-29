(function ($) {
    $.fn.Resizable = function (bindableCssVariable,
                               defaultPropertyValue = 500,
                               observableElement = null,
                               observableElementProperty = 'width',
                               observableElementPadding = 0,
                               invert = false) {

        if (!observableElement) {
            observableElement = $(this);
        }

        const name = 'CDPRESIZER';
        const container = $(this);

        let isDragging = false;
        let currentMouseX = 0;
        let currentMouseY = 0;
        let previousChanges = [];
        let previousZoomLevel;

        /**
         * Initialize.
         */
        function init() {
            // Create a new separator
            const sep = $('<div class="sep"></div>');

            // Append separator to container
            container.prepend(sep);

            // Set current zoom level
            previousZoomLevel = Math.round(window.devicePixelRatio * 100);

            // Reset on all window resize (and zoom) events
            $(window).resize(function() {
                if (Math.round(window.devicePixelRatio * 100) !== previousZoomLevel) {
                    setPropertyTargetValue(defaultPropertyValue);
                    saveState(defaultPropertyValue);
                    unbindEventListeners();
                }

                previousZoomLevel = Math.round(window.devicePixelRatio * 100);
            });

            // Capture mouse down events
            sep.mousedown(function(mouseDownEvent) {
                isDragging = true;
                lastValidPosition = null;

                currentMouseX = mouseDownEvent.pageX;
                currentMouseY = mouseDownEvent.pageY;

                $(document).mouseup(function(mouseUpEvent) {
                    // Unbind event listeners
                    unbindEventListeners();

                    // Skip if we are not dragging
                    if (!isDragging) {
                        return ;
                    }

                    // State dragging state to false
                    isDragging = false;

                    // Preserve state
                    saveState(lastValidPosition);
                });

                $(document).on('selectstart', function (selectStartEvent) {
                    if (isDragging) {
                        selectStartEvent.preventDefault();
                    }
                });

                $(document).mousemove(function(mouseMoveEvent) {
                    mouseMoveEvent.preventDefault();

                    if (!isDragging) {
                        return ;
                    }

                    // Get the target property value
                    const targetPropertyValue = getTargetPropertyValue(mouseMoveEvent);
                    const currentPropertyValue = getCurrentPropertyValue() + observableElementPadding;
                    let currentStateValue = getTargetObservableValue();

                    if (currentPropertyValue !== currentStateValue) {
                        currentStateValue = lastValidPosition;
                    } else {
                        lastValidPosition = currentStateValue;
                    }

                    // Update the UI
                    setPropertyTargetValue(targetPropertyValue);

                    currentMouseX = mouseMoveEvent.pageX;
                    currentMouseY = mouseMoveEvent.pageY;
                });
            });
        }

        /**
         * Unbind any event listeners.
         */
        function unbindEventListeners() {
            // Remove mouse listeners
            $(document).unbind('mousemove');
            $(document).unbind('mouseup');
            $(document).unbind('selectstart');
        }

        /**
         * Calculate the target property value.
         * @param event
         * @returns {number}
         */
        function getTargetPropertyValue(event) {
            const changeMouseX = Number.parseInt(event.pageX - currentMouseX);

            const currentRootPropertyValue = Number.parseInt(getCurrentPropertyValue());

            if (invert) {
                return currentRootPropertyValue - changeMouseX;
            }

            return currentRootPropertyValue + changeMouseX;
        }

        /**
         *
         * @param value
         */
        function setPropertyTargetValue(value) {
            $(':root')[0].style.setProperty(
                '--' + bindableCssVariable, value + 'px');
        }

        /**
         *
         * @returns {number}
         */
        function getCurrentPropertyValue() {
            return Number.parseInt(getComputedStyle($(':root')[0])
                .getPropertyValue('--' + bindableCssVariable)
                .replace('px', ''));
        }

        /**
         * Get observable property value.
         * @returns {number}
         */
        function getTargetObservableValue() {
            let value = 0;

            if (observableElementProperty === 'width') {
                value = observableElement.width();
            } else if (observableElementProperty === 'offset-left') {
                value =  observableElement.offset().left;
            }

            return Math.round(value);
        }

        /**
         * Save the current resize state to a cookie.
         */
        function saveState(targetPropertyValue) {
            const currentCookieValue = getCookie(name);
            let targetCookieValue = {};

            if (currentCookieValue) {
                targetCookieValue = JSON.parse(currentCookieValue);
            }

            targetCookieValue[btoa(bindableCssVariable)] = targetPropertyValue;

            setCookie(name, JSON.stringify(targetCookieValue));
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
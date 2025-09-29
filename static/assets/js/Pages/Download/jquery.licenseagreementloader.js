(function ($) {
    $.fn.LicenseAgreementLoader = function(productTag,
                                           productVariantTag,
                                           productVariantVersionTag,
                                           acceptCallbackFunction,
                                           closeCallbackFunction) {
        function createElement(productTag, productVariantTag, productVariantVersionTag) {
            return '<div id="licenseAgreementDialog" class="popupDialog">' +
                '    <div>' +
                '        <div class="license styled-scroller">' +
                '           <div class="loading">' +
                '               <div>' +
                '                   <span class="material-icons">sync</span>' +
                '                   <p>Loading, please wait..</p>' +
                '               </div>' +
                '           </div>' +
                '        </div>' +
                '        <div>' +
                '            <div>' +
                '                <h1>License Agreement</h1>' +
                '                <p>Before you can download this software, you must first read and agree to the license provided.</p>' +
                '                <p>Please take your time to read through it and also please note that this license may change between releases of each product and we will not notify you.</p>' +
                '                <p>If you wish for a custom license, <a href="https://support.codeplay.com" target="_blank">please contact us</a>.</p>' +
                '            </div>' +
                '            <div>' +
                '                <div class="product-info">' +
                '                    <b>Product: </b> ' + productTag + ' <br />' +
                '                    <b>Product Edition: </b> ' + productVariantTag + ' <br />' +
                '                    <b>Product Version: </b> ' + productVariantVersionTag + ' <br />' +
                '                </div>' +
                '                <a class="button hint-color disabled" name="agree">I Agree</a>' +
                '                <a class="button" name="disagree">Close</a>' +
                '            </div>' +
                '        </div>' +
                '    </div>' +
                '</div>';
        }

        function loadLicense(productTag, productVariantTag, productVariantVersionTag, loadedCallbackFn) {
            $.ajax({
                dataType: 'json',
                url: '/api/v1/products/license' +
                    '?product=' + productTag +
                    '&variant=' + productVariantTag +
                    '&version=' + productVariantVersionTag,
                success: function (response) {
                    loadedCallbackFn(response);
                },
                error: function(xhr, response, err) {
                    loadedCallbackFn(xhr.responseText, true);
                }
            });
        }

        this.open = function() {
            // Clean up
            $(this).find('#licenseAgreementDialog').remove();

            // Create new element
            $(this).append(
                createElement(
                    productTag,
                    productVariantTag,
                    productVariantVersionTag));

            // Show the license dialog
            $('div#licenseAgreementDialog').PopupDialog('Legal Agreement', function (licensePopupDialog) {
                licensePopupDialog.find('a[name="disagree"]').click(function (e) {
                    e.preventDefault();
                    licensePopupDialog.close();
                });

                // Load the license
                loadLicense(productTag, productVariantTag, productVariantVersionTag, (licenseData, isError = false) => {
                    licensePopupDialog.find('a[name="disagree"]').removeClass('disabled');

                    licensePopupDialog.find('.license').html(licenseData['content']);

                    if (!isError) {
                        licensePopupDialog.find('a[name="disagree"]').text('Disagree');
                        licensePopupDialog.find('a[name="agree"]').removeClass('disabled');
                        licensePopupDialog.find('a[name="agree"]').click(function (e) {
                            e.preventDefault();
                            licensePopupDialog.close();
                            acceptCallbackFunction();
                        });
                    }
                });

            }, function() {
                closeCallbackFunction();
            }).show();
        };

        return this;
    };
})(jQuery);

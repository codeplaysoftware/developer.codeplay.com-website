$(document).ready(() => {
    if(cookiePolicyManager.isCookiePolicyAccepted()) {
        $.getScript('https://www.recaptcha.net/recaptcha/api.js?render=explicit');
    }

    if(window.location.hash && window.location.hash.substring(1) === 'sent') {
        showPackagePopup(null, true);
    }

    $('.package-select').click(function() {
        showPackagePopup($(this).data('package'));
    });
});

function showPackagePopup(packageName, sent = false) {
    $('.subscribe').PopupDialog(
        'Support Package Subscribe',
        function (popup) {
            if (sent) {
                popup.find('.prepare').hide();
                popup.find('.sent').show();
            } else {
                popup.find('.package-title').text(packageName);
                popup.find('input[name="_subject"]').val('oneAPI Support Request Upgrade');
                popup.find('input[name="package"]').val(packageName);

                const form = popup.find('form');
                const captchaTarget = form.find('.g-recaptcha');

                form.SimpleFormValidator();

                grecaptcha.render(captchaTarget.empty()[0], {
                    'sitekey': captchaTarget.data('site-key'),
                    'callback' : function(response) {
                        form.data('is-valid', 'true');
                        form.find(':input').trigger('change');
                    }
                });
            }
        }).show();
}

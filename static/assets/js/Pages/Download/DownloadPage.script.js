$(document).ready(function () {
    if ($('#download-chooser').length) {
        // Initialize the download chooser
        $('body').DynamicDownloadSelector(
            DownloadDescriptor.deserializeArray(
                $('#download-chooser').data('downloads')));
    }

    if ($('#signedDownloadUrl').length) {
        setTimeout(function() {
            if ($('#signedDownloadUrl').attr('href')) {
                window.location = $('#signedDownloadUrl').attr('href');
            }
        }, 1500);
    }

    $('#download-api-link').click(function (e) {
        e.preventDefault();
        showWgetPopup();
    });

    if(cookiePolicyManager.isCookiePolicyAccepted()) {
        $('form').SimpleFormValidator();
        $.getScript('https://www.recaptcha.net/recaptcha/api.js?render=explicit&onload=onCaptchaLoadedCallback');
    }
});

function onCaptchaLoadedCallback() {
    // Recaptcha setup
    $(document).ready(() => {
        $('form').each(function() {
            const currentForm = $(this);
            const captchaElement = currentForm.find('.g-recaptcha');
            const siteKey = captchaElement.data('site-key');

            if (captchaElement.length) {
                grecaptcha.render(captchaElement[0], {
                    'sitekey': siteKey,
                    'callback': function(response) {
                        currentForm.data("is-valid", "true");
                        currentForm.find(':input').trigger("change");
                    }
                });
            }
        });
    });
}

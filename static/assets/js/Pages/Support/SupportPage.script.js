const TEMPLATES = {
    '007': 'I am having issues downloading via the download API, please provide assistance.',
    '008': 'I am having issues creating an API Access Token, please provide assistance.',
    '009': 'I would like to require more API Access Tokens, please provide assistance.',
    '011': 'I have noticed a missing product, it is:',
    '010': 'I would like to remove the IP restriction on my API Access Token.\n\nThe Token ID is:',
    '012': ''
}

$(document).ready(() => {
    const url = new URL(window.location.href);

    if (url) {
        const searchParams = new URLSearchParams(url.search);

        if (searchParams) {
            const selectedOptionCode = searchParams.get('c');

            $('select[name="subject"] option').each(function(index) {
                const currentOption = $(this);
                const currentOptionCode = currentOption.data('code');

                if(selectedOptionCode && currentOptionCode == selectedOptionCode) {
                    $('select[name="subject"]').val(currentOption.val());

                    if (TEMPLATES[currentOptionCode]) {
                        setTimeout(function() {
                            $('textarea').focus().val(TEMPLATES[currentOptionCode] + '\n\n');
                        }, 0);
                    }
                }
            });
        }
    }

    if(window.location.hash) {
        if (window.location.hash.substring(1) === 'sent') {
            $('form').hide();
            $('div.sent').show();
            return ;
        }
    }

    if(cookiePolicyManager.isCookiePolicyAccepted()) {
        $('form').SimpleFormValidator();
        $('form').show();

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
                        currentForm.data('is-valid', 'true');
                        // Dispatch change event
                        currentForm.find(':input').trigger('change');
                    }
                });
            }
        });
    });
}


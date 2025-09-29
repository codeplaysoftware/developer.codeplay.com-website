// Describes a download
class DownloadDescriptor {
    /**
     * Constructor.
     * @param productTag
     * @param productVariantTag
     * @param productVariantVersionTag
     * @param hash
     * @param segments
     * @param licenseAcceptanceRequired
     */
    constructor(productTag,
                productVariantTag,
                productVariantVersionTag,
                hash,
                segments,
                licenseAcceptanceRequired = false) {
        this.productTag = productTag;
        this.productVariantTag = productVariantTag;
        this.productVariantVersionTag = productVariantVersionTag;
        this.hash = hash;
        this.segments = segments;
        this.skipLicenseAgreement = licenseAcceptanceRequired;
    }

    /**
     * Deserialize from array.
     * @param serializedContent
     * @returns {DownloadDescriptor}
     */
    static deserialize(serializedContent) {
        return new this(
            serializedContent['productTag'],
            serializedContent['productVariantTag'],
            serializedContent['productVariantVersionTag'],
            serializedContent['hash'],
            serializedContent['segments'],
            serializedContent['skipLicenseAgreement']
        );
    }

    /**
     * Deserialize from array.
     * @param serializedContent
     * @returns {DownloadDescriptor}
     */
    static deserializeArray(serializedContent) {
        const downloads = [];

        for(const serializedDownload of serializedContent) {
            downloads.push(
                this.deserialize(serializedDownload))
        }

        return downloads;
    }
}

// Download Selector Plugin
$.fn.DynamicDownloadSelector = function (downloads) {
    // Process the segments
    const fDownloads = downloads;

    // Selected filters
    let fSelectedFilters = {};

    // List of linked elements
    let fElements = {};

    // Current Element Count
    let fElementCount = 0;

    /**
     * Constructor.
     */
    function init() {
        for (const segment in downloads[0]['segments']) {
            setSelectionElement(
                segment, $('#download-chooser select[name="' + segment + '"]'));
        }

        // If ?v=2.1.0 is set, this will attempt to select it from a version form
        const params = new window.URLSearchParams(window.location.search);
        for (const segment in downloads[0]['segments']) {
            if (segment == 'version' && params.has('v')) {
                const element = $('#download-chooser select[name="' + segment + '"]');

                element.find('option').each(function(index) {
                    if ($(this).val().includes(params.get('v'))) {
                        element.val($(this).val());
                        element.trigger('change');
                    }
                });
            }
        }
    }

    /**
     * Populate a select element with items.
     * @param element
     * @param items
     */
    function populateSelectElement(element, items) {
        element.empty();

        items = [...new Set(items)];

        if(items.length > 0) {
            element.attr('disabled', false);
            element.append('<option value="">Please select</option>');
            $.each(items, function(index, value) {
                element.append(
                    '<option value="' + value + '">' + getFriendlyName(value) + '</option>');
            });

            element.trigger('change');
        } else {
            element.attr('disabled', true);
        }
    }

    /**
     * Convert some common names to user-friendly names.
     * @param unfriendlyName
     * @returns {*}
     */
    function getFriendlyName(unfriendlyName) {
        unfriendlyName = unfriendlyName.replace('windows_', 'windows ');
        unfriendlyName = unfriendlyName.replace('ubuntu_', 'ubuntu ');
        unfriendlyName = unfriendlyName.replace('centos_', 'centos ');
        unfriendlyName = unfriendlyName.replace('linux_', 'linux ');
        unfriendlyName = unfriendlyName.replace('yocto_', 'yocto ');

        unfriendlyName = unfriendlyName.replace('windows', 'Windows&reg;');
        unfriendlyName = unfriendlyName.replace('ubuntu', 'Ubuntu');
        unfriendlyName = unfriendlyName.replace('centos', 'CentOS');
        unfriendlyName = unfriendlyName.replace('linux', 'Linux');
        unfriendlyName = unfriendlyName.replace('yocto', 'Yocto');
        unfriendlyName = unfriendlyName.replace('gnu', 'GNU');
        unfriendlyName = unfriendlyName.replace('msvc', 'MSVC');
        unfriendlyName = unfriendlyName.replace('arm', 'ARM');
        unfriendlyName = unfriendlyName.replace('aarch64', 'AArch64');
        unfriendlyName = unfriendlyName.replace('x86_64', 'x86-64');
        unfriendlyName = unfriendlyName.replace('cuda', 'CUDA&reg;');
        return unfriendlyName;
    }

    /**
     * This function retrives a list of specific download segments (such as os, version or arch). You can also
     * provide it a list of filters. Only downloads that pass the filters will be returned.
     * @param segment
     * @param selectionFilters
     * @returns {Array}
     */
    function getSelections(segment, selectionFilters = null) {
        if(!fDownloads) {
            return ;
        }

        let found = [];
        for(const download of fDownloads) {
            let matched = true;

            if(selectionFilters) {
                for (const [key, value] of Object.entries(selectionFilters)) {
                    if(value == null) {
                        continue;
                    }

                    if(download.segments[key] != value) {
                        matched = false;
                    }
                }
            }

            if(matched) {
                found.push(download);
            }
        }

        if(!segment) {
            return found[0];
        }

        const scopedFound = [];
        for (const currentDownload of found) {
            scopedFound.push(
                currentDownload.segments[segment]);
        }

        // Return sorted
        return scopedFound;
    }

    /**
     * Refresh the select controls.
     * @param selectedElement
     */
    function refreshSelectionElements(selectedElement) {
        for (const [segment, element] of Object.entries(fElements)) {
            if (element.order > selectedElement.order) {
                fSelectedFilters[segment] = null;
                populateSelectElement(element.element, [])
            }
        }

        for (const [segment, element] of Object.entries(fElements)) {
            if (element.order > selectedElement.order) {
                const selectedValue = selectedElement.element.find(':selected').val();

                if (selectedValue != '') {
                    if (element.order == selectedElement.order + 1) {
                        fSelectedFilters[segment] = null;

                        const items = getSelections(segment, fSelectedFilters);
                        populateSelectElement(element.element, items);
                    }
                }
            }
        }
    }

    /**
     * Set a selection element, registering event tracking.
     * @param segment
     * @param element
     */
    function setSelectionElement(segment, element) {
        fElementCount = fElementCount + 1;

        fElements[segment] = {
            'element': element,
            'order': fElementCount
        };

        element.find('option').remove();

        if(fElementCount == 1) {
            populateSelectElement(
                element, getSelections(segment));
        }

        element.on('change', function() {
            fSelectedFilters[segment] = this.value;

            // Final select item has been selected
            if(fElementCount == fElements[segment].order && element.find(':selected').val() != '') {
                const download = getSelections(null, fSelectedFilters);

                // Not all downloads required a license agreement
                if (download['skipLicenseAgreement']) {
                    window.location = '?state=licenseAccepted&downloadHash=' + download.hash;
                } else {
                    const licenseAgreementLoader = $('body').LicenseAgreementLoader(
                        download['productTag'],
                        download['productVariantTag'],
                        download['productVariantVersionTag'],
                        () => {
                            window.location = '?state=licenseAccepted&downloadHash=' + download.hash
                        },
                        () => {
                            refreshSelectionElements(fElements[Object.keys(fElements)[0]]);
                        }
                    ).open();
                }
            } else {
                refreshSelectionElements(fElements[segment]);
            }
        });
    }

    init();

    // Return reference
    return this;
}

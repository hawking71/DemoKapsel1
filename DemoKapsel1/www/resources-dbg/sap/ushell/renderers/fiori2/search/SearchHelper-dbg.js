// iteration 0 ok
/* global jQuery,sap, $, window */

(function() {
    "use strict";

    jQuery.sap.declare('sap.ushell.renderers.fiori2.search.SearchHelper');
    var module = sap.ushell.renderers.fiori2.search.SearchHelper = {};

    // =======================================================================
    // Regex Tester
    // =======================================================================            
    module.Tester = function() {
        this.init.apply(this, arguments);
    };
    module.Tester.prototype = {

        init: function(sSearchTerms) {

            // normalize searchterms in string format
            sSearchTerms = sSearchTerms || "*";

            // escape special chars
            sSearchTerms = sSearchTerms.replace(/([.+?^=!:${}()|\[\]\/\\])/g, "\\$1");

            // store tokenized search terms array
            this.aSearchTerms = this.tokenizeSearchTerms(sSearchTerms);
            for (var j = 0; j < this.aSearchTerms.length; ++j) {
                // * has special meaning in enterprise search context
                this.aSearchTerms[j] = this.aSearchTerms[j].replace(/\*/g, "[^\\s]+");
                // check if search term is Chinese (in unicode Chinese characters interval).
                var bIsChinese = this.aSearchTerms[j].match(/[\u3400-\u9faf]/) !== null ? true : false;
                if (bIsChinese) {
                    // match any place of the word, case insensitive
                    // \b \w are evil regarding unicode
                    this.aSearchTerms[j] = new RegExp(this.aSearchTerms[j], 'ig');
                } else {
                    // only match beginnings of the word, case insensitive
                    // \b \w are evil regarding unicode
                    this.aSearchTerms[j] = new RegExp('(?:^|\\s)' + this.aSearchTerms[j], 'ig');
                }

            }

        },

        // If the text to be searched contains all of search terms, 
        // return object with match flag and highlighted text or space in case of not match
        test: function(sText2BeSearched) {
            var oReturn = {
                bMatch: false,
                sHighlightedText: ''
            };

            if (!sText2BeSearched) {
                return oReturn;
            }

            this.initializeBoldArray(sText2BeSearched);

            // global flag is there is any bold char
            this.globalBold = false;
            var oRegSearchTerm;
            var bMatch = false;
            var aMatchResult;


            for (var j = 0; j < this.aSearchTerms.length; ++j) {
                // only match beginnings of the word, case insensitive
                oRegSearchTerm = this.aSearchTerms[j];
                bMatch = false;
                // match?
                while ((aMatchResult = oRegSearchTerm.exec(sText2BeSearched)) !== null) {
                    bMatch = true;
                    if (oRegSearchTerm.toString().indexOf('(?:^|\\s)[^\\s]*') === -1) {
                        //aMatchResult.index: the start position of matching term
                        //oRegSearchTerm.lastIndex: the start position of next search
                        this.markBoldArray(aMatchResult.index, oRegSearchTerm.lastIndex);
                    }
                }

                if (bMatch === false) {
                    return oReturn;
                }

            }

            // search terms have logical "and" relation, all of them must be available in text
            oReturn.bMatch = true;
            oReturn.sHighlightedText = this.render(sText2BeSearched);

            return oReturn;

        },

        //tokenize search terms splitted by spaces
        tokenizeSearchTerms: function(terms) {
            var termsSeparatedBySpace = terms.split(" ");
            var newTerms = [];
            //Split search terms with space and wildcard into array
            $.each(termsSeparatedBySpace, function(i, termSpace) {
                termSpace = $.trim(termSpace);
                if (termSpace.length > 0 && termSpace !== '.*') {
                    //                var termsSeparatedByWildcard = termSpace.split("*");
                    //                $.each(termsSeparatedByWildcard, function (i, term) {
                    //                    if (term.length > 0) {
                    //                        newTerms.push(term);
                    //                    }
                    //                });
                    newTerms.push(termSpace);
                }
            });
            return newTerms;
        },

        // initialize the bold array 
        initializeBoldArray: function(sText) {
            // create array which stores flag whether character is bold or not
            this.bold = new Array(sText.length);
            for (var i = 0; i < this.bold.length; ++i) {
                this.bold[i] = false;
            }
        },

        // mark bold array
        markBoldArray: function(nStartIndex, nEndIndexPlus1) {
            // mark bold characters in global array 
            for (var i = nStartIndex; i < nEndIndexPlus1; i++) {
                this.bold[i] = true;
                this.globalBold = true;
            }
        },

        // render original text with <b> tag
        render: function(sOriginalText) {

            // short cut if there is nothing to do
            if (!this.globalBold) {
                return sOriginalText;
            }

            // highlight sOriginalText according to information in this.bold
            var bold = false;
            var result = [];
            var start = 0;
            var i;
            for (i = 0; i < sOriginalText.length; ++i) {
                if ((!bold && this.bold[i]) || // check for begin of bold sequence
                    (bold && !this.bold[i])) { // check for end of bold sequence
                    result.push(sOriginalText.substring(start, i));
                    if (bold) {
                        // bold section ends
                        result.push("</b>");
                    } else {
                        // bold section starts
                        result.push("<b>");
                    }
                    bold = !bold;
                    start = i;
                }
            }

            // add last part
            result.push(sOriginalText.substring(start, i));
            if (bold) {
                result.push("</b>");
            }
            return result.join("");
        }
    };

    // =======================================================================
    // decorator for delayed execution 
    // =======================================================================            
    module.delayedExecution = function(originalFunction, delay) {
        var timerId = null;
        var decorator = function() {
            var args = arguments;
            var self = this;
            if (timerId) {
                window.clearTimeout(timerId);
            }
            timerId = window.setTimeout(function() {
                timerId = null;
                originalFunction.apply(self, args);
            }, delay);
        };
        decorator.abort = function() {
            if (timerId) {
                window.clearTimeout(timerId);
            }
        };
        return decorator;
    };

    // =======================================================================
    // decorator for refusing outdated requests
    // =======================================================================            
    module.refuseOutdatedRequests = function(originalFunction, requestGroupId) {
        var maxRequestId = 0;
        var decorator = function() {
            var args = arguments;
            var self = this;
            var requestId = ++maxRequestId;
            var deferred = jQuery.Deferred();
            //console.log(requestGroupId + ' start ', requestId);
            originalFunction.apply(self, args).done(function() {
                if (requestId !== maxRequestId) {
                    //console.log(requestGroupId + ' throw ', requestId, ' because max', maxRequestId);
                    return; // throw away outdated requests                
                }
                //console.log(requestGroupId + ' accept ', requestId);
                deferred.resolve.apply(deferred, arguments);
            }).fail(function() {
                if (requestId !== maxRequestId) {
                    return;
                } // throw away outdated requests
                deferred.reject.apply(deferred, arguments);
            });
            return deferred;
        };
        decorator.abort = function() {
            ++maxRequestId;
            //console.log(id + ' abort', maxRequestId);
        };
        if (requestGroupId) {
            module.outdatedRequestAdministration.registerDecorator(requestGroupId, decorator);
        }
        return decorator;
    };

    // =======================================================================
    // abort all requests for a given requestGroupId
    // =======================================================================            
    module.abortRequests = function(requestGroupId) {
        var decorators = module.outdatedRequestAdministration.getDecorators(requestGroupId);
        for (var i = 0; i < decorators.length; ++i) {
            var decorator = decorators[i];
            decorator.abort();
        }
    };

    // =======================================================================
    // administration of outdated request decorators
    // =======================================================================            
    module.outdatedRequestAdministration = {

        decoratorMap: {},

        registerDecorator: function(requestGroupId, decorator) {
            var decorators = this.decoratorMap[requestGroupId];
            if (!decorators) {
                decorators = [];
                this.decoratorMap[requestGroupId] = decorators;
            }
            decorators.push(decorator);
        },

        getDecorators: function(requestGroupId) {
            var decorators = this.decoratorMap[requestGroupId];
            if (!decorators) {
                decorators = [];
            }
            return decorators;
        }

    };

    // =======================================================================
    // <b>, <i> tag unescaper
    // ======================================================================= 
    module.boldTagUnescaper = function(domref) {
        var innerhtml = domref.innerHTML;
        while (innerhtml.indexOf('&lt;b&gt;') + innerhtml.indexOf('&lt;/b&gt;') >= -1) { // while these tags are found
            innerhtml = innerhtml.replace('&lt;b&gt;', '<b>');
            innerhtml = innerhtml.replace('&lt;/b&gt;', '</b>');
        }
        while (innerhtml.indexOf('&lt;i&gt;') + innerhtml.indexOf('&lt;/i&gt;') >= -1) { // while these tags are found
            innerhtml = innerhtml.replace('&lt;i&gt;', '<i>');
            innerhtml = innerhtml.replace('&lt;/i&gt;', '</i>');
        }
        domref.innerHTML = innerhtml;
    };

    // =======================================================================
    // <b> tag unescaper with the help of text() 
    // ======================================================================= 
    module.boldTagUnescaperByText = function(domref) {
        var $d = $(domref);

        // Security check, whether $d.text() contains tags other than <b> and </b>
        var s = $d.text().replace(/<b>/gi, '').replace(/<\/b>/gi, ''); /// Only those two HTML tags are allowed.

        // If not
        if (s.indexOf('<') === -1) {
            $d.html($d.text());
        }
    };

    // =======================================================================
    // emphasize whyfound in case of ellipsis
    // ======================================================================= 
    module.forwardEllipsis4Whyfound = function(domref) {
        var $d = $(domref);

        var posOfWhyfound = $d.html().indexOf("<b>");
        if (posOfWhyfound > -1 && domref.offsetWidth < domref.scrollWidth) {
            var emphasizeWhyfound = "..." + $d.html().substring(posOfWhyfound);
            $d.html(emphasizeWhyfound);
        }
    };


    // =======================================================================
    // Hasher  
    // using window.hasher does not work because
    // hasher always use encodeURL for the whole hash but for example we need
    // - to encode '=' in a value (of name value pair) 
    // but not the '=' separating name and value
    // =======================================================================            
    module.hasher = {

        hash: null,

        setHash: function(hash) {
            if (window.location.hash !== hash) {
                window.location.hash = hash;
                this.hash = hash;
            }
        },

        hasChanged: function() {
            if (this.hash !== window.location.hash) {
                return true;
            }
            return false;
        }
    };


    // =======================================================================
    // Check whether the filter button status is pressed or not
    // ======================================================================= 
    module.loadFilterButtonStatus = function() {
        if (jQuery.sap.storage.isSupported()) {
            var facetsShown = jQuery.sap.storage.get("showSearchFacets");
            if (!facetsShown) {
                return false;
            } else {
                return true;
            }
        } else {
            return false;
        }
    };

    // =======================================================================
    // Set button status in sap storage
    // ======================================================================= 
    module.saveFilterButtonStatus = function(areFacetsShown) {
        if (jQuery.sap.storage.isSupported()) {
            jQuery.sap.storage.put("showSearchFacets", areFacetsShown);
        }
    };

})();

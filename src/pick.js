(function(global, document) {

    var elements,
        parsed,
        _parsed,
        pseudos = {},
        context,
        currentDocument,
        root = document.documentElement;

    var supports_querySelectorAll = !!document.querySelectorAll,
        nativeMatchesSelector = root.matchesSelector || root.msMatchesSelector || root.mozMatchesSelector || root.webkitMatchesSelector;

    if (nativeMatchesSelector) try {
        nativeMatchesSelector.call(root, ':pick');
        nativeMatchesSelector = null;
    } catch(e) {}

    var $p = function(selector, _context, append) {
        elements = append || [];
        context = _context || $p.context || document;

        if (supports_querySelectorAll) try {
            arrayFrom(context.querySelectorAll(selector));
            return elements;
        } catch (e) {}

        currentDocument = context.ownerDocument || context;
        parse(selector);
        find();

        return elements;
    };

    var matchSelector = function(node) {
        var i;

        if ((_parsed = parsed.tag)){
            var nodeName = node.nodeName.toUpperCase();
            if (_parsed === '*') {
                if (nodeName < '@') return false; // Fix for comment nodes and closed nodes
            } else {
                if (nodeName !== _parsed) return false;
            }
        }

        if (parsed.id && node.getAttribute('id') !== parsed.id) {
            return false;
        }

        if ((_parsed = parsed.classes)) {
            var className = (' ' + node.className + ' ');
            for (i = _parsed.length; i--;){
                if (className.indexOf(' ' + _parsed[i] + ' ') < 0) return false;
            }
        }

        if ((_parsed = parsed.pseudos)) {
            for (i = _parsed.length; i--;){
                var pseudoClass = pseudos[_parsed[i]];
                if (!(pseudoClass && pseudoClass.call($p, node))) return false;
            }
        }

        return true;
    };

    var find = function() {

        var parsedId = parsed.id,
            merge = ((parsedId && parsed.tag || parsed.classes || parsed.pseudos)
                || (!parsedId && (parsed.classes || parsed.pseudos))) ?
                arrayFilterAndMerge : arrayMerge;

        if (parsedId) {

            var element = currentDocument.getElementById(parsedId);
            if (element && (currentDocument === context || contains(element))){
                merge([element]);
            }

        } else {

            merge(context.getElementsByTagName(parsed.tag || '*'));

        }

    };

    var node;

    var combinatorsMatchers = {
        ' ': function() {
            while ((node = node.parentNode)) {
                if (matchSelector(node)) {
                    return true;
                }
            }
            return false;
        },
        '>': function() {
            return matchSelector((node = node.parentNode));
        },
        '~': function() {
            while ((node = node.previousSibling)) {
                if (node.nodeType === 1 && matchSelector(node)) {
                    return true;
                }
            }
            return false;
        },
        '+': function() {
            while ((node = node.previousSibling)) {
                if (node.nodeType === 1) {
                    return matchSelector(node);
                }
            }
            return false;
        }
    };

    var match = function(element, selector, _context) {

        if (nativeMatchesSelector) {
            var contextId, hasId;
            if (_context) {
                hasId = !!(contextId = _context.id);
                selector = '#' + (hasId ? contextId : _context.id = '__pickid__') + ' ' + selector;
            }
            try {
                return nativeMatchesSelector.call(element, selector);
            } catch(e) {
            } finally {
                if (_context && !hasId) {
                    _context.removeAttribute('id');
                }
            }
        }

        parse(selector);

        var _parsed = parsed;

        parsed = _parsed[_parsed.length - 1];
        var matches = matchSelector(element);
        node = element;

        for (var i = _parsed.length - 1; i--;) {
            parsed = _parsed[i];
            matches = matches && combinatorsMatchers[_parsed[i+1].combinator]();
        }

        if (_context) {
            context = _context;
            matches = matches && contains(node);
        }

        return matches;
    };

    var token,
        firstSelector,
        reTrim = /^\s+|\s+$/g,
        splitter = /(?:\s*([>+~])\s*|(\s))?([#.:])?([^#.:+>~\s]*)/,
        reUnescape = /\\/g;

    var parse = function(selector) {
        selector = selector.replace(reTrim, '');
        parsed = [], firstSelector = true;
        while ((selector = selector.replace(splitter, parser))) {};
        return parsed;
    };

    var parser = function(all, combinator, spaceCombinator, symbol, name) {

        combinator = combinator || spaceCombinator;
        if (firstSelector || combinator != null){
            firstSelector = false;
            parsed.push(token = {combinator: combinator || ' '});
        }

        name = name.replace(reUnescape, '');
        if (!symbol){
            token.tag = name.toUpperCase();
        } else if (symbol === '#') {
            token.id = name;
        } else if (symbol === '.') {
            if (token.classes) {
                token.classes.push(name);
            } else {
                token.classes = [name];
            }
        } else if (symbol === ':') {
            if (token.pseudos) {
                token.pseudos.push(name);
            } else {
                token.pseudos = [name];
            }
        }
        return '';
    };

    var slice = Array.prototype.slice;
    var arrayFrom = function(collection) {
        elements = slice.call(collection, 0);
    };
    var arrayMerge = function(collection) {
        for (var i = 0, node; node = collection[i++];) {
            elements.push(node);
        }
    };
    try {
        slice.call(root.childNodes, 0);
    } catch(e) {
        arrayFrom = arrayMerge;
    }

    var arrayFilterAndMerge = function(found) {
        for (var i = 0, node; node = found[i++];){
            if (matchSelector(node)) elements.push(node);
        }
    };

    var contains = function(node) {
        do {
            if (node === context) return true;
        } while ((node = node.parentNode));
        return false;
    };

    $p['pseudos'] = pseudos;
    $p['parse'] = parse;
    $p['match'] = match;
    $p['context'] = document;
    global['pick'] = $p;
    if (!global['$p']) global['$p'] = $p;

})(typeof exports == 'undefined' ? this : exports, document);


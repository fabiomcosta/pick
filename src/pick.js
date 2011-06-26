/**
 * author:  Fabio Miranda Costa
 * github:  fabiomcosta
 * twitter: @fabiomiranda
 * license: MIT-style license
 */

(function(global, document){

    var elements,
        parsed,
        parsedClasses,
        parsedPseudos,
        pseudos = {},
        context,
        currentDocument,
        reTrim = /^\s+|\s+$/g;

    var supports_querySelectorAll = !!document.querySelectorAll;

    var $p = function(selector, _context, append){
        elements = append || [];
        context = _context || $p.context;
        if (supports_querySelectorAll){
            try{
                arrayFrom(context.querySelectorAll(selector));
                return elements;
            } catch (e){}
        }

        currentDocument = context.ownerDocument || context;
        parse(selector.replace(reTrim, ''));
        find();

        return elements;
    };

    var matchSelector = function(node){
        if (parsed.tag){
            var nodeName = node.nodeName.toUpperCase();
            if (parsed.tag == '*'){
                if (nodeName < '@') return false; // Fix for comment nodes and closed nodes
            } else {
                if (nodeName != parsed.tag) return false;
            }
        }

        if (parsed.id && node.getAttribute('id') != parsed.id){
            return false;
        }

        if ((parsedClasses = parsed.classes)){
            var className = (' ' + node.className + ' ');
            for (var i = parsedClasses.length; i--;){
                if (className.indexOf(' ' + parsedClasses[i] + ' ') < 0) return false;
            }
        }

        if ((parsedPseudos = parsed.pseudos)){
            for (var i = parsedPseudos.length; i--;){
                var pseudoClass = pseudos[parsedPseudos[i]];
                if (!(pseudoClass && pseudoClass.call($p, node))) return false;
            }
        }

        return true;
    };

    var find = function(){

        var parsedId = parsed.id,
            merge = ((parsedId && parsed.tag || parsed.classes || parsed.pseudos)
                || (!parsedId && (parsed.classes || parsed.pseudos))) ?
                arrayFilterAndMerge : arrayMerge;

        if (parsedId){

            var el = currentDocument.getElementById(parsedId);
            if (el && (currentDocument === context || contains(el))){
                merge([el]);
            }

        } else {

            merge(context.getElementsByTagName(parsed.tag || '*'));

        }

    };

    var obj, firstSelector, reUnescape = /\\/g;

    var parse = function(selector){
        parsed = [], firstSelector = true;
        while ((selector = selector.replace(/(?:\s*([>+~])\s*|(\s))?([#.:])?([^#.:+>~\s]*)/, parser))){};
        return parsed;
    };

    var parser = function(all, combinator, spaceCombinator, simbol, name){

        combinator = combinator || spaceCombinator;
        if (firstSelector || combinator != null){
            firstSelector = false;
            parsed.push(obj = {combinator: combinator || ' '});
        }

        name = name.replace(reUnescape, '');
        if (!simbol){
            obj.tag = name.toUpperCase();
        } else if (simbol == '#'){
            obj.id = name;
        } else if (simbol == '.'){
            if (obj.classes){
                obj.classes.push(name);
            } else {
                obj.classes = [name];
            }
        } else if (simbol == ':'){
            if (obj.pseudos){
                obj.pseudos.push(name);
            } else {
                obj.pseudos = [name];
            }
        }
        return '';
    };

    var slice = Array.prototype.slice;
    var arrayFrom = function(collection){
        elements = slice.call(collection, 0);
    };
    var arrayMerge = function(collection){
        for (var i = 0, node; node = collection[i++];){
            elements.push(node);
        }
    };
    try {
        slice.call(document.documentElement.childNodes, 0);
    } catch(e) {
        arrayFrom = arrayMerge;
    }

    var arrayFilterAndMerge = function(found){
        for (var i = 0, node; node = found[i++];){
            if (matchSelector(node)) elements.push(node);
        }
    };

    var contains = function(node){
        do {
            if (node === context) return true;
        } while ((node = node.parentNode));
        return false;
    };

    $p['pseudos'] = pseudos;
    $p['parse'] = parse;
    $p['context'] = document;
    global['pick'] = $p;
    if (!global['$p']) global['$p'] = $p;

})(this.export || this, document);

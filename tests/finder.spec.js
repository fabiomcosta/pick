var finderSpecs = function(context){

describe('Finder', function() {

    var $p = pick;
    $p.context = context.document;

    beforeEach(function() {
        this.addMatchers({
            toFind: function(n){
                var found = $p(this.actual).length;
                this.message = function() {
                    return [
                        "Expected " + this.actual + " to find " + n + " but found " + found,
                        "Expected " + this.actual + " not to find " + n
                    ];
                };
                return found == n;
            }
        });
    });

    it('should select nothing if passing an empty selector', function() {
        expect('').toFind(0);
        expect(false).toFind(0);
        expect(null).toFind(0);
        expect(undefined).toFind(0);
    });

    it('should select elements by id', function() {
        expect('#title').toFind(1);
        expect('#other').toFind(0);
        expect('#divid').toFind(1);
        expect('#divid2').toFind(1);
        expect($p('#divid', $p('#divid2')[0]).length).toEqual(0);
    });

    it('should select elements by tagName', function() {
        var h2Collection = $p('h2');
        expect(h2Collection instanceof Array).toEqual(true);
        expect(h2Collection.length).toEqual(19);
        expect('ul').toFind(22);
        expect($p('div', $p('#divid')[0]).length).toEqual(4);
    });

    it('should select elements by className', function() {
        var classVcardCollection = $p('.vcard');
        expect(classVcardCollection instanceof Array).toEqual(true);
        expect(classVcardCollection.length).toEqual(5);
        expect('.pattern').toFind(40);
        expect('.example').toFind(43);
        expect($p('.inner', $p('.wrapper')[0]).length).toEqual(1);
    });

    it('should select elements by tagName and id', function() {
        expect('h1#title').toFind(1);
        expect('div#title').toFind(0);
    });

    it('should select elements by tagName and className', function() {
        expect('div.wrapper').toFind(4);
        expect('b.wrapper').toFind(1);
    });

    it('should select elements with untrimed selectors', function() {
        expect(' #title ').toFind(1);
        expect(' ul ').toFind(22);
        expect(' .example ').toFind(43);
        expect(' h1#title ').toFind(1);
        expect(' abbr.some#abbr-id.classes.here').toFind(1);
    });

    it('should select elements with the added custom pseudo classes', function() {
        $p.pseudos['contains-cheese'] = function(node) {
            return node.innerHTML.indexOf('cheese') > -1;
        };
        expect('div:contains-cheese').toFind(1);
    });
    it('should throw an error if the pseudo-class is not defined', function() {
        expect(function() { $p('div:non-existent-pseudo'); }).toThrow('pick: pseudo-class ":non-existent-pseudo" is not defined.');
    });

    describe('Extra pseudo classes contained on the uSelectorPseudoClasses', function() {

        it('should find elements by the defined pseudo-classes', function() {
            expect('a:empty').toFind(30);

            expect('p:first-child').toFind(54);
            expect('p:last-child').toFind(19);
            expect('p:only-child').toFind(3);

            expect('p:first-of-type').toFind(57);
            expect('p:last-of-type').toFind(57);
            expect('p:only-of-type').toFind(15);

            expect(':disabled').toFind(0);
            expect(':checked').toFind(0);
            expect(':selected').toFind(0);
        });

    });

    describe('Selectors with combinators', function() {
        it('should find elements when using the " " combinator', function() {
            expect('div i.nest.a1').toFind(1);
            expect('div i.nest.a1 b').toFind(6);
            expect('#divid span').toFind(0);
        });

        it('should find elements when using the ">" combinator', function() {
            expect('div > i.nest.a1').toFind(1);
            expect('div > i.nest.a2').toFind(0);
            expect('#divid2 > div').toFind(2);
        });

        it('should find elements when using the "+" combinator', function() {
            expect('#divid2 > a + div.wrapper').toFind(1);
            expect('#divid2 > a + span').toFind(0);
        });

        it('should find elements when using the "~" combinator', function() {
            expect('#divid2 > a ~ div.wrapper').toFind(1);
            expect('#divid2 > a ~ div').toFind(2);
            expect('#divid2 > a ~ span').toFind(0);
        });
    });


    describe('Selectors with combinators and context', function() {
        it('should find elements when using the " " combinator', function() {
            expect($p('#divid1', $p('#divid1')[0]).length).toEqual(0);
        });

        it('should find elements when using the ">" combinator', function() {
            expect($p('> #divid2', $p('#divid1')[0]).length).toEqual(1);
            expect($p('> #divid1', $p('#divid1')[0]).length).toEqual(0);
        });

        it('should find elements when using the "+" combinator', function() {
            expect($p('+ div', $p('#divid2 > .wrapper')[0]).length).toEqual(1);
        });

        it('should find elements when using the "~" combinator', function() {
            expect($p('~ div', $p('#divid2 > a')[0]).length).toEqual(2);
        });

        it('should find elements when using the "+" combinator with a compound selector', function() {
            expect($p('+ div div', $p('#divid2 > .wrapper')[0]).length).toEqual(1);
        });
    });
});

};

describe('parser', function(){

    it('should parse a simple selector', function(){
        expect($p.parse('#id')).toEqual([{combinator: ' ', id: 'id'}]);
        expect($p.parse('tag#id')).toEqual([{combinator: ' ', tag: 'TAG', id: 'id'}]);
        expect($p.parse('#id.class.class2')).toEqual([{
            combinator: ' ',
            id: 'id',
            classes: ['class', 'class2']
        }]);
        expect($p.parse('#foo:bar:baz')).toEqual([{
            combinator: ' ',
            id: 'foo',
            pseudos: ['bar', 'baz']
        }]);
    });

    it('should parse correctly with some problematic characters', function(){
        expect($p.parse('#foo\\,bar')).toEqual([{combinator: ' ', id: 'foo,bar'}]);
    });

    it('should parse a complex selector', function(){
        expect($p.parse('> #id')).toEqual([{combinator: '>', id: 'id'}]);
        expect($p.parse('>#id')).toEqual([{combinator: '>', id: 'id'}]);
        expect($p.parse('> #id .class')).toEqual([
            {combinator: '>', id: 'id'},
            {combinator: ' ', classes: ['class']},
        ]);
        expect($p.parse('>#id+.class')).toEqual([
            {combinator: '>', id: 'id'},
            {combinator: '+', classes: ['class']},
        ]);
        expect($p.parse('+ #id ~ .class > :foo :bar.zaz')).toEqual([
            {combinator: '+', id: 'id'},
            {combinator: '~', classes: ['class']},
            {combinator: '>', pseudos: ['foo']},
            {combinator: ' ', classes: ['zaz'], pseudos: ['bar']},
        ]);
    });

});

export default {
    nodes: [
        {
            name: 'Math.E',
            code: 'function(){return Math.E;}',
            inputs: [],
            outputs: [
                {
                    id: 0,
                    name: 'float',
                    type: 'float',
                    mark: 'f0'
                }
            ],
            position: {
                x: -200,
                y: -200
            }
        },
        {
            name: 'Math.PI',
            code: 'function(){return Math.PI;}',
            inputs: [],
            outputs: [
                {
                    id: 0,
                    name: 'float',
                    type: 'float',
                    mark: 'f0'
                }
            ],
            position: {
                x: -200,
                y: 200
            }
        },
        {
            name: 'Addition',
            code: 'function(x,y){return x+y;}',
            inputs: [
                {
                    id: 0,
                    name: 'float',
                    type: 'float',
                    mark: 'f0'
                },
                {
                    id: 1,
                    name: 'float',
                    type: 'float',
                    mark: 'f1'
                }
            ],
            outputs: [
                {
                    id: 0,
                    name: 'float',
                    type: 'float',
                    mark: 'f0'
                }
            ],
            position: {
                x: 0,
                y: 0
            }
        },
        {
            name: 'Math.floor',
            code: 'function(x){return Math.floor(x);}',
            inputs: [
                {
                    id: 0,
                    name: 'float',
                    type: 'float',
                    mark: 'f0'
                },
                {
                    id: 1,
                    name: 'float',
                    type: 'float',
                    mark: 'f1'
                }
            ],
            outputs: [
                {
                    id: 0,
                    name: 'int',
                    type: 'int',
                    mark: 'i0'
                }
            ],
            position: {
                x: 200,
                y: 0
            }
        },
    ]
}
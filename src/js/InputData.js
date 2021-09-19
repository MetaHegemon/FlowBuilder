export default {
    nodes: [
        {
            name: 'Math.E',
            indicator: 'A',
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
                y: -250
            },
        },
        {
            name: 'Math.PI',
            indicator: 'B',
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
                y: 50
            }
        },
        {
            name: 'Addition',
            indicator: 'C',
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
                y: -50
            }
        },
        {
            name: 'Math.floor',
            indicator: 'D',
            code: 'function(x){return Math.floor(x);}',
            inputs: [
                {
                    id: 0,
                    name: 'float',
                    type: 'float',
                    mark: 'f0'
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
                y: -50
            }
        },
        {
            name: 'Color',
            indicator: 'G',
            code: 'function(x){return Math.floor(x);}',
            inputs: [],
            outputs: [
                {
                    id: 0,
                    name: 'color',
                    type: 'color',
                    mark: 'c0'
                }
            ],
            position: {
                x: -250,
                y: 300
            }
        },
        {
            name: 'Color',
            indicator: 'F',
            code: 'function(x){return Math.floor(x);}',
            inputs: [],
            outputs: [
                {
                    id: 0,
                    name: 'color',
                    type: 'color',
                    mark: 'c0'
                }
            ],
            position: {
                x: -250,
                y: 150
            }
        },
        {
            name: 'Mix',
            indicator: 'E',
            code: 'function(x){return Math.floor(x);}',
            inputs: [
                {
                    id: 0,
                    name: 'color',
                    type: 'color',
                    mark: 'c0'
                },
                {
                    id: 1,
                    name: 'color',
                    type: 'color',
                    mark: 'c1'
                },
                {
                    id: 2,
                    name: 'color',
                    type: 'color',
                    mark: 'c2'
                },
                {
                    id: 3,
                    name: 'color',
                    type: 'color',
                    mark: 'c3'
                },
                {
                    id: 4,
                    name: 'color',
                    type: 'color',
                    mark: 'c4'
                },
                {
                    id: 5,
                    name: 'color',
                    type: 'color',
                    mark: 'c5'
                }
            ],
            outputs: [
                {
                    id: 0,
                    name: 'color',
                    type: 'color',
                    mark: 'c0'
                },
                {
                    id: 1,
                    name: 'color',
                    type: 'color',
                    mark: 'c1'
                },
                {
                    id: 2,
                    name: 'color',
                    type: 'color',
                    mark: 'c2'
                },
                {
                    id: 3,
                    name: 'color',
                    type: 'color',
                    mark: 'c3'
                },
                {
                    id: 4,
                    name: 'color',
                    type: 'color',
                    mark: 'c4'
                },
                {
                    id: 5,
                    name: 'color',
                    type: 'color',
                    mark: 'c5'
                }
            ],
            position: {
                x: 0,
                y: 300
            }
        },
        {
            name: 'Spread',
            indicator: 'H',
            code: 'function(x){return Math.floor(x);}',
            inputs: [
                {
                    id: 0,
                    name: 'color',
                    type: 'color',
                    mark: 'c0'
                },

            ],
            outputs: [
                {
                    id: 0,
                    name: 'color',
                    type: 'color',
                    mark: 'c0'
                },
                {
                    id: 1,
                    name: 'color',
                    type: 'color',
                    mark: 'c1'
                },
                {
                    id: 2,
                    name: 'color',
                    type: 'color',
                    mark: 'c2'
                },
                {
                    id: 3,
                    name: 'color',
                    type: 'color',
                    mark: 'c3'
                },
                {
                    id: 4,
                    name: 'color',
                    type: 'color',
                    mark: 'c4'
                },
                {
                    id: 5,
                    name: 'color',
                    type: 'color',
                    mark: 'c5'
                }
            ],
            position: {
                x: 150,
                y: 300
            }
        },

    ]
}
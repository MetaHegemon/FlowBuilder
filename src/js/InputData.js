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
                x: -800,
                y: -400
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
                x: -850,
                y: 0
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
                x: -800,
                y: 500
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
                x: -300,
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
                x: -300,
                y: 500
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
                x: -350,
                y: 300
            }
        },
        {
            name: 'Generic Node2',
            indicator: 'B',
            code: 'function(x){return Math.floor(x);}',
            inputs: [
                {
                    id: 0,
                    name: 'input_port_one',
                    type: 'color',
                    mark: 'b1'
                },
                {
                    id: 1,
                    name: 'input_port_two',
                    type: 'color',
                    mark: 'b2'
                },
                {
                    id: 2,
                    name: 'input_port_three',
                    type: 'color',
                    mark: 'b3'
                },
                {
                    id: 3,
                    name: 'input_port_four',
                    type: 'color',
                    mark: 'b4'
                },
                {
                    id: 4,
                    name: 'input_port_five',
                    type: 'color',
                    mark: 'b5'
                }
            ],
            outputs: [
                {
                    id: 0,
                    name: 'output_port_one',
                    type: 'color',
                    mark: '0b'
                },
                {
                    id: 1,
                    name: 'output_port_two',
                    type: 'color',
                    mark: '1a'
                },
                {
                    id: 2,
                    name: 'output_port_three',
                    type: 'color',
                    mark: '2a'
                },
                {
                    id: 3,
                    name: 'output_port_four',
                    type: 'color',
                    mark: '3a'
                },
                {
                    id: 4,
                    name: 'output_port_five',
                    type: 'color',
                    mark: '4a'
                },
                {
                    id: 5,
                    name: 'output_port_six',
                    type: 'color',
                    mark: '5a'
                }
            ],
            position: {
                x: 200,
                y: 600
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
                x: 700,
                y: 350
            }
        },

    ]
}
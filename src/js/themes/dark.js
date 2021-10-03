export default {
    scene: {
        backgroundColor: '#7c7c7c'
    },
    line: {
        colorOnActive: '#b6b6b6',
        selectedColor: '#da0000'
    },
    node: {
        title: {
            fontColor: '#e3e3e3',
            fontSelectedColor: '#f8bd59',
        },
        indicator: {
            fontColor: '#e3e3e3',
            miniFontColor: '#ffffff'
        },
        header: {
            collapse: {
                fontColor: '#ffffff',
            },
            play: {
                fontColor: '#ffffff',
            },
            menu: {
                fontColor: '#ffffff',
            }
        },
        mount: {
            front: {
                headColor: '#e3c43a',
                bodyColor: '#525252',
            },
            back: {
                color: '#ffffff',
                selectedColor: '#f8bd59'
            },
        },
        port: {
            label: {
                hoverColor: '#f8bd59',
            },
        },
        footer: {
            color: '#8d8d8d',
            label: {
                color: '#eeeeee',
                hoverColor: '#2491F6',
            }
        },
        portTypes: {
            float: {
                connectorColor: '#60e78e',
                labelColor: '#eeeeee',
                markFontColor: '#000000',
                markColor: '#60e78e'
            },
            int: {
                connectorColor: '#97a6e5',
                labelColor: '#eeeeee',
                markFontColor: '#000000',
                markColor: '#97a6e5'
            },
            color: {
                connectorColor: '#e9d866',
                labelColor: '#eeeeee',
                markFontColor: '#000000',
                markColor: '#e9d866'
            },
            pseudo: {
                connectorColor: '#dadada',
                labelColor: '#eeeeee',
                markFontColor: '#000000',
                markColor: '#dadada'
            }
        }
    },
    fontPaths: {
        mainNormal: './fonts/Raleway-Regular.ttf',
        mainMedium: './fonts/Raleway-Medium.ttf',
    }
};
export default {
    //TODO dive this and move to each component
    defaultTheme: 'light',
    animation:{
        nodeCollapseTime: 150,              //milliseconds
        portHideTime: 100,
        footerLabelHideTime: 150,
        caretBlinkingTime: 300,             //время мигания каретки
        failEditingTextTime: 300,           //время мигания красным при неудачном вводе текста
    },
    layers: {                               //слои(координаты по Z) для элементов ноды
        nodeStep: 0.01,                      //шаг между нодами
        node: {
            backMount: 0,
            title: 0,
            indicator: 0.003,
            frontMount: 0.001,
            shield: 0,
            header: 0.002,
            widthResizer: 0.004,
            footerLabel: 0.002,
            bigMount: 0.005
        },
        port: {
            self: 0.002,
            magnet: 0,
            connector: 0.01,
            markMount: 0,
            markLabel: 0.001,
            label: 0
        },
        topForNode: 10,
        line: {
            fat: -1,
            thin: -1.001
        },
        lineMark: {
            pointer: 0.002,
            big: 0,
            small: 0.001
        },
        watchPoint: {   //слой от 0 до 0.005
            self: 20,
            bigMount: 0.005,
            back: 0,
            front: 0.001,
            controlPanelTop: 0.002,
            controlPanelBottom: 0.002,
            copyButton: 0,
            exportButton: 0,
            closeButton: 0,
            iconCornerResize: {
                self: 0,
                text: 0,
                reactor: 0.001
            }
        },
        nodeMenu: {
            self: 24,
            bigMount: 0.005,
            back: 0,
            front: 0.001,
            container: 0.002
        }
    },
    //смещение на которое нужно сдвинуть поинтер после нажатия, что бы зафиксировать движение с зажатой клавишей
    deltaOnPointerInteractive: 0.5,
    fontPaths: {
        awSolid: './fonts/fa-solid-900.ttf',
        awLight: './fonts/fa-light-300.ttf',
        awRegular: './fonts/fa-regular-400.ttf',
        awBrands: './fonts/fa-brands-400.ttf',
        awDuotone: './fonts/fa-duotone-900.ttf'
    },
    lines: {
        thinLineWidth: 2,
        fatLineWidth: 12,
        segments: 40,                   //количество сегментов линии
        mark: {
            positionOnLine: 80,         //расстояние в % от начала линии, на котором строится вотчпоинт
            pointerRadius: 9,           //радиус прозрачной части вотчпоинта, которая нужна для наведения поинтером
            bigCircleRadius: 6.6,         //радиус большого круга
            smallCircleRadius: 5.1        //радиус маленького круга
        }
    },
    watchPoint: {
        defaultWidth: 415,
        defaultHeight: 540,
        minWidth: 200,
        maxWidth: 800,
        minHeight: 200,
        maxHeight: 800,
        backRadius: 3,
        borderSize: 1,
        topControlPanelHeight: 30,
        bottomControlPanelHeight: 40,
        closeButton: {
            marginRight: 20,
            marginTop: 16,
            fontSize: 24
        },
        cornerResize: {
            fontSize: 10,
            width: 23,
            height: 23,
            marginRight: 11.5,
            marginBottom: 11.5,
        },
        copyButton: {
            fontSize: 18,
            leftMargin: 36,
            topMargin: 19
        },
        exportButton: {
            fontSize: 18,
            leftMargin: 104,
            topMargin: 19
        }
    },
    miniNodeMesh: {
        height: 59,
        width: 59,
        roundCornerRadius: 5,
        footerHeight: 3,                //высота подвала без радиусов скругления
        borderSize: 1,
        indicatorMountWidth: 20,
        indicatorMountHeight: 20,
        indicatorFontSize: 18,
        titleFontSize: 12,
        menuButtonFontSize: 8
    },
    nodeMesh: {
        constraints: {
            maxVisiblePorts: 4,         //максимальное поличество видимых портов, включая псевдопорт
        },
        title: {
            fontSize: 21,
            leftMargin: 0,
            bottomMargin: 2
        },
        indicator: {
            fontSize: 21,
            rightMargin: 7,
            bottomMargin: 14
        },
        header: {
            height: 62,
            collapse: {
                fontSize: 15,
                leftMargin: 24.5,
                topMargin: 33
            },
            play: {
                fontSize: 23,
                rightMargin: 34,
                topMargin: 21
            },
            menu: {
                fontSize: 22,
                rightMargin: 16,
                topMargin: 21
            }
        },
        bigMount: {
            radius: 0.01
        },
        mount: {
            width: 293,
            maxWidth: 500,
            minWidth: 200,
            front: {
                headHeight: 6.4,             //без радиуса
            },
            borderSize: 1,
            roundCornerRadius: 4
        },
        port: {
            height: 31,
            connector: {
                width: 14,
                height: 25,
                cornerRadius: 2,
            },
            magnet: {
                width: 22
            },
            label: {
                fontSize: 16,
                topMargin: 10,
                leftMargin: 40,
                letterSpacing: 0.046,
                pseudoLeftMargin: 13,
            },
            mark: {
                width: 30,
                height: 25,
                cornerRadius: 2,
                fontSize: 17,
                leftMargin: 4.5,
                topMargin: 15.5,
                label: {
                    leftMargin: 0,
                    topMargin: -1
                }
            }
        },
        footer: {
            height: 26,                         //высота подвала без радиуса
            label: {
                fontSize: 15,
                leftMargin: 12,
                bottomMargin: 5.1,
                letterSpacing: 0.032
            }
        },

        widthResizer: {
            width: 4                            //ширина ресайзера
        }
    },
    nodeMenu: {
        backRadius: 7,
        borderSize: 1,
        fontSize: 18,
        buttonHeight: 29.1,
        paddingTop: 14.5,
        paddingBottom: 12,
        paddingLeft: 17,
        paddingRight: 67,
        positionOffsetTop: 25.6,
        positionOffsetLeft: -6.3
    },
    three: {
        zoom: {
            /**
             * frustum 700 = 242% figma
             * 100% figma = 289.26 frustum
             */
            default: 1200,                      //зум по умолчанию
            min: 1550,                          //максимальное отдаление
            max: 930,                           //максимальное приближение
            /*default: 700,                      //зум по умолчанию
            min: 1550,                          //максимальное отдаление
            max: 700,                           //максимальное приближение*/
            damping: 0.7,                       //коэффициент инерции
            speed: 5,                           //скорость зума
            fullCollapseBorder: 1450,           //граница зума за которой ноды схлопываются
        }
    }
};
export default {
    defaultTheme: 'light',
    animation:{
        nodeCollapseTime: 150,              //milliseconds
        portHideTime: 150,
        collapseButtonRotateTime: 150,
        footerLabelHideTime: 150,
        caretBlinkingTime: 300,             //время мигания каретки
        failEditingTextTime: 300,           //время мигания красным при неудачном вводе текста
    },
    layers: {                               //слои(координаты по Z) для элементов ноды
        nodeStep: 0.1,                      //шаг между нодами
        backMount: 0,
        title: 0,
        indicator: 0.3,
        frontMount: 0.01,
        header: 0.02,
        port: {
            self: 0.02,
            magnet: 0,
            connector: 0.1,
            markMount: 0,
            markLabel: 0.01,
            label: 0
        },
        footerLabel: 0.01,
        topForNode: 10,
        watchPoint: {
            pointer: 0,
            big: 0.01,
            small: 0.02
        }
    },
    //смещение на которое нужно сдвинуть поинтер после нажатия, что бы зафиксировать движение с зажатой клавишей
    deltaOnPointerInteractive: 3,
    fontPaths: {
        awSolid: './fonts/fa-solid-900.ttf',
        awLight: './fa-light-300.ttf',
        awRegular: './fa-regular-400.ttf',
        awBrands: './fa-brands-400.ttf',
        awDuotone: './fa-duotone-900.ttf'
    },
    lines: {
        lineWidth: 0.002,
        segments: 40,                   //количество сегментов линии
        watchPoint: {
            positionOnLine: 80,         //расстояние в % от начала линии, на котором строится вотчпоинт
            pointerRadius: 8,           //радиус прозрачной части вотчпоинта, которая нужна для наведения поинтером
            bigCircleRadius: 6,         //радиус большого круга
            smallCircleRadius: 3        //радиус маленького круга
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
            rightMargin: 0,
            bottomMargin: 2
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
        rightResizer: {
            width: 4                            //ширина ресайзера
        }
    },
    three: {
        zoom: {
            /**
             * frustum 700 = 242% figma
             * 100% figma = 289.26 frustum
             */
            default: 1000,                      //зум по умолчанию
            min: 3000,                          //максимальное отдаление
            max: 500,                           //максимальное приближение
            damping: 0.8,                       //коэффициент инерции
            speed: 8,                           //скорость зума
            fullCollapseBorder: 1800,           //граница зума за которой ноды схлопываются
        }
    }
};
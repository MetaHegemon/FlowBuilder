import ThemesControl from "./../themes/ThemesControl";


const themesControl =  new ThemesControl('light');

export default {
    themesControl: themesControl,
    theme: themesControl.theme
}
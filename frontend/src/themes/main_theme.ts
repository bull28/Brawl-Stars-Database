import { extendTheme } from "@chakra-ui/react"

const theme: any = extendTheme({
    components: {
        Text: {
            baseStyle: {
                fontWeight: "normal"
            }
        }
    },
    fonts: {
        heading: `"Lilita One (KINGFONT)"`,
        body: `"Lilita One (KINGFONT)"`
    },
    styles: {
        global: {
            '.heading-xs': {
                textShadow: '-1.8px -1.8px 0 #000, 1.8px -1.8px 0 #000, -1.8px 1.8px 0 #000, 1.8px 1.8px 0 #000'
            },
            '.heading-sm': {
                textShadow: '-2.1px -2.1px 0 #000, 2.1px -2.1px 0 #000, -2.1px 2.1px 0 #000, 2.1px 2.1px 0 #000'
            },
            '.heading-md': {
                textShadow: '-2.4px -2.4px 0 #000, 2.4px -2.4px 0 #000, -2.4px 2.4px 0 #000, 2.4px 2.4px 0 #000'
            },
            '.heading-lg': {
                textShadow: '-2.7px -2.7px 0 #000, 2.7px -2.7px 0 #000, -2.7px 2.7px 0 #000, 2.7px 2.7px 0 #000'
            },
            '.heading-xl': {
                textShadow: '-3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000, 3px 3px 0 #000'
            },
            '.heading-2xl': {
                textShadow: '-3.6px -3.6px 0 #000, 3.6px -3.6px 0 #000, -3.6px 3.6px 0 #000, 3.6px 3.6px 0 #000'
            },
            '.heading-3xl': {
                textShadow: '-4.5px -4.5px 0 #000, 4.5px 4.5px 0 #000, -4.5px 4.5px 0 #000, 4.5px 4.5px 0 #000'
            },
            '.heading-4xl': {
                textShadow: '-5.4px -5.4px 0 #000, 5.4px -5.4px 0 #000, -5.4px 5.4px 0 #000, 5.4px 5.4px 0 #000'
            },

        }
    }
});

export default theme;

/*
xs: 12px
sm: 14px
md: 16px 
lg: 18px
xl: 20px
2xl: 24px
3xl: 30px
4xl: 36px
*/
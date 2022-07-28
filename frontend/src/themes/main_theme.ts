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
                textShadow: "-0.3px -0.3px 0 #000, -0.3px 0.1px 0 #000, -0.3px 0.5px 0 #000, -0.3px 0.9px 0 #000, -0.3px 1.2px 0 #000, 0px -0.3px 0 #000, 0px 0.1px 0 #000, 0px 0.5px 0 #000, 0px 0.9px 0 #000, 0px 1.2px 0 #000, 0.3px -0.3px 0 #000, 0.3px 0.1px 0 #000, 0.3px 0.5px 0 #000, 0.3px 0.9px 0 #000, 0.3px 1.2px 0 #000"
            },
            '.heading-sm': {
                textShadow: "-0.35px -0.35px 0 #000, -0.35px 0.05px 0 #000, -0.35px 0.45px 0 #000, -0.35px 0.85px 0 #000, -0.35px 1.25px 0 #000, -0.35px 1.4px 0 #000, 0px -0.35px 0 #000, 0px 0.05px 0 #000, 0px 0.45px 0 #000, 0px 0.85px 0 #000, 0px 1.25px 0 #000, 0px 1.4px 0 #000, 0.35px -0.35px 0 #000, 0.35px 0.05px 0 #000, 0.35px 0.45px 0 #000, 0.35px 0.85px 0 #000, 0.35px 1.25px 0 #000, 0.35px 1.4px 0 #000"
            },
            '.heading-md': {
                textShadow: "-0.4px -0.4px 0 #000, -0.4px 0px 0 #000, -0.4px 0.4px 0 #000, -0.4px 0.8px 0 #000, -0.4px 1.2px 0 #000, -0.4px 1.6px 0 #000, 0px -0.4px 0 #000, 0px 0px 0 #000, 0px 0.4px 0 #000, 0px 0.8px 0 #000, 0px 1.2px 0 #000, 0px 1.6px 0 #000, 0.4px -0.4px 0 #000, 0.4px 0px 0 #000, 0.4px 0.4px 0 #000, 0.4px 0.8px 0 #000, 0.4px 1.2px 0 #000, 0.4px 1.6px 0 #000"
            },
            '.heading-lg': {
                textShadow: "-0.45px -0.45px 0 #000, -0.45px -0.05px 0 #000, -0.45px 0.35px 0 #000, -0.45px 0.75px 0 #000, -0.45px 1.15px 0 #000, -0.45px 1.55px 0 #000, -0.45px 1.8px 0 #000, 0px -0.45px 0 #000, 0px -0.05px 0 #000, 0px 0.35px 0 #000, 0px 0.75px 0 #000, 0px 1.15px 0 #000, 0px 1.55px 0 #000, 0px 1.8px 0 #000, 0.45px -0.45px 0 #000, 0.45px -0.05px 0 #000, 0.45px 0.35px 0 #000, 0.45px 0.75px 0 #000, 0.45px 1.15px 0 #000, 0.45px 1.55px 0 #000, 0.45px 1.8px 0 #000"
            },
            '.heading-xl': {
                textShadow: "-0.5px -0.5px 0 #000, -0.5px -0.1px 0 #000, -0.5px 0.3px 0 #000, -0.5px 0.7px 0 #000, -0.5px 1.1px 0 #000, -0.5px 1.5px 0 #000, -0.5px 1.9px 0 #000, -0.5px 2px 0 #000, 0px -0.5px 0 #000, 0px -0.1px 0 #000, 0px 0.3px 0 #000, 0px 0.7px 0 #000, 0px 1.1px 0 #000, 0px 1.5px 0 #000, 0px 1.9px 0 #000, 0px 2px 0 #000, 0.5px -0.5px 0 #000, 0.5px -0.1px 0 #000, 0.5px 0.3px 0 #000, 0.5px 0.7px 0 #000, 0.5px 1.1px 0 #000, 0.5px 1.5px 0 #000, 0.5px 1.9px 0 #000, 0.5px 2px 0 #000"
            },
            '.heading-2xl': {
                textShadow: "-0.6px -0.6px 0 #000, -0.6px -0.2px 0 #000, -0.6px 0.2px 0 #000, -0.6px 0.6px 0 #000, -0.6px 1px 0 #000, -0.6px 1.4px 0 #000, -0.6px 1.8px 0 #000, -0.6px 2.2px 0 #000, -0.6px 2.4px 0 #000, 0px -0.6px 0 #000, 0px -0.2px 0 #000, 0px 0.2px 0 #000, 0px 0.6px 0 #000, 0px 1px 0 #000, 0px 1.4px 0 #000, 0px 1.8px 0 #000, 0px 2.2px 0 #000, 0px 2.4px 0 #000, 0.6px -0.6px 0 #000, 0.6px -0.2px 0 #000, 0.6px 0.2px 0 #000, 0.6px 0.6px 0 #000, 0.6px 1px 0 #000, 0.6px 1.4px 0 #000, 0.6px 1.8px 0 #000, 0.6px 2.2px 0 #000, 0.6px 2.4px 0 #000"
            },
            '.heading-3xl': {
                textShadow: "-0.75px -0.75px 0 #000, -0.75px -0.35px 0 #000, -0.75px 0.05px 0 #000, -0.75px 0.45px 0 #000, -0.75px 0.85px 0 #000, -0.75px 1.25px 0 #000, -0.75px 1.65px 0 #000, -0.75px 2.05px 0 #000, -0.75px 2.45px 0 #000, -0.75px 2.85px 0 #000, -0.75px 3px 0 #000, 0px -0.75px 0 #000, 0px -0.35px 0 #000, 0px 0.05px 0 #000, 0px 0.45px 0 #000, 0px 0.85px 0 #000, 0px 1.25px 0 #000, 0px 1.65px 0 #000, 0px 2.05px 0 #000, 0px 2.45px 0 #000, 0px 2.85px 0 #000, 0px 3px 0 #000, 0.75px -0.75px 0 #000, 0.75px -0.35px 0 #000, 0.75px 0.05px 0 #000, 0.75px 0.45px 0 #000, 0.75px 0.85px 0 #000, 0.75px 1.25px 0 #000, 0.75px 1.65px 0 #000, 0.75px 2.05px 0 #000, 0.75px 2.45px 0 #000, 0.75px 2.85px 0 #000, 0.75px 3px 0 #000"
            },
            '.heading-4xl': {
                textShadow: "-0.9px -0.9px 0 #000, -0.9px -0.5px 0 #000, -0.9px -0.1px 0 #000, -0.9px 0.3px 0 #000, -0.9px 0.7px 0 #000, -0.9px 1.1px 0 #000, -0.9px 1.5px 0 #000, -0.9px 1.9px 0 #000, -0.9px 2.3px 0 #000, -0.9px 2.7px 0 #000, -0.9px 3.1px 0 #000, -0.9px 3.5px 0 #000, -0.9px 3.6px 0 #000, 0px -0.9px 0 #000, 0px -0.5px 0 #000, 0px -0.1px 0 #000, 0px 0.3px 0 #000, 0px 0.7px 0 #000, 0px 1.1px 0 #000, 0px 1.5px 0 #000, 0px 1.9px 0 #000, 0px 2.3px 0 #000, 0px 2.7px 0 #000, 0px 3.1px 0 #000, 0px 3.5px 0 #000, 0px 3.6px 0 #000, 0.9px -0.9px 0 #000, 0.9px -0.5px 0 #000, 0.9px -0.1px 0 #000, 0.9px 0.3px 0 #000, 0.9px 0.7px 0 #000, 0.9px 1.1px 0 #000, 0.9px 1.5px 0 #000, 0.9px 1.9px 0 #000, 0.9px 2.3px 0 #000, 0.9px 2.7px 0 #000, 0.9px 3.1px 0 #000, 0.9px 3.5px 0 #000, 0.9px 3.6px 0 #000"
            },

        }
    }
});

export default theme;
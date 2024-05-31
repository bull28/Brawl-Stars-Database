import { extendTheme } from "@chakra-ui/react"

const config = {
    components: {
        Text: {
            baseStyle: {
                fontWeight: "normal",
                color: "white"
            },
            variants: {
                enemyStatName: {
                    lineHeight: 1.2
                },
                enemyStatValue: {
                    fontSize: "xl",
                    lineHeight: 1.2,
                    color: "#0ff"
                },
                enemyAttackStatValue: {
                    fontSize: "xl",
                    lineHeight: 1.2,
                    color: "#0f0"
                }
            }
        },
        FormLabel: {
            baseStyle: {
                fontWeight: "normal",
                color: "white"
            }
        },
        Button: {
            baseStyle: {
                fontWeight: "normal",
                color: "white"     
            }
        },
        Link: {
            baseStyle: {
                color: "white"
            }
        }
    },
    fonts: {
        heading: `"Lilita One (KINGFONT)"`,
        body: `"Lilita One (KINGFONT)"`
    },
    colors: {
        bg: "#f98e1a",
        main: "#e9a812",
        accent: "#aa9309"
    },
    styles: {
        global: {
            ".heading-2xs": {
                textShadow: "-0.015625rem -0.015625rem 0 #000, -0.015625rem 0.009375rem 0 #000, -0.015625rem 0.034375rem 0 #000, -0.015625rem 0.059375rem 0 #000, -0.015625rem 0.0625rem 0 #000, 0rem -0.015625rem 0 #000, 0rem 0.009375rem 0 #000, 0rem 0.034375rem 0 #000, 0rem 0.059375rem 0 #000, 0rem 0.0625rem 0 #000, 0.015625rem -0.015625rem 0 #000, 0.015625rem 0.009375rem 0 #000, 0.015625rem 0.034375rem 0 #000, 0.015625rem 0.059375rem 0 #000, 0.015625rem 0.0625rem 0 #000"
            },
            ".heading-xs": {
                textShadow: "-0.01875rem -0.01875rem 0 #000, -0.01875rem 0.00625rem 0 #000, -0.01875rem 0.03125rem 0 #000, -0.01875rem 0.05625rem 0 #000, -0.01875rem 0.075rem 0 #000, 0rem -0.01875rem 0 #000, 0rem 0.00625rem 0 #000, 0rem 0.03125rem 0 #000, 0rem 0.05625rem 0 #000, 0rem 0.075rem 0 #000, 0.01875rem -0.01875rem 0 #000, 0.01875rem 0.00625rem 0 #000, 0.01875rem 0.03125rem 0 #000, 0.01875rem 0.05625rem 0 #000, 0.01875rem 0.075rem 0 #000"
            },
            ".heading-sm": {
                textShadow: "-0.021875rem -0.021875rem 0 #000, -0.021875rem 0.003125rem 0 #000, -0.021875rem 0.028125rem 0 #000, -0.021875rem 0.053125rem 0 #000, -0.021875rem 0.078125rem 0 #000, -0.021875rem 0.0875rem 0 #000, 0rem -0.021875rem 0 #000, 0rem 0.003125rem 0 #000, 0rem 0.028125rem 0 #000, 0rem 0.053125rem 0 #000, 0rem 0.078125rem 0 #000, 0rem 0.0875rem 0 #000, 0.021875rem -0.021875rem 0 #000, 0.021875rem 0.003125rem 0 #000, 0.021875rem 0.028125rem 0 #000, 0.021875rem 0.053125rem 0 #000, 0.021875rem 0.078125rem 0 #000, 0.021875rem 0.0875rem 0 #000"
            },
            ".heading-md": {
                textShadow: "-0.025rem -0.025rem 0 #000, -0.025rem 0rem 0 #000, -0.025rem 0.025rem 0 #000, -0.025rem 0.05rem 0 #000, -0.025rem 0.075rem 0 #000, -0.025rem 0.1rem 0 #000, 0rem -0.025rem 0 #000, 0rem 0rem 0 #000, 0rem 0.025rem 0 #000, 0rem 0.05rem 0 #000, 0rem 0.075rem 0 #000, 0rem 0.1rem 0 #000, 0.025rem -0.025rem 0 #000, 0.025rem 0rem 0 #000, 0.025rem 0.025rem 0 #000, 0.025rem 0.05rem 0 #000, 0.025rem 0.075rem 0 #000, 0.025rem 0.1rem 0 #000"
            },
            ".heading-lg": {
                textShadow: "-0.028125rem -0.028125rem 0 #000, -0.028125rem -0.003125rem 0 #000, -0.028125rem 0.021875rem 0 #000, -0.028125rem 0.046875rem 0 #000, -0.028125rem 0.071875rem 0 #000, -0.028125rem 0.096875rem 0 #000, -0.028125rem 0.1125rem 0 #000, 0rem -0.028125rem 0 #000, 0rem -0.003125rem 0 #000, 0rem 0.021875rem 0 #000, 0rem 0.046875rem 0 #000, 0rem 0.071875rem 0 #000, 0rem 0.096875rem 0 #000, 0rem 0.1125rem 0 #000, 0.028125rem -0.028125rem 0 #000, 0.028125rem -0.003125rem 0 #000, 0.028125rem 0.021875rem 0 #000, 0.028125rem 0.046875rem 0 #000, 0.028125rem 0.071875rem 0 #000, 0.028125rem 0.096875rem 0 #000, 0.028125rem 0.1125rem 0 #000"
            },
            ".heading-xl": {
                textShadow: "-0.03125rem -0.03125rem 0 #000, -0.03125rem -0.00625rem 0 #000, -0.03125rem 0.01875rem 0 #000, -0.03125rem 0.04375rem 0 #000, -0.03125rem 0.06875rem 0 #000, -0.03125rem 0.09375rem 0 #000, -0.03125rem 0.11875rem 0 #000, -0.03125rem 0.125rem 0 #000, 0rem -0.03125rem 0 #000, 0rem -0.00625rem 0 #000, 0rem 0.01875rem 0 #000, 0rem 0.04375rem 0 #000, 0rem 0.06875rem 0 #000, 0rem 0.09375rem 0 #000, 0rem 0.11875rem 0 #000, 0rem 0.125rem 0 #000, 0.03125rem -0.03125rem 0 #000, 0.03125rem -0.00625rem 0 #000, 0.03125rem 0.01875rem 0 #000, 0.03125rem 0.04375rem 0 #000, 0.03125rem 0.06875rem 0 #000, 0.03125rem 0.09375rem 0 #000, 0.03125rem 0.11875rem 0 #000, 0.03125rem 0.125rem 0 #000"
            },
            ".heading-2xl": {
                textShadow: "-0.0375rem -0.0375rem 0 #000, -0.0375rem -0.0125rem 0 #000, -0.0375rem 0.0125rem 0 #000, -0.0375rem 0.0375rem 0 #000, -0.0375rem 0.0625rem 0 #000, -0.0375rem 0.0875rem 0 #000, -0.0375rem 0.1125rem 0 #000, -0.0375rem 0.1375rem 0 #000, -0.0375rem 0.15rem 0 #000, 0rem -0.0375rem 0 #000, 0rem -0.0125rem 0 #000, 0rem 0.0125rem 0 #000, 0rem 0.0375rem 0 #000, 0rem 0.0625rem 0 #000, 0rem 0.0875rem 0 #000, 0rem 0.1125rem 0 #000, 0rem 0.1375rem 0 #000, 0rem 0.15rem 0 #000, 0.0375rem -0.0375rem 0 #000, 0.0375rem -0.0125rem 0 #000, 0.0375rem 0.0125rem 0 #000, 0.0375rem 0.0375rem 0 #000, 0.0375rem 0.0625rem 0 #000, 0.0375rem 0.0875rem 0 #000, 0.0375rem 0.1125rem 0 #000, 0.0375rem 0.1375rem 0 #000, 0.0375rem 0.15rem 0 #000"
            },
            ".heading-3xl": {
                textShadow: "-0.046875rem -0.046875rem 0 #000, -0.046875rem -0.021875rem 0 #000, -0.046875rem 0.003125rem 0 #000, -0.046875rem 0.028125rem 0 #000, -0.046875rem 0.053125rem 0 #000, -0.046875rem 0.078125rem 0 #000, -0.046875rem 0.103125rem 0 #000, -0.046875rem 0.128125rem 0 #000, -0.046875rem 0.153125rem 0 #000, -0.046875rem 0.178125rem 0 #000, -0.046875rem 0.1875rem 0 #000, 0rem -0.046875rem 0 #000, 0rem -0.021875rem 0 #000, 0rem 0.003125rem 0 #000, 0rem 0.028125rem 0 #000, 0rem 0.053125rem 0 #000, 0rem 0.078125rem 0 #000, 0rem 0.103125rem 0 #000, 0rem 0.128125rem 0 #000, 0rem 0.153125rem 0 #000, 0rem 0.178125rem 0 #000, 0rem 0.1875rem 0 #000, 0.046875rem -0.046875rem 0 #000, 0.046875rem -0.021875rem 0 #000, 0.046875rem 0.003125rem 0 #000, 0.046875rem 0.028125rem 0 #000, 0.046875rem 0.053125rem 0 #000, 0.046875rem 0.078125rem 0 #000, 0.046875rem 0.103125rem 0 #000, 0.046875rem 0.128125rem 0 #000, 0.046875rem 0.153125rem 0 #000, 0.046875rem 0.178125rem 0 #000, 0.046875rem 0.1875rem 0 #000"
            },
            ".heading-4xl": {
                textShadow: "-0.05625rem -0.05625rem 0 #000, -0.05625rem -0.03125rem 0 #000, -0.05625rem -0.00625rem 0 #000, -0.05625rem 0.01875rem 0 #000, -0.05625rem 0.04375rem 0 #000, -0.05625rem 0.06875rem 0 #000, -0.05625rem 0.09375rem 0 #000, -0.05625rem 0.11875rem 0 #000, -0.05625rem 0.14375rem 0 #000, -0.05625rem 0.16875rem 0 #000, -0.05625rem 0.19375rem 0 #000, -0.05625rem 0.21875rem 0 #000, -0.05625rem 0.225rem 0 #000, 0rem -0.05625rem 0 #000, 0rem -0.03125rem 0 #000, 0rem -0.00625rem 0 #000, 0rem 0.01875rem 0 #000, 0rem 0.04375rem 0 #000, 0rem 0.06875rem 0 #000, 0rem 0.09375rem 0 #000, 0rem 0.11875rem 0 #000, 0rem 0.14375rem 0 #000, 0rem 0.16875rem 0 #000, 0rem 0.19375rem 0 #000, 0rem 0.21875rem 0 #000, 0rem 0.225rem 0 #000, 0.05625rem -0.05625rem 0 #000, 0.05625rem -0.03125rem 0 #000, 0.05625rem -0.00625rem 0 #000, 0.05625rem 0.01875rem 0 #000, 0.05625rem 0.04375rem 0 #000, 0.05625rem 0.06875rem 0 #000, 0.05625rem 0.09375rem 0 #000, 0.05625rem 0.11875rem 0 #000, 0.05625rem 0.14375rem 0 #000, 0.05625rem 0.16875rem 0 #000, 0.05625rem 0.19375rem 0 #000, 0.05625rem 0.21875rem 0 #000, 0.05625rem 0.225rem 0 #000"
            },
            ".heading-5xl": {
                textShadow: "-0.075rem -0.075rem 0 #000, -0.075rem -0.05rem 0 #000, -0.075rem -0.025rem 0 #000, -0.075rem 0rem 0 #000, -0.075rem 0.025rem 0 #000, -0.075rem 0.05rem 0 #000, -0.075rem 0.075rem 0 #000, -0.075rem 0.1rem 0 #000, -0.075rem 0.125rem 0 #000, -0.075rem 0.15rem 0 #000, -0.075rem 0.175rem 0 #000, -0.075rem 0.2rem 0 #000, -0.075rem 0.225rem 0 #000, -0.075rem 0.25rem 0 #000, -0.075rem 0.275rem 0 #000, -0.075rem 0.3rem 0 #000, -0.075rem 0.3rem 0 #000, 0rem -0.075rem 0 #000, 0rem -0.05rem 0 #000, 0rem -0.025rem 0 #000, 0rem 0rem 0 #000, 0rem 0.025rem 0 #000, 0rem 0.05rem 0 #000, 0rem 0.075rem 0 #000, 0rem 0.1rem 0 #000, 0rem 0.125rem 0 #000, 0rem 0.15rem 0 #000, 0rem 0.175rem 0 #000, 0rem 0.2rem 0 #000, 0rem 0.225rem 0 #000, 0rem 0.25rem 0 #000, 0rem 0.275rem 0 #000, 0rem 0.3rem 0 #000, 0rem 0.3rem 0 #000, 0.075rem -0.075rem 0 #000, 0.075rem -0.05rem 0 #000, 0.075rem -0.025rem 0 #000, 0.075rem 0rem 0 #000, 0.075rem 0.025rem 0 #000, 0.075rem 0.05rem 0 #000, 0.075rem 0.075rem 0 #000, 0.075rem 0.1rem 0 #000, 0.075rem 0.125rem 0 #000, 0.075rem 0.15rem 0 #000, 0.075rem 0.175rem 0 #000, 0.075rem 0.2rem 0 #000, 0.075rem 0.225rem 0 #000, 0.075rem 0.25rem 0 #000, 0.075rem 0.275rem 0 #000, 0.075rem 0.3rem 0 #000, 0.075rem 0.3rem 0 #000"
            },
            ".heading-6xl": {
                textShadow: "-0.09375rem -0.09375rem 0 #000, -0.09375rem -0.06875rem 0 #000, -0.09375rem -0.04375rem 0 #000, -0.09375rem -0.01875rem 0 #000, -0.09375rem 0.00625rem 0 #000, -0.09375rem 0.03125rem 0 #000, -0.09375rem 0.05625rem 0 #000, -0.09375rem 0.08125rem 0 #000, -0.09375rem 0.10625rem 0 #000, -0.09375rem 0.13125rem 0 #000, -0.09375rem 0.15625rem 0 #000, -0.09375rem 0.18125rem 0 #000, -0.09375rem 0.20625rem 0 #000, -0.09375rem 0.23125rem 0 #000, -0.09375rem 0.25625rem 0 #000, -0.09375rem 0.28125rem 0 #000, -0.09375rem 0.30625rem 0 #000, -0.09375rem 0.33125rem 0 #000, -0.09375rem 0.35625rem 0 #000, -0.09375rem 0.375rem 0 #000, 0rem -0.09375rem 0 #000, 0rem -0.06875rem 0 #000, 0rem -0.04375rem 0 #000, 0rem -0.01875rem 0 #000, 0rem 0.00625rem 0 #000, 0rem 0.03125rem 0 #000, 0rem 0.05625rem 0 #000, 0rem 0.08125rem 0 #000, 0rem 0.10625rem 0 #000, 0rem 0.13125rem 0 #000, 0rem 0.15625rem 0 #000, 0rem 0.18125rem 0 #000, 0rem 0.20625rem 0 #000, 0rem 0.23125rem 0 #000, 0rem 0.25625rem 0 #000, 0rem 0.28125rem 0 #000, 0rem 0.30625rem 0 #000, 0rem 0.33125rem 0 #000, 0rem 0.35625rem 0 #000, 0rem 0.375rem 0 #000, 0.09375rem -0.09375rem 0 #000, 0.09375rem -0.06875rem 0 #000, 0.09375rem -0.04375rem 0 #000, 0.09375rem -0.01875rem 0 #000, 0.09375rem 0.00625rem 0 #000, 0.09375rem 0.03125rem 0 #000, 0.09375rem 0.05625rem 0 #000, 0.09375rem 0.08125rem 0 #000, 0.09375rem 0.10625rem 0 #000, 0.09375rem 0.13125rem 0 #000, 0.09375rem 0.15625rem 0 #000, 0.09375rem 0.18125rem 0 #000, 0.09375rem 0.20625rem 0 #000, 0.09375rem 0.23125rem 0 #000, 0.09375rem 0.25625rem 0 #000, 0.09375rem 0.28125rem 0 #000, 0.09375rem 0.30625rem 0 #000, 0.09375rem 0.33125rem 0 #000, 0.09375rem 0.35625rem 0 #000, 0.09375rem 0.375rem 0 #000"
            },
            ".enemy-stat-box": {
                backgroundColor: "#000",
                padding: "0.375em",
                borderRadius: "lg"
            },
            "*": {
                caretColor: "transparent"
            }
        }
    },
    config: {
        initialColorMode: 'dark',
        useSystemColorMode: false
    }
}


const theme = extendTheme( config )

export default theme
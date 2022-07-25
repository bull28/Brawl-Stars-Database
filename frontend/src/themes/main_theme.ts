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
    }
});

export default theme;
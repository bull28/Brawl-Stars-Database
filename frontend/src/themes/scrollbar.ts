import {SystemStyleObject} from "@chakra-ui/react";

export const scrollStyle: SystemStyleObject = {
    '&::-webkit-scrollbar': {
        height: '12px',
        borderRadius: '8px',
        backgroundColor: `rgba(0, 0, 0, 0.05)`,
        width: '10px'
    },
    '&::-webkit-scrollbar-thumb': {
        backgroundColor: `rgba(0, 0, 0, 0.5)`,
        borderRadius: `6px`
    },
    '&::-webkit-scrollbar-corner': {
        backgroundColor: `rgba(0, 0, 0, 0)`
    }
};

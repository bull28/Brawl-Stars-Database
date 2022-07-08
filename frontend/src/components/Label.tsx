import React from 'react'
import {
    Tooltip, 
    useMediaQuery,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverCloseButton,
    PopoverBody,
    PopoverArrow, 
} from '@chakra-ui/react'

type Props = {
    label: string,
    children: React.ReactNode
}

export default function Label({label, children}: Props) {
    const media = useMediaQuery('(min-width: 500px)')[0]

    if (!media){
        return (
            <Popover>
                <PopoverTrigger>
                    {children}
                </PopoverTrigger>
                <PopoverContent>
                    <PopoverArrow/>
                    <PopoverCloseButton/>
                    <PopoverBody>
                        {label}
                    </PopoverBody>
                </PopoverContent>
            </Popover>
        )
    } else {
        return (
            <Tooltip label={label}>
                {children}
            </Tooltip>
        )
    }
    
}
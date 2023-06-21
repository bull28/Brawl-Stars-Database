import React from 'react'
import {Tooltip} from '@chakra-ui/react'

type Props = {
    label: string;
    children: React.ReactNode;
}

export default function Label({label, children}: Props) {
    return (
        <Tooltip label={label}>
            {children}
        </Tooltip>
    );
}

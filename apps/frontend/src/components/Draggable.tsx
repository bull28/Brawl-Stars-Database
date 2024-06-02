import React from "react";
import {useDraggable} from "@dnd-kit/core";

export default function Draggable(props: {children: React.ReactNode; id: string; className: string; disabled?: boolean;}){
    const {attributes, listeners, setNodeRef} = useDraggable({
        id: props.id, disabled: props.disabled || false
    });
    
    return (
        <div className={props.className} ref={setNodeRef} {...listeners} {...attributes}>
            {props.children}
        </div>
    );
}

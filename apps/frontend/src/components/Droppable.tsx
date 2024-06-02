import React from "react";
import {useDroppable} from "@dnd-kit/core";

export default function Droppable(props: {children: React.ReactNode; id: string; style: React.CSSProperties; isOverStyle: React.CSSProperties}){
    const {isOver, setNodeRef} = useDroppable({id: props.id});

    const style = isOver ? {...props.style, ...props.isOverStyle} : props.style;

    return (
        <div ref={setNodeRef} style={style}>
            {props.children}
        </div>
    );
}
  
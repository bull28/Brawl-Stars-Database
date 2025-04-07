interface NameArray{
    name: string;
}

export function findName<T extends NameArray>(array: T[], name: string, lookup?: Map<string, number>): number{
    let i: number | undefined;
    if (lookup !== undefined){
        i = lookup.get(name);
        if (i !== undefined && i < array.length && array[i].name === name){
            return i;
        }
    }

    i = 0;
    let found = false;
    while (i < array.length && found === false){
        if (array[i].name === name){
            found = true;
        } else{
            i++;
        }
    }
    
    if (found === false){
        return -1;
    }
    return i;
}

export function displayLong(x: number): string{
    x = Math.floor(x);
    if (x < 0){
        return x.toString();
    }

    let display = "";
    let digits = x.toString();
    const length = digits.length;

    for (let i = digits.length - 1; i >= 0; i--){
        if ((length - i - 1) % 3 === 0 && (length - i - 1) > 0){
            display = digits[i] + "," + display;
        } else{
            display = digits[i] + display;
        }
    }
    return display;
}

export function displayShort(x: number): string{
    x = Math.floor(x);
    if (x < 0){
        return x.toString();
    }

    let display = "";

    if (x < 1e5){
        return displayLong(x);
    } else if (x < 1e6){
        display = `${Math.floor(x / 1e3)}k`;
    } else if (x < 1e7){
        display = `${Math.floor(x / 1e5) / 10}M`;
    } else if (x < 1e9){
        display = `${Math.floor(x / 1e6)}M`;
    } else{
        display = `${Math.floor(x / 1e9)}B`;
    }

    display = display.replace(".00", "").replace(".0", "");

    return display;
}

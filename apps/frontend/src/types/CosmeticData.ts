export interface CosmeticData{
    background: string;
    icon: string;
    music: string;
    scene: string;
    extra: string;
}

export interface ThemeProps{
    background: {
        displayName: string;
        path: string;
    }[];
    icon: {
        displayName: string;
        path: string;
        preview: string;
    }[];
    music: {
        displayName: string;
        path: string;
    }[];
    scene: {
        displayName: string;
        path: string;
        preview: string;
        background: string;
    }[];
}

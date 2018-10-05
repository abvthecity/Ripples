export interface IRect {
    x: number; // left
    y: number; // top
    width: number; // right = x + width
    height: number; // bottom = y + height
}

export interface IScreen {
    offsetX: number;
    offsetY: number;
    screenWidth: number;
    screenHeight: number;
}

export interface IRippleObjectText {
    text: string;
}

export type IRippleObjectData = IRippleObjectText;
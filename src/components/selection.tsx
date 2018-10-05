import autobind from 'autobind-decorator';
import * as React from "react";
import { IRect, IScreen } from '../common/interfaces';

enum ResizeDirection {
    TOP,
    LEFT,
    RIGHT,
    BOTTOM,
    TOP_LEFT,
    TOP_RIGHT,
    BOTTOM_LEFT,
    BOTTOM_RIGHT,
}

interface ISelectionProps extends React.SVGProps<SVGGElement>, IScreen {
    rect: IRect;
    onChangeRect: (rect: IRect) => void;
}

interface ISelectionState {
    isDragging: boolean;
    resizeDirection: ResizeDirection | null;
    initialRect: IRect | null;
    initialPos: { x: number, y: number } | null;
    currentPos: { x: number, y: number } | null;
}

@autobind
export class Selection extends React.PureComponent<ISelectionProps, ISelectionState> {

    private static cornerSize = 6;
    private static strokeColor = "rgba(0, 0, 0, 0.8)"

    public state: ISelectionState = {
        isDragging: false,
        resizeDirection: null,
        initialRect: null,
        initialPos: null,
        currentPos: null,
    };

    public render() {
        const { rect, onChangeRect, offsetX, offsetY, screenWidth, screenHeight, ...other } = this.props;
        const { x, y, width: w, height: h } = this.props.rect;

        return (
            <g
                width={screenWidth}
                height={screenHeight}
                onMouseMove={this.handleDrag}
                onMouseUp={this.handleDragStop}
                {...other}
            >
                <rect style={{ fill: "transparent", display: this.state.isDragging ? "initial" : "none" }} width={screenWidth} height={screenHeight} />
                <g transform={`translate(${x + offsetX}, ${y + offsetY})`}>
                    {this.renderResizeSide({
                        x1: 0,
                        y1: 0,
                        x2: w,
                        y2: 0,
                        cursor: "ns-resize",
                        onMouseDown: this.handleDragStart(ResizeDirection.TOP),
                    })}
                    {this.renderResizeSide({
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: h,
                        cursor: "ew-resize",
                        onMouseDown: this.handleDragStart(ResizeDirection.LEFT),
                    })}
                    {this.renderResizeSide({
                        x1: w,
                        y1: 0,
                        x2: w,
                        y2: h,
                        cursor: "ew-resize",
                        onMouseDown: this.handleDragStart(ResizeDirection.RIGHT),
                    })}
                    {this.renderResizeSide({
                        x1: 0,
                        y1: h,
                        x2: w,
                        y2: h,
                        cursor: "ns-resize",
                        onMouseDown: this.handleDragStart(ResizeDirection.BOTTOM),
                    })}
                    {this.renderResizeCorner({
                        x: 0 - Selection.cornerSize / 2,
                        y: 0 - Selection.cornerSize / 2,
                        cursor: "nwse-resize",
                        onMouseDown: this.handleDragStart(ResizeDirection.TOP_LEFT),
                    })}
                    {this.renderResizeCorner({
                        x: w - Selection.cornerSize / 2,
                        y: 0 - Selection.cornerSize / 2,
                        cursor: "nesw-resize",
                        onMouseDown: this.handleDragStart(ResizeDirection.TOP_RIGHT),
                    })}
                    {this.renderResizeCorner({
                        x: 0 - Selection.cornerSize / 2,
                        y: h - Selection.cornerSize / 2,
                        cursor: "nesw-resize",
                        onMouseDown: this.handleDragStart(ResizeDirection.BOTTOM_LEFT),
                    })}
                    {this.renderResizeCorner({
                        x: w - Selection.cornerSize / 2,
                        y: h - Selection.cornerSize / 2,
                        cursor: "nwse-resize",
                        onMouseDown: this.handleDragStart(ResizeDirection.BOTTOM_RIGHT),
                    })}
                </g>
            </g>
        );
    }

    private getCursorPos(e: MouseEvent | React.MouseEvent<SVGElement>): { x: number, y: number } {
        const { offsetX, offsetY } = this.props;

        return {
            x: e.clientX - offsetX,
            y: e.clientY - offsetY,
        };
    }

    private handleDragStart(direction: ResizeDirection) {
        return async (e: MouseEvent | React.MouseEvent<SVGElement>) => {
            await this.setState({
                isDragging: true,
                resizeDirection: direction,
                initialRect: this.props.rect,
                initialPos: this.getCursorPos(e),
                currentPos: this.getCursorPos(e),
            });
        }
    }

    private async handleDrag(e: MouseEvent | React.MouseEvent<SVGElement>) {
        if (!this.state.isDragging) {
            return;
        }

        await this.setState({
            currentPos: this.getCursorPos(e),
        });

        this.updateDragState();
    }

    private async updateDragState() {
        const { x: initialX, y: initialY } = this.state.initialPos!;
        const { x: currentX, y: currentY } = this.state.currentPos!;

        const deltaX = currentX - initialX;
        const deltaY = currentY - initialY;

        const { initialRect: rect } = this.state;
        if (rect === null) {
            return;
        }

        let { x, y, width, height } = this.props.rect;

        switch (this.state.resizeDirection) {
            case ResizeDirection.TOP: {
                y = rect.y + deltaY;
                height = rect.height - deltaY;
                break;
            }
            case ResizeDirection.LEFT: {
                x = rect.x + deltaX;
                width = rect.width - deltaX;
                break;
            }
            case ResizeDirection.RIGHT: {
                width = rect.width + deltaX;
                break;
            }
            case ResizeDirection.BOTTOM: {
                height = rect.height + deltaY;
                break;
            }
            case ResizeDirection.TOP_LEFT: {
                x = rect.x + deltaX;
                y = rect.y + deltaY;
                width = rect.width - deltaX;
                height = rect.height - deltaY;
                break;
            }
            case ResizeDirection.TOP_RIGHT: {
                y = rect.y + deltaY;
                width = rect.width + deltaX;
                height = rect.height - deltaY;
                break;
            }
            case ResizeDirection.BOTTOM_LEFT: {
                x = rect.x + deltaX;
                width = rect.width - deltaX;
                height = rect.height + deltaY;
                break;
            }
            case ResizeDirection.BOTTOM_RIGHT: {
                width = rect.width + deltaX;
                height = rect.height + deltaY;
                break;
            }
        }

        this.props.onChangeRect({ x, y, width, height });
    }

    private async handleDragStop(e: MouseEvent | React.MouseEvent<SVGElement>) {
        if (!this.state.isDragging) {
            return;
        }

        await this.setState({
            isDragging: false,
            resizeDirection: null,
            initialRect: null,
            initialPos: null,
            currentPos: null,
        });
    }

    private renderResizeSide(props: React.SVGProps<SVGLineElement>, style: React.CSSProperties = {}) {
        const { x1, y1, x2, y2, ...other } = props;
        const pathStyle: React.CSSProperties = {
            stroke: Selection.strokeColor,
            strokeWidth: 1,
            ...style,
        };

        return (
            <g {...other as React.SVGProps<SVGGElement>}>
                <line style={{ stroke: "transparent", strokeWidth: 6 }} x1={x1} y1={y1} x2={x2} y2={y2} />
                <line style={pathStyle} x1={x1} y1={y1} x2={x2} y2={y2} />
            </g>
        );
    }

    private renderResizeCorner(props: React.SVGProps<SVGGElement>, style: React.CSSProperties = {}) {
        const { x, y } = props;
        const rectStyle: React.CSSProperties = {
            stroke: Selection.strokeColor,
            strokeWidth: 1,
            fill: '#FFFFFF',
            borderRadius: 1,
            ...style,
        };
        return (
            <g transform={`translate(${x}, ${y})`} {...props}>
                <rect width={10} height={10} x={-2} y={-2} style={{ fill: "transparent" }} />
                <rect style={rectStyle} rx={1} ry={1} width={6} height={6} />
            </g>
        );
    }
}
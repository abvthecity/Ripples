import { Button, ButtonGroup } from "@blueprintjs/core";
import autobind from 'autobind-decorator';
import * as React from "react";
import { RippleMapMode, RippleObjectType } from '../common/enums';
import { IRect, IRippleObjectData, IScreen } from '../common/interfaces';
import { IResizeEntry, ResizeSensor } from './resizeSensor';
import { IRippleObjectProps, RippleObject } from './rippleObject';
import { Selection } from './selection';

interface IRippleMapState extends IScreen {
    objects: { [key: string]: IRippleObjectProps };
    selectedObject: string | null;
    mouseOverObject: string | null;
    mode: RippleMapMode;
    increment: number;

    dragObject: string | null;
    dragInitialPos: { x: number, y: number } | null;
    dragInitialCursor: { x: number, y: number } | null;
}

@autobind
export class RippleMap extends React.PureComponent<{}, IRippleMapState> {
    public state: IRippleMapState = {
        increment: 0,

        screenWidth: 0,
        screenHeight: 0,
        offsetX: 0,
        offsetY: 0,
        objects: {},

        mouseOverObject: null,
        selectedObject: null,
        mode: RippleMapMode.SELECT,

        dragObject: null,
        dragInitialPos: null,
        dragInitialCursor: null,
    };

    public render() {
        const { screenWidth, screenHeight, offsetX, offsetY, mode } = this.state;
        return (
            <ResizeSensor onResize={this.handleResize}>
                <div
                    id="ripple-map"
                    onWheel={this.handleWheel}
                    onClickCapture={this.handleClickMap}
                    onDoubleClickCapture={this.handleDoubleClickMap}
                    onMouseMove={this.handleMouseMoveMap}
                    onMouseUp={this.handleMouseUpMap}
                >
                    <div id="ripple-toolbar">
                        <ButtonGroup>
                            <Button icon="select" active={this.state.mode === RippleMapMode.SELECT} onClick={this.handleChangeMode(RippleMapMode.SELECT)} />
                            <Button icon="paragraph" active={this.state.mode === RippleMapMode.TEXT} onClick={this.handleChangeMode(RippleMapMode.TEXT)} />
                        </ButtonGroup>
                    </div>
                    <svg width={screenWidth} height={screenHeight} style={{ position: "absolute", zIndex: 100 }}>
                        {Object.keys(this.state.objects).map((key: string) => (
                            <RippleObject
                                id={key}
                                key={key}
                                offsetX={offsetX}
                                offsetY={offsetY}
                                mode={mode}
                                onChangeData={this.handleChangeData(key)}
                                onClick={this.handleClickObject(key)}
                                onMouseOver={this.handleMouseOverObject(key)}
                                onMouseOut={this.handleMouseOutObject(key)}
                                onMouseDown={this.handleMouseDownObject(key)}
                                onDoubleClick={this.handleDoubleClickObject(key)}
                                cursor={this.state.selectedObject === key ? "move" : undefined}
                                {...this.state.objects[key]}
                            />
                        ))}
                        {this.renderSelection()}
                    </svg>
                </div>
            </ResizeSensor>
        )
    }

    private renderSelection() {
        const { offsetX, offsetY, screenWidth, screenHeight, selectedObject } = this.state;
        if (selectedObject === null) {
            return;
        }

        const { x, y, width, height } = this.state.objects[selectedObject];
        return (
            <Selection
                offsetX={offsetX}
                offsetY={offsetY}
                screenWidth={screenWidth}
                screenHeight={screenHeight}
                rect={{ x, y, width, height }}
                onChangeRect={this.handleChangeRect(selectedObject)}
                onMouseOver={this.handleMouseOverObject(selectedObject)}
                onMouseOut={this.handleMouseOutObject(selectedObject)}
            />
        );
    }

    private handleChangeMode(mode: RippleMapMode) {
        return async () => {
            if (mode === this.state.mode) {
                return;
            }

            await this.setState({ mode, selectedObject: null });
        };
    }

    private async handleMouseMoveMap(e: React.MouseEvent) {
        switch (this.state.mode) {
            case RippleMapMode.SELECT: {
                const { objects, dragObject, offsetX, offsetY, dragInitialPos: pos, dragInitialCursor: initial } = this.state;
                if (pos === null || initial === null || dragObject == null) {
                    break;
                }
                e.preventDefault();

                const current = {
                    x: e.clientX - offsetX,
                    y: e.clientY - offsetY,
                };

                this.setState({
                    objects: {
                        ...objects,
                        [dragObject]: {
                            ...objects[dragObject],
                            x: pos.x + (current.x - initial.x),
                            y: pos.y + (current.y - initial.y),
                        }
                    }
                });
                break;
            }
        }
    }

    private handleMouseDownObject(id: string) {
        return (e: React.MouseEvent) => {
            const { mode, offsetX, offsetY, objects } = this.state;
            switch (mode) {
                case RippleMapMode.SELECT: {
                    this.setState({
                        dragObject: id,
                        dragInitialCursor: {
                            x: e.clientX - offsetX,
                            y: e.clientY - offsetY
                        },
                        dragInitialPos: {
                            x: objects[id].x,
                            y: objects[id].y,
                        }
                    })
                    break;
                }
            }
        }
    }

    private handleMouseUpMap(e: React.MouseEvent) {
        if (this.state.dragObject !== null) {
            e.preventDefault();
            this.setState({
                dragObject: null,
                dragInitialPos: null,
                dragInitialCursor: null,
            });
        }
    }

    private handleClickObject(id: string) {
        return (e: React.MouseEvent) => {
            switch (this.state.mode) {
                case RippleMapMode.SELECT: {
                    e.preventDefault();
                    this.setState({
                        selectedObject: id,
                    });
                    break;
                }
            }
        }
    }

    private handleDoubleClickObject(id: string) {
        return async (e: React.MouseEvent) => {
            const { mode, objects } = this.state;
            switch (mode) {
                case RippleMapMode.SELECT: {
                    if (objects[id].type === RippleObjectType.TEXT) {
                        await this.handleChangeMode(RippleMapMode.TEXT)();
                        const textarea = document.getElementById(id)!.getElementsByTagName("textarea")![0];
                        textarea.focus();
                        textarea.select();
                    }

                    break;
                }
            }
        }
    }

    private handleMouseOverObject(id: string) {
        return () => {
            // tslint:disable:no-console
            console.log("mouseover", id);
            this.setState({
                mouseOverObject: id,
            });
        }
    }

    private handleMouseOutObject(id: string) {
        return () => {
            if (this.state.mouseOverObject === id) {
                console.log("mouseout", id);
                this.setState({
                    mouseOverObject: null,
                });
            }
        }
    }

    private handleClickMap() {
        switch (this.state.mode) {
            case RippleMapMode.SELECT: {
                if (this.state.mouseOverObject === null) {
                    this.setState({
                        selectedObject: null,
                    });
                }
                break;
            }
        }
    }

    private handleDoubleClickMap(e: React.MouseEvent) {
        switch (this.state.mode) {
            case RippleMapMode.TEXT: {
                if (this.state.mouseOverObject !== null) {
                    break;
                }
                this.setState({
                    increment: this.state.increment + 1,
                    objects: {
                        ...this.state.objects,
                        [`text-${this.state.increment}`]: {
                            x: e.clientX - this.state.offsetX,
                            y: e.clientY - this.state.offsetY,
                            width: 100,
                            height: 100,
                            type: RippleObjectType.TEXT,
                            data: { text: "Enter text here" },
                        },
                    }
                })
                break;
            }
        }
    }

    private handleWheel(e: React.WheelEvent<HTMLDivElement>) {
        e.preventDefault();

        const { offsetX, offsetY } = this.state;

        this.setState({
            offsetX: offsetX - e.deltaX * 2,
            offsetY: offsetY - e.deltaY * 2,
        });
    }

    private handleChangeRect(id: string | null) {
        return (rect: IRect) => {
            if (id === null) {
                return;
            }

            const { objects } = this.state;

            this.setState({
                objects: {
                    ...objects,
                    [id]: {
                        ...objects[id],
                        ...rect
                    },
                },
            });
        }
    }

    private handleChangeData(id: string) {
        return (data: IRippleObjectData) => {
            const { objects } = this.state;

            this.setState({
                objects: {
                    ...objects,
                    [id]: {
                        ...objects[id],
                        data: Object.assign({}, objects[id].data, data),
                    },
                },
            });
        }
    }

    private handleResize(entries: IResizeEntry[]) {
        // tslint:disable:no-console
        console.log(entries);
        this.setState({
            screenWidth: entries[0].contentRect.width,
            screenHeight: entries[0].contentRect.height,
        });
    }
}
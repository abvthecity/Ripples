import autobind from 'autobind-decorator';
import * as React from "react";
import { RippleMapMode, RippleObjectType } from '../common/enums';
import { IRippleObjectData } from '../common/interfaces';
import { RippleObjectText } from './rippleObjectText';

export interface IRippleObjectProps {
    x: number;
    y: number;
    width: number;
    height: number;
    type: RippleObjectType;
    data: IRippleObjectData;
}

interface IRippleObjectPropsCombined extends IRippleObjectProps, React.DOMAttributes<SVGGElement> {
    offsetX: number;
    offsetY: number;
    mode: RippleMapMode;
    onChangeData: (data: IRippleObjectData) => void;
}

interface IRippleObjectState {
    isBordered: boolean;
}

@autobind
export class RippleObject extends React.PureComponent<IRippleObjectPropsCombined, IRippleObjectState> {
    public state: IRippleObjectState = {
        isBordered: false,
    }

    public render() {
        const { x, y, offsetX, offsetY, width: w, height: h, type, data, mode, onChangeData, ...other } = this.props;
        return (
            <g
                {...other}
                transform={`translate(${x + offsetX}, ${y + offsetY})`}
                onMouseOver={this.handleMouseOver}
                onMouseOut={this.handleMouseOut}
            >
                <rect width={w} height={h} style={{ fill: "transparent" }} />
                {this.renderObject()}
                <g style={{ opacity: this.state.isBordered ? 1 : 0 }} >
                    <line x1={0} y1={0} x2={w} y2={0} style={{ stroke: "rgba(0, 0, 0, 0.5", strokeWidth: 1 }} />
                    <line x1={0} y1={0} x2={0} y2={h} style={{ stroke: "rgba(0, 0, 0, 0.5", strokeWidth: 1 }} />
                    <line x1={w} y1={0} x2={w} y2={h} style={{ stroke: "rgba(0, 0, 0, 0.5", strokeWidth: 1 }} />
                    <line x1={0} y1={h} x2={w} y2={h} style={{ stroke: "rgba(0, 0, 0, 0.5", strokeWidth: 1 }} />
                </g>
            </g>
        )
    }

    private handleMouseOver(e: React.MouseEvent<SVGGElement>) {
        this.setState({ isBordered: true });

        if (this.props.onMouseOver) {
            this.props.onMouseOver(e);
        }
    }

    private handleMouseOut(e: React.MouseEvent<SVGGElement>) {
        this.setState({ isBordered: false });

        if (this.props.onMouseOut) {
            this.props.onMouseOut(e);
        }
    }

    private renderObject() {
        switch (this.props.type) {
            case RippleObjectType.TEXT: {
                const { width, height, mode, data, onChangeData } = this.props;
                return <RippleObjectText width={width} height={height} mode={mode} data={data} onChangeData={onChangeData} />
            }
        }
        return undefined;
    }
}
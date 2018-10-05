import autobind from 'autobind-decorator';
import * as React from "react";
import { RippleMapMode } from '../common/enums';
import { IRippleObjectText } from '../common/interfaces';

interface IRippleObjectTextProps {
    width: number;
    height: number;
    mode: RippleMapMode;
    data: IRippleObjectText;
    onChangeData: (data: IRippleObjectText) => void;
}

@autobind
export class RippleObjectText extends React.PureComponent<IRippleObjectTextProps> {
    public render() {
        const { width, height, mode, data } = this.props;
        const wrapperStyle: React.CSSProperties = {
            pointerEvents: mode === RippleMapMode.SELECT ? "none" : "auto",
            userSelect: mode === RippleMapMode.SELECT ? "none" : "auto",
            width, height,
        };
        const textareaStyle: React.CSSProperties = {
            padding: 0,
            margin: 0,
            border: 0,
            font: "inherit",
            width: '100%',
            height: '100%',
            resize: "none",
        }
        return (
            <foreignObject width={width} height={height}>
                <div style={wrapperStyle}>
                    <textarea value={data.text} onChange={this.handleChange} style={textareaStyle} />
                </div>
            </foreignObject>
        )
    }

    private handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
        this.props.onChangeData({
            text: e.currentTarget.value,
        });
    }
}
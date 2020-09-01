import * as React from 'react';

interface EllipsisLoaderProps {
    animate: boolean;
}

interface EllipsisLoaderState {
    frame: number;
}

export default class EllipsisLoader extends React.Component<EllipsisLoaderProps, EllipsisLoaderState> {

    private intervalID: number = -1; 

    constructor(props: EllipsisLoaderProps) {
        super(props);

        this.state = {
            frame: 0,
        };

        if (props.animate) {
            this.startAnimation();
        }
    }

    private dot(n: number) {
        if (n > 0) {
            return '.';
        }
        return ' ';
    }

    componentWillUnmount() {
        this.stopAnimation()
    }

    render() {
        let s = '...';
        if (this.props.animate) {
            this.startAnimation();
            s = `${this.dot(this.state.frame % 4)}${this.dot(this.state.frame % 4 - 1)}${this.dot(this.state.frame % 4 - 2)}${this.dot(this.state.frame % 4 - 3)}`;
        } else {
            this.stopAnimation();
        }
        
        return (
            <span>{s}</span>
        )
    }

    startAnimation() {
        if (this.intervalID != -1) {
            return;  // Animation already ongoing
        }
        this.intervalID = window.setInterval(()=>{
            this.setState({
                frame: this.state.frame + 1,
            })
        },500)
    }

    stopAnimation() {
        clearInterval(this.intervalID);
        this.intervalID = -1;
        
    }
}
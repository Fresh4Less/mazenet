import * as React from 'react';
import { Models } from '../../../../common/api/v1';
import { StylesMode } from './styles';

interface SimpleStylesProps {
    room: Models.Room;
    active: boolean;
}

export class SimpleStyles extends React.Component<SimpleStylesProps, any> implements StylesMode {

    public Stylesheet(): [Models.Stylesheet, Error | null] {
        return [this.props.room.stylesheet, null];
    }

    public Reset() {
        // No - op
    }

    public render(): JSX.Element | null {
        if (!this.props.active) {
            return null;
        }
        return (
            <div className={'body'}>
                I am the simple room styles view. I am not complete yet but will include handy inputs and drop-downs to
                customize room and styles. May not be as powerful as the Advanced Mode but will be good for those
                who have no experience writing CSS.
            </div>
        );
    }
}
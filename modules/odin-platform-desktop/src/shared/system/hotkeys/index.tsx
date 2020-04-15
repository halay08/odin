import React from 'react'
import {
  toggleSearchVisibility
} from "../../../core/records/store/actions";
import {connect} from "react-redux";
import {IRecordReducer} from "../../../core/records/store/reducer";

interface Props {
  recordReducer: IRecordReducer,
  toggleSearchVisibility: any,
}

class HotKeyWrapper extends React.Component<Props>{

  constructor(props: any) {
    super(props)
    this.catchHotKeys = this.catchHotKeys.bind(this)
  }

  componentDidMount() {
    document.addEventListener('keydown', this.catchHotKeys, false)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.catchHotKeys, false)
  }

  catchHotKeys = (event: any) => {
    if(event.keyCode === 83 && event.altKey) {
      this.props.toggleSearchVisibility()
    }
  }

  render() {
    return(<></>)
  }

}

const mapState = (state: any) => ({
  recordReducer: state.recordReducer,
});

const mapDispatch = (dispatch: any) => ({
  toggleSearchVisibility : () => dispatch(toggleSearchVisibility())
});

export default connect(mapState, mapDispatch)(HotKeyWrapper)

import React, { PureComponent, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { translator } from '../../../common/translator'
import { Panel } from './Panel'

const errorStyle = {
  color: 'red',
  fontSize: '0.8em',
}

const saveButtonStyle = {
  display: 'block',
  float: 'right',
  marginTop: '1em',
}

const limitsStyle = {
  width: '18em',
  float: 'left',
}

const inputStyle = {
  marginLeft: '0.5em',
  width: '4em',
}

export class LimitsPanel extends PureComponent {
  constructor() {
    super()
    this.state = {
      error: null,
    }
  }
  close() {
    ReactDOM.unmountComponentAtNode(document.getElementById('limits-panel'))
  }
  submit() {
    const maxLoss = +this.maxLossDiv.value
    const maxTrades = +this.maxTradesDiv.value
    if (maxLoss && maxTrades) {
      if (maxTrades <= 100) {
        this.close()
        this.props.onSave({
          maxLoss,
          maxTrades,
        })
      } else {
        this.setState({ error: translator.translateText('Maximum allowed number of trades for each session is 100.') })
      }
    } else {
      this.setState({ error: translator.translateText('Both number of trades and loss amount are required.') })
    }
  }
  render() {
    return (
      <Panel
      id="saveAs"
      onClose={() => this.close()}
      description={translator.translateText('Trade Limitations')}
      content={
        <div>
          <div
          style={limitsStyle}
          >
            <label htmlFor="limitation-max-trades">{translator.translateText('Maximum number of trades')}</label>
            <input style={inputStyle} ref={(el) => (this.maxTradesDiv = el)} type="number" id="limitation-max-trades" />
            <label htmlFor="limitation-max-loss">{translator.translateText('Maximum loss amount')}</label>
            <input style={inputStyle} ref={(el) => (this.maxLossDiv = el)} type="number" id="limitation-max-loss" />
            {this.state.error ? <p style={errorStyle}>{this.state.error}</p> : null}
          </div>
          <button
          style={saveButtonStyle}
          onClick={() => this.submit()}
          >{translator.translateText('Start')}</button>
        </div>
      }
      />
    )
  }
  props: {
    onSave: PropTypes.func,
  }
}

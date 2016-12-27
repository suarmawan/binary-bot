// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#wupwb4
import { translator } from '../../../../../../common/translator'

Blockly.Blocks.interval = {
  init: function init() {
    this.appendStatementInput('TIMERSTACK')
      .setCheck(null)
    this.appendValueInput('SECONDS')
      .setCheck(null)
      .appendField(translator.translateText('Run Every'))
    this.appendDummyInput()
      .appendField(translator.translateText('Second(s)'))
    this.setInputsInline(true)
    this.setColour('#fef1cf')
    this.setTooltip(translator.translateText('Run the blocks inside every n seconds'))
    this.setHelpUrl('https://github.com/binary-com/binary-bot/wiki')
  },
}

Blockly.JavaScript.interval = (block) => {
  const stack = Blockly.JavaScript.statementToCode(block, 'TIMERSTACK')
  const seconds = Blockly.JavaScript.valueToCode(block, 'SECONDS', Blockly.JavaScript.ORDER_ATOMIC)
  return `
    Bot.setInterval(function (){
      ${stack}
    }.bind(this), (${seconds ? `(${seconds}) *` : ''} 1000));
  `
}

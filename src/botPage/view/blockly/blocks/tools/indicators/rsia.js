// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#3qghes
import { translator } from '../../../../../../common/translator'

Blockly.Blocks.rsia = {
  init: function init() {
    this.appendDummyInput()
      .appendField(translator.translateText('Relative Strength Index Array'))
    this.appendValueInput('INPUT')
      .setCheck('Array')
      .appendField(translator.translateText('Input List'))
    this.appendValueInput('PERIOD')
      .setCheck('Number')
      .appendField(translator.translateText('Period'))
    this.setOutput(true, 'Array')
    this.setColour('#dedede')
    this.setTooltip(translator.translateText('Calculates Relative Strength Index (RSI) list from a list of values with a period'))
    this.setHelpUrl('https://github.com/binary-com/binary-bot/wiki')
  },
}

Blockly.JavaScript.rsia = (block) => {
  const input = Blockly.JavaScript.valueToCode(block,
      'INPUT', Blockly.JavaScript.ORDER_ATOMIC) || '[]'
  const period = Blockly.JavaScript.valueToCode(block,
      'PERIOD', Blockly.JavaScript.ORDER_ATOMIC) || '0'
  const code = `Bot.math.indicators.relativeStrengthIndexArray(Bot.expect.notEmptyArray(${
  input}), { periods: Bot.expect.indicatorPeriod(${input}, ${period}) })`
  return [code, Blockly.JavaScript.ORDER_NONE]
}

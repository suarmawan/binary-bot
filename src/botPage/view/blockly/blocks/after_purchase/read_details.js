// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#u8i287
import { translator } from '../../../../../common/translator'
import { insideAfterPurchase } from '../../relationChecker'
import config from '../../../../../common/const'

Blockly.Blocks.read_details = {
  init: function init() {
    this.appendDummyInput()
      .appendField(translator.translateText('Contract Detail:'))
      .appendField(new Blockly.FieldDropdown(config.lists.DETAILS), 'DETAIL_INDEX')
    this.setOutput(true, null)
    this.setColour('#f2f2f2')
    this.setTooltip(translator.translateText('Reads a selected option from contract details list'))
    this.setHelpUrl('https://github.com/binary-com/binary-bot/wiki')
  },
  onchange: function onchange(ev) {
    insideAfterPurchase(this, ev, 'Read Contract Details')
  },
}
Blockly.JavaScript.read_details = (block) => {
  const detailIndex = block.getFieldValue('DETAIL_INDEX')
  const code = `this.contractDetails[${parseInt(detailIndex.trim(), 10) - 1}]`
  return [code, Blockly.JavaScript.ORDER_ATOMIC]
}

// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#orvwcx

import config from '../../../../../common/const';
import { condition } from '../../relationChecker';
import { translator } from '../../../../../common/translator';
import { duration, payout, prediction, title, barrierOffset, secondBarrierOffset, candleInterval } from './components';

export default () => {
  for (const opposites of Object.keys(config.opposites)) {
    Blockly.Blocks[opposites.toLowerCase()] = {
      init: function init() {
        const optionNames = [];
        for (const options of config.opposites[opposites]) {
          const optionName = options[Object.keys(options)[0]];
          optionNames.push(optionName);
        }
        title(this, opposites, optionNames);
        candleInterval(this);
        duration(this, opposites);
        payout(this, opposites);
        if (config.hasPrediction.indexOf(opposites) > -1) {
          prediction(this, opposites);
        }
        if (config.hasBarrierOffset.indexOf(opposites) > -1) {
          barrierOffset(this, opposites);
        }
        if (config.hasSecondBarrierOffset.indexOf(opposites) > -1) {
          barrierOffset(this, opposites, translator.translateText('High Barrier Offset:'));
          window.block = this;
          secondBarrierOffset(this, opposites);
        }
        this.setInputsInline(false);
        this.setPreviousStatement(true, 'Condition');
        this.setColour('#f2f2f2');
				this.setTooltip(translator.translateText('Provides the trade types:') +
					' ' + optionNames[0] + '/' + optionNames[1]);
        this.setHelpUrl('https://github.com/binary-com/binary-bot/wiki');
      },
      onchange: function onchange(ev) {
        condition(this, ev);
      },
    };
  }
};
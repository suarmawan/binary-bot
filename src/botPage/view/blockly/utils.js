import fileSaver from 'filesaverjs'
import { observer } from 'binary-common-utils/lib/observer'
import config from '../../../common/const'
import { translator } from '../../../common/translator'

let purchaseChoices = [[translator.translateText('Click to select'), '']]

export const oppositesToDropdown = (opposites) => opposites.map((k) => [k[Object.keys(k)[0]], Object.keys(k)[0]])

export const updateInputList = (block) => {
  const tradeType = block.getFieldValue('TRADETYPE_LIST')
  if (tradeType) {
    Blockly.Blocks[tradeType].init.call(block)
  }
}

export const setInputList = (block) => {
  Blockly.Blocks.allFields.init.call(block)
}

export const isMainBlock = (blockType) => config.mainBlocks.indexOf(blockType) >= 0

export const backwardCompatibility = (block) => {
  if (block.getAttribute('type') === 'on_strategy') {
    block.setAttribute('type', 'before_purchase')
  } else if (block.getAttribute('type') === 'on_finish') {
    block.setAttribute('type', 'after_purchase')
  }
  for (const statement of Array.prototype.slice.call(block.getElementsByTagName('statement'))) {
    if (statement.getAttribute('name') === 'STRATEGY_STACK') {
      statement.setAttribute('name', 'BEFOREPURCHASE_STACK')
    } else if (statement.getAttribute('name') === 'FINISH_STACK') {
      statement.setAttribute('name', 'AFTERPURCHASE_STACK')
    }
  }
  if (isMainBlock(block.getAttribute('type'))) {
    block.removeAttribute('deletable')
  }
}

export const fixCollapsedBlocks = () => {
  for (const block of getCollapsedProcedures()) {
    block.setCollapsed(false)
    block.setCollapsed(true)
  }
}

export const cleanUpOnLoad = (blocksToClean, dropEvent) => {
  const {
    clientX = 0,
    clientY = 0,
  } = dropEvent || {}
  const blocklyMetrics = Blockly.mainWorkspace.getMetrics()
  const scaleCancellation = (1 / Blockly.mainWorkspace.scale)
  const blocklyLeft = (blocklyMetrics.absoluteLeft - blocklyMetrics.viewLeft)
    + parseInt($('.blocklySvg').css('left'), 10)
  const blocklyTop = (document.body.offsetHeight - blocklyMetrics.viewHeight) - blocklyMetrics.viewTop
  const cursorX = (clientX) ? (clientX - blocklyLeft) * scaleCancellation : 0
  let cursorY = (clientY) ? (clientY - blocklyTop) * scaleCancellation : 0
  for (const block of blocksToClean) {
    block.moveBy(cursorX, cursorY)
    block.snapToGrid()
    cursorY += block.getHeightWidth().height + Blockly.BlockSvg.MIN_BLOCK_Y
  }
  // Fire an event to allow scrollbars to resize.
  Blockly.mainWorkspace.resizeContents()
}

const getCollapsedProcedures = () => Blockly.mainWorkspace.getTopBlocks().filter(
  (block) => (!isMainBlock(block.type)
    && block.collapsed_ && block.type.indexOf('procedures_def') === 0))

export const deleteBlockIfExists = (block) => {
  Blockly.Events.recordUndo = false
  for (const mainBlock of Blockly.mainWorkspace.getTopBlocks()) {
    if (!block.isInFlyout && mainBlock.id !== block.id && mainBlock.type === block.type) {
      block.dispose()
      return true
    }
  }
  Blockly.Events.recordUndo = true
  return false
}

export const setBlockTextColor = (block) => {
  Blockly.Events.recordUndo = false
  if (block.inputList instanceof Array) {
    for (const inp of Array.prototype.slice.call(block.inputList)) {
      for (const field of inp.fieldRow) {
        if (field instanceof Blockly.FieldLabel) {
          const svgElement = field.getSvgRoot()
          if (svgElement) {
            svgElement.style.setProperty('fill', 'white', 'important')
          }
        }
      }
    }
  }
  const field = block.getField()
  if (field) {
    const svgElement = field.getSvgRoot()
    if (svgElement) {
      svgElement.style.setProperty('fill', 'white', 'important')
    }
  }
  Blockly.Events.recordUndo = true
}

export const configMainBlock = (ev, type) => {
  if (ev.type === 'create') {
    for (const blockId of ev.ids) {
      const block = Blockly.mainWorkspace.getBlockById(blockId)
      if (block) {
        if (block.type === type) {
          deleteBlockIfExists(block)
        }
      }
    }
  }
}

export const getBlockByType = (type) => {
  for (const block of Blockly.mainWorkspace.getAllBlocks()) {
    if (type === block.type) {
      return block
    }
  }
  return null
}

export const getMainBlocks = () => {
  const result = []
  for (const blockType of config.mainBlocks) {
    const block = getBlockByType(blockType)
    if (block) {
      result.push(block)
    }
  }
  return result
}

export const getBlocksByType = (type) => {
  const result = []
  for (const block of Blockly.mainWorkspace.getAllBlocks()) {
    if (type === block.type) {
      result.push(block)
    }
  }
  return result
}

export const getTopBlocksByType = (type) => {
  const result = []
  for (const block of Blockly.mainWorkspace.getTopBlocks()) {
    if (type === block.type) {
      result.push(block)
    }
  }
  return result
}

export const getPurchaseChoices = () => purchaseChoices

export const findTopParentBlock = (b) => {
  let block = b
  let pblock = block.parentBlock_
  if (pblock === null) {
    return null
  }
  while (pblock !== null) {
    if (pblock.type === 'trade') {
      return pblock
    }
    block = pblock
    pblock = block.parentBlock_
  }
  return block
}

export const insideMainBlocks = (block) => {
  const parent = findTopParentBlock(block)
  if (!parent) {
    return false
  }
  return parent.type && isMainBlock(parent.type)
}

export const updatePurchaseChoices = (contractType, oppositesName) => {
  purchaseChoices = oppositesToDropdown(config.opposites[oppositesName]
    .filter((k) => (contractType === 'both' ? true : contractType === Object.keys(k)[0])))
  const purchases = Blockly.mainWorkspace.getAllBlocks()
    .filter((r) => (['purchase', 'payout', 'ask_price'].indexOf(r.type) >= 0))
  Blockly.Events.recordUndo = false
  for (const purchase of purchases) {
    const value = purchase.getField('PURCHASE_LIST')
      .getValue()
    Blockly.WidgetDiv.hideIfOwner(purchase.getField('PURCHASE_LIST'))
    if (value === purchaseChoices[0][1]) {
      purchase.getField('PURCHASE_LIST')
        .setText(purchaseChoices[0][0])
    } else if (purchaseChoices.length === 2 && value === purchaseChoices[1][1]) {
      purchase.getField('PURCHASE_LIST')
        .setText(purchaseChoices[1][0])
    } else {
      purchase.getField('PURCHASE_LIST')
        .setValue(purchaseChoices[0][1])
      purchase.getField('PURCHASE_LIST')
        .setText(purchaseChoices[0][0])
    }
  }
  Blockly.Events.recordUndo = true
}

export const save = (filename = 'binary-bot.xml', collection = false, xmlDom) => {
  xmlDom.setAttribute('collection', collection ? 'true' : 'false')
  const xmlText = Blockly.Xml.domToPrettyText(xmlDom)
  const blob = new Blob([xmlText], {
    type: 'text/xml;charset=utf-8',
  })
  fileSaver.saveAs(blob, `${filename}.xml`)
}

export const disable = (blockObj, message) => {
  if (!blockObj.disabled) {
    if (message) {
      observer.emit('ui.log.warn', message)
    }
  }
  Blockly.Events.recordUndo = false
  blockObj.setDisabled(true)
  Blockly.Events.recordUndo = true
}

export const enable = (blockObj) => {
  Blockly.Events.recordUndo = false
  blockObj.setDisabled(false)
  Blockly.Events.recordUndo = true
}

export const expandDuration = (duration) => `${duration.replace(/t/g, ' tick')
    .replace(/s/g, ' second')
    .replace(/m/g, ' minute')
    .replace(/h/g, ' hour')
    .replace(/d/g, ' day')}(s)`

export const durationToSecond = (duration) => {
  const parsedDuration = duration.match(/^([0-9]+)([stmhd])$/)
  if (!parsedDuration) {
    return null
  }
  const durationValue = parseFloat(parsedDuration[1])
  const durationType = parsedDuration[2]
  if (durationType === 's') {
    return durationValue
  }
  if (durationType === 't') {
    return durationValue * 2
  }
  if (durationType === 'm') {
    return durationValue * 60
  }
  if (durationType === 'h') {
    return durationValue * 60 * 60
  }
  if (durationType === 'd') {
    return durationValue * 60 * 60 * 24
  }
  return null
}

const isProcedure = (blockType) => ['procedures_defreturn', 'procedures_defnoreturn'].indexOf(blockType) >= 0

// dummy event to recover deleted blocks loaded by loader
class DeleteStray extends Blockly.Events.Abstract {
  constructor(block) {
    super(block)
    this.run(true)
  }
  run(redo) {
    const recordUndo = Blockly.Events.recordUndo
    Blockly.Events.recordUndo = false
    const sourceBlock = Blockly.mainWorkspace.getBlockById(this.blockId)
    if (!sourceBlock) {
      return
    }
    if (redo) {
      sourceBlock.setFieldValue(`${sourceBlock.getFieldValue('NAME')} (deleted)`, 'NAME')
      sourceBlock.setDisabled(true)
    } else {
      sourceBlock.setFieldValue(sourceBlock.getFieldValue('NAME').replace(' (deleted)', ''), 'NAME')
      sourceBlock.setDisabled(false)
    }
    Blockly.Events.recordUndo = recordUndo
  }
}
DeleteStray.prototype.type = 'deletestray'

// dummy event to hide the element after creation
class Hide extends Blockly.Events.Abstract {
  constructor(block, header) {
    super(block)
    this.sourceHeaderId = header.id
    this.run(true)
  }
  run() {
    const recordUndo = Blockly.Events.recordUndo
    Blockly.Events.recordUndo = false
    const sourceBlock = Blockly.mainWorkspace.getBlockById(this.blockId)
    const sourceHeader = Blockly.mainWorkspace.getBlockById(this.sourceHeaderId)
    sourceBlock.loaderId = sourceHeader.id
    sourceHeader.loadedByMe.push(sourceBlock.id)
    sourceBlock.getSvgRoot().style.display = 'none'
    Blockly.Events.recordUndo = recordUndo
  }
}
Hide.prototype.type = 'hide'

export const deleteBlocksLoadedBy = (id, eventGroup = true) => {
  Blockly.Events.setGroup(eventGroup)
  for (const block of Blockly.mainWorkspace.getTopBlocks()) {
    if (block.loaderId === id) {
      if (isProcedure(block.type)) {
        if (block.getFieldValue('NAME').indexOf('deleted') < 0) {
          Blockly.Events.fire(new DeleteStray(block))
        }
      } else {
        block.dispose()
      }
    }
  }
  Blockly.Events.setGroup(false)
}

export const addDomAsBlock = (blockXml) => {
  backwardCompatibility(blockXml)
  const blockType = blockXml.getAttribute('type')
  if (isMainBlock(blockType)) {
    for (const b of Blockly.mainWorkspace.getTopBlocks()) {
      if (b.type === blockType) {
        b.dispose()
      }
    }
  }
  return Blockly.Xml.domToBlock(blockXml, Blockly.mainWorkspace)
}

const replaceDeletedBlock = (block) => {
  const procedureName = block.getFieldValue('NAME')
  const oldProcedure = Blockly.Procedures.getDefinition(
    `${procedureName} (deleted)`, Blockly.mainWorkspace)
  if (oldProcedure) {
    const recordUndo = Blockly.Events.recordUndo
    Blockly.Events.recordUndo = false
    const f = block.getField('NAME')
    f.text_ = `${procedureName} (deleted)`
    oldProcedure.dispose()
    block.setFieldValue(`${procedureName}`, 'NAME')
    Blockly.Events.recordUndo = recordUndo
  }
}

export const recoverDeletedBlock = (block) => {
  const recordUndo = Blockly.Events.recordUndo
  Blockly.Events.recordUndo = false
  block.setFieldValue(block.getFieldValue('NAME').replace(' (deleted)', ''), 'NAME')
  block.setDisabled(false)
  Blockly.Events.recordUndo = recordUndo
}

const addDomAsBlockFromHeader = (blockXml, header = null) => {
  const oldVars = [...Blockly.mainWorkspace.variableList]
  const block = Blockly.Xml.domToBlock(blockXml, Blockly.mainWorkspace)
  Blockly.mainWorkspace.variableList = Blockly.mainWorkspace.variableList.filter((v) => {
    if (oldVars.indexOf(v) >= 0) {
      return true
    }
    header.loadedVariables.push(v)
    return false
  })
  replaceDeletedBlock(block)
  Blockly.Events.fire(new Hide(block, header))
  return block
}

const processLoaders = (xml, header = null) => {
  const promises = []
  for (const block of Array.prototype.slice.call(xml.children)) {
    if (block.getAttribute('type') === 'loader') {
      block.remove()
      const loader = header ? addDomAsBlockFromHeader(block, header)
        : Blockly.Xml.domToBlock(block, Blockly.mainWorkspace)
      promises.push(loadRemote(loader)) // eslint-disable-line no-use-before-define
    }
  }
  return promises
}

export const addLoadersFirst = (xml, header = null) => new Promise((resolve, reject) => {
  const promises = processLoaders(xml, header)
  if (promises.length) {
    Promise.all(promises).then(resolve, reject)
  } else {
    resolve([])
  }
})

const loadBlocksFromHeader = (blockStr = '', header) => new Promise((resolve, reject) => {
  try {
    const xml = Blockly.Xml.textToDom(blockStr)
    if (xml.hasAttribute('collection') && xml.getAttribute('collection') === 'true') {
      const recordUndo = Blockly.Events.recordUndo
      Blockly.Events.recordUndo = false
      addLoadersFirst(xml, header).then(() => {
        for (const block of Array.prototype.slice.call(xml.children)) {
          if (['tick_analysis',
              'timeout',
              'interval'].indexOf(block.getAttribute('type')) >= 0 ||
            isProcedure(block.getAttribute('type'))) {
            addDomAsBlockFromHeader(block, header)
          }
        }
        Blockly.Events.recordUndo = recordUndo
        resolve()
      }, e => {
        Blockly.Events.recordUndo = recordUndo
        reject(e)
      })
    } else {
      reject(translator.translateText('Remote blocks to load must be a collection.'))
    }
  } catch (e) {
    if (e.name === 'BlocklyError') {
      // pass
    } else {
      reject(translator.translateText('Unrecognized file format.'))
    }
  }
})

export const loadRemote = (blockObj) => new Promise((resolve, reject) => {
  let url = blockObj.getFieldValue('URL')
  if (url.indexOf('http') !== 0) {
    url = `http://${url}`
  }
  if (!url.match(/[^/]*\.[a-zA-Z]{3}$/) && url.slice(-1)[0] !== '/') {
    reject(translator.translateText('Target must be an xml file'))
  } else {
    if (url.slice(-1)[0] === '/') {
      url += 'index.xml'
    }
    let isNew = true
    for (const block of getTopBlocksByType('loader')) {
      if (block.id !== blockObj.id && block.url === url) {
        isNew = false
      }
    }
    if (!isNew) {
      disable(blockObj)
      reject(translator.translateText('This url is already loaded'))
    } else {
      $.ajax({
        type: 'GET',
        url,
      }).error((e) => {
        if (e.status) {
          reject(`${translator.translateText('An error occurred while trying to load the url')}: ${e.status} ${e.statusText}`)
        } else {
          reject(translator.translateText('Make sure \'Access-Control-Allow-Origin\' exists in the response from the server'))
        }
        deleteBlocksLoadedBy(blockObj.id)
      }).done((xml) => {
        loadBlocksFromHeader(xml, blockObj).then(() => {
          enable(blockObj)
          blockObj.url = url // eslint-disable-line no-param-reassign
          resolve(blockObj)
        }, reject)
      })
    }
  }
})

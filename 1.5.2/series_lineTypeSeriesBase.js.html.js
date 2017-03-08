tui.util.defineNamespace("fedoc.content", {});
fedoc.content["series_lineTypeSeriesBase.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * @fileoverview LineTypeSeriesBase is base class for line type series.\n * @author NHN Ent.\n *         FE Development Team &lt;dl_javascript@nhnent.com>\n */\n\n'use strict';\n\nvar chartConst = require('../const'),\n    predicate = require('../helpers/predicate'),\n    renderUtil = require('../helpers/renderUtil');\n/**\n * @classdesc LineTypeSeriesBase is base class for line type series.\n * @class LineTypeSeriesBase\n * @mixin\n */\nvar LineTypeSeriesBase = tui.util.defineClass(/** @lends LineTypeSeriesBase.prototype */ {\n    /**\n     * Make positions of line chart.\n     * @returns {Array.&lt;Array.&lt;object>>} positions\n     * @private\n     */\n    _makeBasicPositions: function() {\n        var dimension = this.boundsMaker.getDimension('series'),\n            seriesDataModel = this.dataProcessor.getSeriesDataModel(this.chartType),\n            width = dimension.width,\n            height = dimension.height,\n            len = seriesDataModel.getGroupCount(),\n            start = chartConst.SERIES_EXPAND_SIZE,\n            step;\n\n        if (this.data.aligned) {\n            step = width / (len - 1);\n        } else {\n            step = width / len;\n            start += (step / 2);\n        }\n\n        return seriesDataModel.map(function(seriesGroup) {\n            return seriesGroup.map(function(seriesItem, index) {\n                var position = {\n                    left: start + (step * index),\n                    top: height - (seriesItem.ratio * height) + chartConst.SERIES_EXPAND_SIZE\n                };\n\n                if (tui.util.isExisty(seriesItem.startRatio)) {\n                    position.startTop = height - (seriesItem.startRatio * height) + chartConst.SERIES_EXPAND_SIZE;\n                }\n\n                return position;\n            });\n        }, true);\n    },\n\n    /**\n     * Calculate label position top.\n     * @param {{top: number, startTop: number}} basePosition - base position\n     * @param {number} value - value of seriesItem\n     * @param {number} labelHeight - label height\n     * @param {boolean} isStart - whether start value of seriesItem or not\n     * @returns {number} position top\n     * @private\n     */\n    _calculateLabelPositionTop: function(basePosition, value, labelHeight, isStart) {\n        var baseTop = basePosition.top,\n            top;\n\n        if (predicate.isValidStackedOption(this.options.stacked)) {\n            top = (basePosition.startTop + baseTop - labelHeight) / 2 + 1;\n        } else if ((value >= 0 &amp;&amp; !isStart) || (value &lt; 0 &amp;&amp; isStart)) {\n            top = baseTop - labelHeight - chartConst.SERIES_LABEL_PADDING;\n        } else {\n            top = baseTop + chartConst.SERIES_LABEL_PADDING;\n        }\n\n        return top;\n    },\n\n    /**\n     * Make label position for rendering label of series area.\n     * @param {{left: number, top: number, startTop: ?number}} basePosition - base position for calculating\n     * @param {number} labelHeight - label height\n     * @param {(string | number)} label - label of seriesItem\n     * @param {number} value - value of seriesItem\n     * @param {boolean} isStart - whether start label position or not\n     * @returns {{left: number, top: number}}\n     * @private\n     */\n    _makeLabelPosition: function(basePosition, labelHeight, label, value, isStart) {\n        var labelWidth = renderUtil.getRenderedLabelWidth(label, this.theme.label);\n\n        return {\n            left: basePosition.left - (labelWidth / 2),\n            top: this._calculateLabelPositionTop(basePosition, value, labelHeight, isStart)\n        };\n    },\n\n    /**\n     * Make html for series label for line type chart.\n     * @param {number} groupIndex - index of seriesDataModel.groups\n     * @param {number} index - index of seriesGroup.items\n     * @param {SeriesItem} seriesItem - series item\n     * @param {number} labelHeight - label height\n     * @param {boolean} isStart - whether start label position or not\n     * @returns {string}\n     * @private\n     */\n    _makeSeriesLabelHtmlForLineType: function(groupIndex, index, seriesItem, labelHeight, isStart) {\n        var basePosition = tui.util.extend({}, this.seriesData.groupPositions[groupIndex][index]),\n            label, position;\n\n        if (isStart) {\n            label = seriesItem.startLabel;\n            basePosition.top = basePosition.startTop;\n        } else {\n            label = seriesItem.endLabel;\n        }\n\n        position = this._makeLabelPosition(basePosition, labelHeight, label, seriesItem.value, isStart);\n\n        return this._makeSeriesLabelHtml(position, label, groupIndex);\n    },\n\n    /**\n     * Render series label.\n     * @param {HTMLElement} elSeriesLabelArea series label area element\n     * @private\n     */\n    _renderSeriesLabel: function(elSeriesLabelArea) {\n        var self = this,\n            seriesDataModel = this.dataProcessor.getSeriesDataModel(this.chartType),\n            firstLabel = seriesDataModel.getFirstItemLabel(),\n            labelHeight = renderUtil.getRenderedLabelHeight(firstLabel, this.theme.label),\n            htmls;\n\n        htmls = seriesDataModel.map(function(seriesGroup, groupIndex) {\n            return seriesGroup.map(function(seriesItem, index) {\n                var labelHtml = self._makeSeriesLabelHtmlForLineType(groupIndex, index, seriesItem, labelHeight);\n\n                if (seriesItem.isRange) {\n                    labelHtml += self._makeSeriesLabelHtmlForLineType(groupIndex, index, seriesItem, labelHeight, true);\n                }\n\n                return labelHtml;\n            }).join('');\n        }, true);\n\n        elSeriesLabelArea.innerHTML = htmls.join('');\n    },\n\n    /**\n     * Whether changed or not.\n     * @param {number} groupIndex group index\n     * @param {number} index index\n     * @returns {boolean} whether changed or not\n     * @private\n     */\n    _isChanged: function(groupIndex, index) {\n        var prevIndexes = this.prevIndexes;\n\n        this.prevIndexes = {\n            groupIndex: groupIndex,\n            index: index\n        };\n\n        return !prevIndexes || (prevIndexes.groupIndex !== groupIndex) || (prevIndexes.index !== index);\n    },\n\n    /**\n     * To call showGroupTooltipLine function of graphRenderer.\n     * @param {{\n     *      dimension: {width: number, height: number},\n     *      position: {left: number, top: number}\n     * }} bound bound\n     */\n    onShowGroupTooltipLine: function(bound) {\n        if (!this.graphRenderer.showGroupTooltipLine) {\n            return;\n        }\n        this.graphRenderer.showGroupTooltipLine(bound);\n    },\n\n    /**\n     * To call hideGroupTooltipLine function of graphRenderer.\n     */\n    onHideGroupTooltipLine: function() {\n        if (!this.graphRenderer.hideGroupTooltipLine) {\n            return;\n        }\n        this.graphRenderer.hideGroupTooltipLine();\n    }\n});\n\nLineTypeSeriesBase.mixin = function(func) {\n    tui.util.extend(func.prototype, LineTypeSeriesBase.prototype);\n};\n\nmodule.exports = LineTypeSeriesBase;\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"
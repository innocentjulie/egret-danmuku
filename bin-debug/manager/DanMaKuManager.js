var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
/**
 * 弹幕
 *
 */
var DanMaKuManager = (function () {
    function DanMaKuManager() {
        this._layer = new egret.DisplayObjectContainer();
        this._paddingY = 130;
        /**
         * 同屏幕最大显示行数
         */
        this._maxLines = 4;
        /**
         * 单行高度
         */
        this._lineHeight = 40;
        /**
         * 队列
         */
        this._queueList = [];
        //从0开始
        this._index = -1;
        //用作计算，第一列字符长度，用作计算距离
        this._data = {};
        //准备要跑的，超出的进队列
        this._delayNum = 0;
        if (DanMaKuManager.instance) {
            throw "DanMaKuManager inited ....";
        }
    }
    DanMaKuManager.getInstance = function () {
        if (!DanMaKuManager.instance)
            DanMaKuManager.instance = new DanMaKuManager();
        return DanMaKuManager.instance;
    };
    /**
     * 初始化
     */
    DanMaKuManager.prototype.init = function (layer) {
        layer.addChild(this._layer);
        this._layer.y = this._paddingY;
    };
    DanMaKuManager.prototype.add = function (text, color, size, speed, assignedIndex) {
        if (color === void 0) { color = 0xFFFFFF; }
        if (size === void 0) { size = 22; }
        if (speed === void 0) { speed = 0; }
        if (assignedIndex === void 0) { assignedIndex = -1; }
        return __awaiter(this, void 0, void 0, function () {
            var danInfo, y, delay, id, rowId, columnId, distance, stageWidth, t;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        //如果前面没播放完，放入队列
                        if (this._delayNum >= this._maxLines) {
                            this._queueList.push([text, color, size, speed]);
                            return [2 /*return*/];
                        }
                        //按照顺序来放
                        this._index++;
                        y = 0;
                        delay = 0;
                        id = assignedIndex == -1 ? this._index : assignedIndex;
                        rowId = id % this._maxLines;
                        columnId = Math.floor(id / this._maxLines);
                        y = (rowId + 1) * this._lineHeight;
                        //对应rowId前面一列
                        danInfo = this._data[(columnId - 1) * this._maxLines + rowId];
                        //每毫秒多少像素
                        if (speed == 0)
                            speed = 0.06;
                        distance = 0;
                        if (!danInfo) {
                            delay = 0;
                        }
                        else {
                            distance = 100 + danInfo.txtWidth - danInfo.speed * (this.nowTime - danInfo.startTime);
                            if (distance <= 0)
                                delay = 0;
                            else {
                                delay = Math.floor(distance / speed);
                            }
                        }
                        danInfo = DanMaKuTxtInfo.create(text, color, y, speed, size);
                        if (delay == 0) {
                            danInfo.startTime = this.nowTime;
                        }
                        else {
                            this._delayNum++;
                        }
                        this._layer.addChild(danInfo.text);
                        this._data[id] = danInfo;
                        //要重新刷屏吗？
                        // egret.updateAllScreens();
                        danInfo.txtWidth = danInfo.text.textWidth;
                        return [4 /*yield*/, this.waitEvent(egret.Tween.get(danInfo.text), delay)];
                    case 1:
                        _a.sent();
                        if (delay > 0) {
                            this.startPlay(id, danInfo, delay);
                        }
                        stageWidth = egret.MainContext.instance.stage.stageWidth;
                        t = Math.floor((stageWidth + danInfo.txtWidth) / speed);
                        return [4 /*yield*/, this.moveEvent(egret.Tween.get(danInfo.text), { x: 0 - danInfo.txtWidth }, t)];
                    case 2:
                        _a.sent();
                        DanMaKuTxtInfo.release(danInfo);
                        this.playComplete(id);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 延时加入
     */
    DanMaKuManager.prototype.waitEvent = function (tweenText, delay) {
        return new Promise(function (resolv, reject) {
            tweenText.wait(delay).call(resolv, null);
        });
    };
    /**
     * 弹幕滚动
     */
    DanMaKuManager.prototype.moveEvent = function (tweenText, toParam, t) {
        return new Promise(function (resolv, reject) {
            tweenText.to(toParam, t).call(resolv, null);
        });
    };
    /**
     * 加入弹幕
     */
    DanMaKuManager.prototype.startPlay = function (id, item, delay) {
        item.startTime = this.nowTime;
        this._delayNum--;
        //插入下一个
        if (this._queueList.length == 0)
            return;
        var data = this._queueList.shift();
        this.add(data[0], data[1], data[2], data[3], id + this._maxLines);
    };
    DanMaKuManager.prototype.playComplete = function (id) {
        this._data[id] = null;
        delete (this._data[id]);
    };
    /**
     * 关掉弹幕
     */
    DanMaKuManager.prototype.removeAll = function () {
        this._queueList = [];
        this._layer.visible = false;
    };
    /**
     * 继续播放弹幕
     */
    DanMaKuManager.prototype.resume = function () {
        this._layer.visible = true;
    };
    Object.defineProperty(DanMaKuManager.prototype, "nowTime", {
        get: function () {
            return new Date().getTime();
        },
        enumerable: true,
        configurable: true
    });
    return DanMaKuManager;
}());
__reflect(DanMaKuManager.prototype, "DanMaKuManager");
/**
 * 弹幕文本对象池
 */
var DanMaKuTxtInfo = (function () {
    function DanMaKuTxtInfo() {
        //毫秒
        this.startTime = 0;
        this.speed = 0;
        this.txtWidth = 0;
        this.text = new egret.TextField();
    }
    DanMaKuTxtInfo.init = function () {
        if (DanMaKuTxtInfo.pool == null) {
            DanMaKuTxtInfo.pool = new game.pool.ObjectPool(true);
            DanMaKuTxtInfo.pool.allocate(1, DanMaKuTxtInfo);
        }
    };
    DanMaKuTxtInfo.create = function (htmlText, color, y, speed, size) {
        if (y === void 0) { y = 0; }
        if (speed === void 0) { speed = 0; }
        DanMaKuTxtInfo.init();
        var item = DanMaKuTxtInfo.pool.createObject();
        var stageWidth = egret.MainContext.instance.stage.stageWidth;
        item.text.width = stageWidth;
        item.text.size = size;
        item.text.textAlign = egret.HorizontalAlign.LEFT;
        item.text.x = stageWidth;
        item.text.textFlow =
            (new egret.HtmlTextParser).parser(htmlText + "");
        item.text.y = y;
        item.text.textColor = color;
        item.text.stroke = 2;
        item.text.strokeColor = 0x000000;
        item.startTime = 0;
        item.speed = speed;
        return item;
    };
    DanMaKuTxtInfo.release = function (item) {
        if (item == null || item.text == null)
            return;
        if (item.text.parent)
            item.text.parent.removeChild(item.text);
        item.dispose();
        DanMaKuTxtInfo.init();
        DanMaKuTxtInfo.pool.releaseObject(item);
    };
    DanMaKuTxtInfo.prototype.removeTween = function () {
        egret.Tween.removeTweens(this.text);
    };
    DanMaKuTxtInfo.prototype.dispose = function () {
        if (this.text) {
            this.text.textColor = 0xFFFFFF;
            this.text.size = 22;
        }
    };
    DanMaKuTxtInfo.pool = null;
    return DanMaKuTxtInfo;
}());
__reflect(DanMaKuTxtInfo.prototype, "DanMaKuTxtInfo", ["game.interfaces.IDispose"]);

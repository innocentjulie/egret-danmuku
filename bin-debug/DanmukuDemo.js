var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var DanmukuDemo = (function (_super) {
    __extends(DanmukuDemo, _super);
    function DanmukuDemo() {
        var _this = _super.call(this) || this;
        _this._size = 22;
        _this._speed = 6;
        _this._color = 0xFF0000;
        _this.addEventListener("complete", _this.onCompelte, _this);
        _this.skinName = "DanmukuDemoSkin";
        _this.addEventListener(egret.TouchEvent.TOUCH_TAP, _this.onTouch, _this);
        return _this;
    }
    Object.defineProperty(DanmukuDemo.prototype, "danmu", {
        get: function () {
            return DanMaKuManager.getInstance();
        },
        enumerable: true,
        configurable: true
    });
    DanmukuDemo.prototype.onCompelte = function (e) {
        this.danmu.init(this._DanmukuGroup);
        // for (let i: number = 0; i < 10; i++)
        // 	this.danmu.add("hahaha来一发" + i)
        this._Size.minimum = 22;
        this._Size.maximum = 50;
        this._Size.value = 1;
        this._Size.addEventListener(eui.UIEvent.CHANGE, this.change1, this);
        this._Speed.minimum = 6;
        this._Speed.maximum = 36;
        this._Speed.value = 2;
        this._Speed.addEventListener(eui.UIEvent.CHANGE, this.change2, this);
        this._Color.minimum = 0xFF0000;
        this._Color.maximum = 0xFFFFFF;
        this._Color.value = 10;
        this._Color.addEventListener(eui.UIEvent.CHANGE, this.change3, this);
        this._Txt.textColor = 0xFF0000;
    };
    DanmukuDemo.prototype.change1 = function (evt) {
        this._size = evt.target.value;
    };
    DanmukuDemo.prototype.change2 = function (evt) {
        this._speed = evt.target.value;
    };
    DanmukuDemo.prototype.change3 = function (evt) {
        this._color = evt.target.value;
        this._Txt.textColor = this._color;
    };
    DanmukuDemo.prototype.onTouch = function (e) {
        switch (e.target) {
            case this._SendBtn:
                this.danmu.add(this._Txt.text, this._color, this._size, this._speed / 100);
                break;
            case this._ClearBtn:
                this.danmu.removeAll();
                break;
            case this._ResumeBtn:
                this.danmu.resume();
                break;
        }
    };
    return DanmukuDemo;
}(eui.Component));
__reflect(DanmukuDemo.prototype, "DanmukuDemo");

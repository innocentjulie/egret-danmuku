var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var game;
(function (game) {
    var pool;
    (function (pool) {
        var ObjectPool = (function () {
            function ObjectPool(grow) {
                if (grow === void 0) { grow = false; }
                /**
                 * 初始化对象数量
                 */
                this._sizeInit = 0;
                this._sizeCurrent = 0;
                this._usageCount = 0;
                this._grow = true;
                this._grow = grow;
            }
            ObjectPool.prototype.clear = function () {
                var node = this._headNode;
                var temp;
                for (; node != null;) {
                    temp = node.next;
                    node.next = null;
                    node.data = null;
                    node = temp;
                }
                this._headNode = this._tailNode = this._emptyNode = this._allocNode = null;
            };
            ObjectPool.prototype.size = function () {
                return this._sizeCurrent;
            };
            ObjectPool.prototype.usageCount = function () {
                return this._usageCount;
            };
            ObjectPool.prototype.wasteCount = function () {
                return this.size() - this.usageCount();
            };
            /**
             * 获取一个对象
             */
            ObjectPool.prototype.createObject = function () {
                //对象池数量不够处理办法           
                if (this.usageCount() == this.size()) {
                    if (this._grow) {
                        var once = false;
                        this._sizeCurrent += this._sizeInit;
                        var node = null;
                        var tail = this._tailNode;
                        var temp = this._tailNode;
                        for (var i = 0; i < this._sizeInit; i++) {
                            node = new ObjectNode();
                            node.data = this._factory.create();
                            temp.next = node;
                            temp = node;
                            if (this._sizeCurrent > 100 && once == false) {
                                once = true;
                                //    console.warn("对象池里面有太多没回收的 "+this._sizeCurrent+" : " + egret.getQualifiedClassName(node.data));
                            }
                        }
                        this._tailNode = temp;
                        this._tailNode.next = this._emptyNode = this._headNode;
                        this._allocNode = tail.next;
                        return this.createObject();
                    }
                    else {
                        throw "对象池已经用完了";
                    }
                }
                else {
                    //从对象池中取一个
                    var data = this._allocNode.data;
                    this._allocNode.data = null;
                    this._allocNode = this._allocNode.next;
                    this._usageCount++;
                    return data;
                }
            };
            ObjectPool.prototype.releaseObject = function (t) {
                if (this.usageCount() > 0) {
                    this._usageCount--;
                    this._emptyNode.data = t;
                    // App.trace("回收了一个"+egret.getQualifiedClassName(t))
                    this._emptyNode = this._emptyNode.next;
                }
            };
            ObjectPool.prototype.setFactory = function (factory) {
                this._factory = factory;
            };
            /**
             * 初始化对象池
             */
            ObjectPool.prototype.allocate = function (size, clazz) {
                if (clazz === void 0) { clazz = null; }
                this.clear();
                if (clazz) {
                    this._factory = new SimpleFactory(clazz);
                }
                else if (!this._factory) {
                    throw "还未设置factory";
                }
                this._sizeCurrent = this._sizeInit = size;
                this._headNode = this._tailNode = new ObjectNode();
                this._headNode.data = this._factory.create();
                var node;
                for (var i = 1; i < this._sizeInit; i++) {
                    node = new ObjectNode();
                    node.data = this._factory.create();
                    node.next = this._headNode;
                    this._headNode = node;
                }
                this._emptyNode = this._allocNode = this._headNode;
                this._tailNode.next = this._headNode;
            };
            ObjectPool.prototype.initialze = function (func) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                var node = this._headNode;
                var callback;
                for (; node != null;) {
                    callback = node.data[func];
                    callback.apply(node.data, args);
                    if (node == this._tailNode)
                        break;
                    node = node.next;
                }
            };
            ObjectPool.prototype.purge = function () {
                var i = 0;
                var node;
                if (this.usageCount() == 0) {
                    if (this._sizeCurrent == this._sizeInit)
                        return;
                    if (this._sizeCurrent > this._sizeInit) {
                        i = 0;
                        node = this._headNode;
                        while (++i < this._sizeInit)
                            node = node.next;
                        this._tailNode = node;
                        this._allocNode = this._emptyNode = this._headNode;
                        this._sizeCurrent = this._sizeInit;
                    }
                }
                else {
                    var arr = [];
                    node = this._headNode;
                    while (node) {
                        if (!node.data)
                            arr[i++] = node;
                        if (node == this._tailNode)
                            break;
                        node = node.next;
                    }
                    this._usageCount = this._sizeCurrent = arr.length;
                    this._tailNode = this._headNode = arr[0];
                    for (i = 1; i < this._sizeCurrent; i++) {
                        node = arr[i];
                        node.next = this._headNode;
                        this._headNode = node;
                    }
                    this._allocNode = this._emptyNode = this._headNode;
                    this._tailNode.next = this._headNode;
                    if (this._usageCount < this._sizeInit) {
                        this._sizeCurrent = this._sizeInit;
                        var n = this._tailNode;
                        var t = this._tailNode;
                        var k = this._sizeInit - this._usageCount;
                        for (i = 0; i < k; i++) {
                            node = new ObjectNode();
                            node.data = this._factory.create();
                            t.next = node;
                            t = node;
                        }
                        this._tailNode = t;
                        this._tailNode.next = this._emptyNode = this._headNode;
                        this._allocNode = n.next;
                    }
                }
            };
            return ObjectPool;
        }());
        pool.ObjectPool = ObjectPool;
        __reflect(ObjectPool.prototype, "game.pool.ObjectPool");
        var ObjectNode = (function () {
            function ObjectNode() {
            }
            return ObjectNode;
        }());
        __reflect(ObjectNode.prototype, "ObjectNode");
        var SimpleFactory = (function () {
            function SimpleFactory(clazz) {
                this._clazz = clazz;
            }
            SimpleFactory.prototype.create = function () {
                return new this._clazz();
            };
            return SimpleFactory;
        }());
        __reflect(SimpleFactory.prototype, "SimpleFactory", ["game.pool.IObjectPoolFactory"]);
    })(pool = game.pool || (game.pool = {}));
})(game || (game = {}));

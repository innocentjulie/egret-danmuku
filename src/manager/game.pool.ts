module game.pool {
    export class ObjectPool<T>{
        private _factory: IObjectPoolFactory<T>;
        /**
         * 初始化对象数量
         */
        private _sizeInit: number = 0;
        private _sizeCurrent: number = 0;
        private _usageCount: number = 0;
        private _grow: boolean = true;
        private _headNode: ObjectNode;
        private _tailNode: ObjectNode;
        private _emptyNode: ObjectNode;
        private _allocNode: ObjectNode;

        constructor(grow: boolean = false) {
            this._grow = grow;
        }

        clear(): void {
            let node: ObjectNode = this._headNode;
            let temp: ObjectNode;
            for (; node != null;) {
                temp = node.next;
                node.next = null;
                node.data = null;
                node = temp;
            }
            this._headNode = this._tailNode = this._emptyNode = this._allocNode = null;
        }

        size(): number {
            return this._sizeCurrent;
        }

        usageCount(): number {
            return this._usageCount;
        }

        wasteCount(): number {
            return this.size() - this.usageCount();
        }

        /**
         * 获取一个对象
         */
        createObject(): T {
            //对象池数量不够处理办法           
            if (this.usageCount() == this.size()) {
                if (this._grow) {
                    let once: boolean = false;
                    this._sizeCurrent += this._sizeInit;
                    let node: ObjectNode = null;
                    let tail: ObjectNode = this._tailNode;
                    let temp: ObjectNode = this._tailNode;
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
                } else {
                    throw "对象池已经用完了";
                }
            } else {
                //从对象池中取一个
                let data: T = this._allocNode.data;
                this._allocNode.data = null;
                this._allocNode = this._allocNode.next;
                this._usageCount++;
                return data;
            }
        }

        releaseObject(t: T): void {
            if (this.usageCount() > 0) {
                this._usageCount--;
                this._emptyNode.data = t;
                // App.trace("回收了一个"+egret.getQualifiedClassName(t))
                this._emptyNode = this._emptyNode.next;
            }
        }

        setFactory(factory: IObjectPoolFactory<T>): void {
            this._factory = factory;
        }

        /**
         * 初始化对象池
         */
        allocate(size: number, clazz: { new (): T; } = null): void {
            this.clear();
            if (clazz) {
                this._factory = new SimpleFactory<T>(clazz);
            } else if (!this._factory) {
                throw "还未设置factory";
            }
            this._sizeCurrent = this._sizeInit = size;
            this._headNode = this._tailNode = new ObjectNode();
            this._headNode.data = this._factory.create();

            let node: ObjectNode;
            for (var i = 1; i < this._sizeInit; i++) {
                node = new ObjectNode();
                node.data = this._factory.create();
                node.next = this._headNode;
                this._headNode = node;
            }
            this._emptyNode = this._allocNode = this._headNode;
            this._tailNode.next = this._headNode;
        }

        initialze(func: string, ...args: any[]): void {
            let node: ObjectNode = this._headNode;
            let callback: Function;
            for (; node != null;) {
                callback = node.data[func] as Function;
                callback.apply(node.data, args);
                if (node == this._tailNode) break;
                node = node.next;
            }
        }

        purge(): void {
            let i: number = 0;
            let node: ObjectNode;

            if (this.usageCount() == 0) {
                if (this._sizeCurrent == this._sizeInit) return;
                if (this._sizeCurrent > this._sizeInit) {
                    i = 0;
                    node = this._headNode;
                    while (++i < this._sizeInit)
                        node = node.next;
                    this._tailNode = node;
                    this._allocNode = this._emptyNode = this._headNode;

                    this._sizeCurrent = this._sizeInit;
                }
            } else {
                let arr: ObjectNode[] = [];
                node = this._headNode;
                while (node) {
                    if (!node.data) arr[i++] = node;
                    if (node == this._tailNode) break;
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

                    let n: ObjectNode = this._tailNode;
                    let t: ObjectNode = this._tailNode;
                    var k: number = this._sizeInit - this._usageCount;
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
        }
    }

    class ObjectNode {
        next: ObjectNode;
        data: any;
    }

    class SimpleFactory<T> implements IObjectPoolFactory<T>{
        private _clazz: { new (): T; };

        constructor(clazz: { new (): T; }) {
            this._clazz = clazz;
        }

        create(): T {
            return new this._clazz();
        }
    }

    export interface IObjectPoolFactory<T> {
        create(): T;
    }
}
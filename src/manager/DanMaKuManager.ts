/**
 * 弹幕
 *
 */
class DanMaKuManager {
    private _layer: egret.DisplayObjectContainer = new egret.DisplayObjectContainer();
    private _paddingY: number = 130;
    /**
     * 同屏幕最大显示行数
     */
    private _maxLines: number = 4;
    /**
     * 单行高度
     */
    private _lineHeight: number = 40;
    /**
     * 队列
     */
    private _queueList: Array<any> = [];
    //从0开始
    private _index: number = -1;
    //用作计算，第一列字符长度，用作计算距离
    private _data: { [k: number]: DanMaKuTxtInfo } = {};
    //准备要跑的，超出的进队列
    private _delayNum: number = 0;

    /**
     * 单例模式
     */
    private static instance: any;
    static getInstance(): DanMaKuManager {
        if (!DanMaKuManager.instance) DanMaKuManager.instance = new DanMaKuManager();
        return DanMaKuManager.instance;
    }
    constructor() {
        if (DanMaKuManager.instance) {
            throw "DanMaKuManager inited ...."
        }
    }
    /**
     * 初始化
     */
    init(layer: egret.DisplayObjectContainer): void {
        layer.addChild(this._layer);
        this._layer.y = this._paddingY;
    }

    async add(text: string, color: number = 0xFFFFFF, size: number = 22, speed: number = 0, assignedIndex: number = -1): Promise<any> {
        //如果前面没播放完，放入队列
        if (this._delayNum >= this._maxLines) {
            this._queueList.push([text, color, size, speed]);
            return;
        }
        //按照顺序来放
        this._index++;
        let danInfo: DanMaKuTxtInfo;
        let y: number = 0;
        let delay: number = 0;
        //delay时间 ,id 从 1开始
        let id: number = assignedIndex == -1 ? this._index : assignedIndex;
        let rowId: number = id % this._maxLines; //0 -3 
        let columnId: number = Math.floor(id / this._maxLines); //  0 开始
        y = (rowId + 1) * this._lineHeight;
        //对应rowId前面一列
        danInfo = this._data[(columnId - 1) * this._maxLines + rowId];
        //每毫秒多少像素
        if (speed == 0) speed = 0.06;
        let distance: number = 0;
        if (!danInfo) {
            delay = 0;
        } else {
            distance = 100 + danInfo.txtWidth - danInfo.speed * (this.nowTime - danInfo.startTime);
            if (distance <= 0) delay = 0;
            else {
                delay = Math.floor(distance / speed);
            }
        }
        danInfo = DanMaKuTxtInfo.create(text, color, y, speed, size);
        if (delay == 0) {
            danInfo.startTime = this.nowTime;
        } else {
            this._delayNum++;
        }
        this._layer.addChild(danInfo.text);
        this._data[id] = danInfo;
        //要重新刷屏吗？
        // egret.updateAllScreens();
        danInfo.txtWidth = danInfo.text.textWidth;
        await this.waitEvent(egret.Tween.get(danInfo.text), delay);
        if (delay > 0) {
            this.startPlay(id, danInfo, delay);
        }
        let stageWidth: number = egret.MainContext.instance.stage.stageWidth;
        let t: number = Math.floor((stageWidth + danInfo.txtWidth) / speed);
        await this.moveEvent(egret.Tween.get(danInfo.text), { x: 0 - danInfo.txtWidth }, t);
        DanMaKuTxtInfo.release(danInfo);
        this.playComplete(id);
    }

    /**
     * 延时加入
     */
    private waitEvent(tweenText: egret.Tween, delay: number): Promise<any> {
        return new Promise((resolv, reject) => {
            tweenText.wait(delay).call(resolv, null);
        })
    }
    /**
     * 弹幕滚动
     */
    private moveEvent(tweenText: egret.Tween, toParam: Object, t: number): Promise<any> {
        return new Promise((resolv, reject) => {
            tweenText.to(toParam, t).call(resolv, null);
        })

    }
    /**
     * 加入弹幕
     */
    private startPlay(id: number, item: DanMaKuTxtInfo, delay: number): void {
        item.startTime = this.nowTime;
        this._delayNum--;
        //插入下一个
        if (this._queueList.length == 0) return;
        let data: any = this._queueList.shift();
        this.add(data[0], data[1], data[2], data[3], id + this._maxLines);
    }
    private playComplete(id: number): void {
        this._data[id] = null;
        delete (this._data[id]);
    }

    /**
     * 关掉弹幕
     */
    removeAll(): void {
        this._queueList = [];
        this._layer.visible = false;
    }

    /**
     * 继续播放弹幕
     */
    resume(): void {
        this._layer.visible = true;
    }

    private get nowTime(): number {
        return new Date().getTime();
    }
}


/**
 * 弹幕文本对象池
 */
class DanMaKuTxtInfo implements game.interfaces.IDispose {
    private static pool: game.pool.ObjectPool<DanMaKuTxtInfo> = null;

    private static init(): void {
        if (DanMaKuTxtInfo.pool == null) {
            DanMaKuTxtInfo.pool = new game.pool.ObjectPool<DanMaKuTxtInfo>(true);
            DanMaKuTxtInfo.pool.allocate(1, DanMaKuTxtInfo);
        }
    }

    static create(htmlText: string, color: number, y: number = 0, speed: number = 0, size: number): DanMaKuTxtInfo {
        DanMaKuTxtInfo.init();
        let item: DanMaKuTxtInfo = DanMaKuTxtInfo.pool.createObject();
        let stageWidth: number = egret.MainContext.instance.stage.stageWidth;
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
    }

    static release(item: DanMaKuTxtInfo): void {
        if (item == null || item.text == null) return;
        if (item.text.parent) item.text.parent.removeChild(item.text);
        item.dispose();
        DanMaKuTxtInfo.init();
        DanMaKuTxtInfo.pool.releaseObject(item);
    }
    public text: egret.TextField;
    //毫秒
    public startTime: number = 0;
    public speed: number = 0;
    public txtWidth: number = 0;

    constructor() {
        this.text = new egret.TextField();
    }
    removeTween(): void {
        egret.Tween.removeTweens(this.text);
    }

    dispose(): void {
        if (this.text) {
            this.text.textColor = 0xFFFFFF;
            this.text.size = 22;
        }
    }
}
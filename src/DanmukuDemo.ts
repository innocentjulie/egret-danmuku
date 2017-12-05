class DanmukuDemo extends eui.Component {

	public _Txt: eui.EditableText;
	public _Color: eui.HSlider;
	public _Size: eui.HSlider;
	public _Speed: eui.HSlider;
	public _SendBtn: eui.Button;
	public _ClearBtn: eui.Button;
	public _ResumeBtn: eui.Button;
	public _DanmukuGroup: eui.Group;

	public constructor() {
		super();
		this.addEventListener("complete", this.onCompelte, this);
		this.skinName = "DanmukuDemoSkin";
		this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouch, this);
	}
	private get danmu(): DanMaKuManager {
		return DanMaKuManager.getInstance();
	}

	private onCompelte(e: any): void {
		this.danmu.init(this._DanmukuGroup);
		// for (let i: number = 0; i < 10; i++)
		// 	this.danmu.add("hahaha来一发" + i)
		this._Size.minimum = 22;
		this._Size.maximum = 50;
		this._Size.value = 1;
		this._Size.addEventListener(eui.UIEvent.CHANGE, this.change1, this);

		this._Speed.minimum =  6;
		this._Speed.maximum =  36;
		this._Speed.value =  2;
		this._Speed.addEventListener(eui.UIEvent.CHANGE, this.change2, this);

		this._Color.minimum = 0xFF0000;
		this._Color.maximum = 0xFFFFFF;
		this._Color.value =10;
		this._Color.addEventListener(eui.UIEvent.CHANGE, this.change3, this);
		this._Txt.textColor = 0xFF0000;
	}
	private _size: number = 22;
	private _speed: number =  6;
	private _color:number =0xFF0000;

	private change1(evt: eui.UIEvent): void {
		this._size = evt.target.value;

	}
	private change2(evt: eui.UIEvent): void {
		this._speed = evt.target.value;
	}
	private change3(evt: eui.UIEvent): void {
		this._color = evt.target.value;
		this._Txt.textColor = this._color;
	}
	private onTouch(e: egret.TouchEvent): void {
		switch (e.target) {
			case this._SendBtn:
				this.danmu.add(this._Txt.text,this._color,this._size,this._speed/100);
				break;
				case this._ClearBtn:
				this.danmu.removeAll();
				break ;
				case this._ResumeBtn:
				this.danmu.resume();
				break;
		}


	}
}
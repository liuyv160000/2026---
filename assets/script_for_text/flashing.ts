import { _decorator, Component, Node, Label } from 'cc';
import { Timer } from '../sripts/Timer';
const { ccclass, property } = _decorator;

@ccclass('flashing')
export class flashing extends Component {
    private label: Label = null;
    private flashingDuration: number = 5; // 闪烁持续时间，单位为秒
    private change_step: number; // 闪烁切换的时间间隔，单位为秒
    private chanhe_state: number = -1; // 当前闪烁状态，1表示正常，-1表示变暗

    protected onLoad(): void {
        this.label = this.getComponent(Label);
        if (!this.label) {
            // Label 组件未找到，保持静默处理
        }
        this.flashingDuration = 5; // 设置闪烁持续时间为5秒
        this.change_step = 1; // 计算每秒需要改变的透明度值
        this.chanhe_state = -1; // 从变暗开始
    }

    start() {

    }

    update(deltaTime: number) {
    }



}



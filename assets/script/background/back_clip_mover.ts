// 背景片段移动控制：用于按步进移动单个背景节点
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('back_clip_mover')
export class back_clip_mover extends Component {
    // 组件启动
    start() {

    }

    // 帧更新占位
    update(deltaTime: number) {
        
    }

    // 按给定位移和步进方向移动背景
    public move_back(move_distance:number, step:number){
        this.node.setPosition(this.node.position.x + step*move_distance, this.node.position.y);  
    
    }

}



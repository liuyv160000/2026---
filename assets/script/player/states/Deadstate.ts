// 玩家死亡状态
import { _decorator, Component, Node, director } from 'cc';
import { IState } from "../../fms/FMS";
import { Playercontralor } from '../Playercontralor';
const { ccclass, property } = _decorator;

@ccclass('Deadstate')
export class Deadstate extends Component implements IState{
    private player: Playercontralor; // 关联的玩家实例

    // 传入玩家实例
    constructor(player: Playercontralor){
        super();
        this.player = player;
    }


    // 状态启动
    start() {

    }

    // 状态更新
    update(deltaTime: number) {
        
    }

    // 进入死亡状态，延迟切换场景
    enter(): void {
        console.log("Player has died. Transitioning to fail scene...希腊啊你");
         this.scheduleOnce(() => {
            this.on_load_fail_scene();
        }, 0.5); // 0.5秒后执行回调函数
    }

    // 退出死亡状态
    exit(): void {
    }

     // 加载失败场景
     on_load_fail_scene() {
        // 切换场景
        director.loadScene('fail_scene');
    }
}



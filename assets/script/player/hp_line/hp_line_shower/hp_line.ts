// 血条显示：根据玩家血量缩放
import { _decorator, Component, Node, Vec3 } from 'cc';
import {Playercontralor} from '../../Playercontralor';
const { ccclass, property } = _decorator;

@ccclass('hp_line')
export class hp_line extends Component {
    @property({type: Node})
    private player_node: Node = null; // 玩家节点
    private player_hp : number = 0; // 玩家当前血量

    // 组件启动：初始化血量
    start() {
        this.player_hp = this.player_node.getComponent(Playercontralor).health; // 获取玩家当前血量


    }

    // 帧更新占位
    update(deltaTime: number) {
        
    }

    // 根据当前血量更新血条长度
    change_hp_line(){
        //根据玩家当前血量显示血条
        this.player_hp = this.player_node.getComponent(Playercontralor).health; // 更新玩家当前血量
        if(this.player_hp < 0) this.player_hp = 0; // 确保血量不为负数
        this.node.scale = new Vec3(this.player_hp/100,1,1); // 假设玩家满血为100，根据当前血量调整血条长度
    }
}



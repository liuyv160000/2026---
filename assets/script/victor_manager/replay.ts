// 胜利界面按钮：重新开始关卡
import { _decorator, Component, Node, Button } from 'cc';
import { director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('replay')
export class replay extends Component {
    @property(Button)
    private button: Button = null; // 按钮组件


    // 绑定点击事件
    protected onLoad(): void {
         if (this.button) {
            this.button.node.on('click', this.onLoadScene, this);
        }
    }

    // 重新加载关卡场景
    onLoadScene() {
        // 切换场景
        director.loadScene('ex_scene');
    }

    // 组件启动
    start() {

    }

    // 帧更新占位
    update(deltaTime: number) {
        
    }
}



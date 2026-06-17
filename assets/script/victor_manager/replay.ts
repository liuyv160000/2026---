// 胜利界面按钮：重新开始关卡
import { _decorator, Component, Node, Button } from 'cc';
import { director } from 'cc';
import { scene_manager } from '../../game_secne/scene_manager/scene_manager';
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
        const lastScene = scene_manager.getInstance().getLastGameScene();
        director.loadScene(lastScene);
    }

    // 组件启动
    start() {

    }

    // 帧更新占位
    update(deltaTime: number) {
        
    }
}



// 主菜单按钮：进入关卡选择或返回主菜单
import { _decorator, Component, Node,Button } from 'cc';
import { director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('button_enter')
export class button_enter extends Component {
    @property(Button)
    private button: Button = null; // 按钮组件

    // 绑定点击事件
    protected onLoad(): void {
        if (this.button) {
            this.button.node.on('click', this.onLoadScene, this);
        }
    }
    

     // 进入关卡选择场景
     onLoadScene() {
        // 切换场景
        director.loadScene('ex_choosing_scene');
    }

     // 返回主菜单场景
     onBackToMenu() {
        // 返回主菜单
        director.loadScene('main_scene');
    }

    // 组件启动
    start() {

    }

    // 帧更新占位
    update(deltaTime: number) {
        
    }
}



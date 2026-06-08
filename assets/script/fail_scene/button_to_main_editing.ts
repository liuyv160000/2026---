// 失败界面按钮：返回编辑场景
import { _decorator, Component, Node, Button, director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('button_to_main_editing')
export class button_to_main_editing extends Component {
    @property(Button)
    button: Button = null; // 按钮组件

    // 绑定点击事件
    protected onLoad(): void {
        if (this.button) {
            this.button.node.on('click', this.onLoadScene, this);
        }
    }
    

    // 切换到编辑场景
    onLoadScene() {
        // 切换场景
        director.loadScene('editing_scene');
    }

    // 组件启动
    start() {

    }

    // 帧更新占位
    update(deltaTime: number) {
        
    }
}



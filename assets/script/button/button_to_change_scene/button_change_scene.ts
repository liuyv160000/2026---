import { _decorator, Component, Node, Button, director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('button_change_scene')
export class button_change_scene extends Component {
    @property(String)
    private targetScene: string = ''; // 目标场景名称

    @property(Button)
    private button: Button = null; // 按钮组件

     // 绑定点击事件
    protected onLoad(): void {
        if (this.button) {
            this.button.node.on('click', this.onLoadScene, this);
        }
    }

    onLoadScene()
    {
        // 切换场景
        director.loadScene(this.targetScene);
    }

    start() {

    }

    update(deltaTime: number) {
        
    }
}



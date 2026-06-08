import { _decorator, Component, Node, EventKeyboard, KeyCode, input, Input,
        director,
        RichText
 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ex_choosing')
export class ex_choosing extends Component {

    private childNodes: Node[] = [];  // 存储子节点的数组
    private arr_n: number = 0; // 子节点数量
    private currentIndex: number = 0; // 当前选择的子节点索引
    private scene_names: string[] = []; // 场景名称数组

    @property(RichText)
    private tips: RichText = null; // 提示文本组件

    protected onLoad(): void {
        this.childNodes = this.node.children; // 获取所有子节点
        this.arr_n = this.childNodes.length;
        this.currentIndex = 0; // 初始化当前索引为0
        this.scene_names = ['ex_scene']; // 场景名称数组
        
        this.initInput(); // 初始化输入系统
    }

    private initInput(): void {
            input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        }

    protected onKeyDown(event: EventKeyboard): void {
        if(event.keyCode === KeyCode.SPACE) {
            director.loadScene(this.scene_names[this.currentIndex]);
        }
        if (event.keyCode === KeyCode.KEY_D) {
            if(this.currentIndex >= this.arr_n - 1){
                return;
            } 
            this.show_children(1); // 按下A键，显示子节点
            this.currentIndex++;
        }
        else if (event.keyCode === KeyCode.KEY_A) {
            if(this.currentIndex <= 0){
                return;
            }
            this.show_children(-1); // 按下D键，显示子节点
            this.currentIndex--;
        }
    }
        

    start() {
        this.tips.string = "<color=#00ff00>" +  this.scene_names[0] + "</color>"; // 更新提示文本
    }

    update(deltaTime: number) {
        
    }

    show_children(way: number)
    {
        for(let i = 0; i < this.arr_n; i++)
        {
            this.childNodes[i].setPosition(this.childNodes[i].position.x - 300*way, this.childNodes[i].position.y); // 将当前索引的子节点向上移动50像素
        }
        this.tips.string = "<color=#00ff00>" +  this.scene_names[this.currentIndex + way] + "</color>"; // 更新提示文本
        if(this.currentIndex == 0)
        {
            
        }
        else if(this.currentIndex == this.arr_n)
        {

        }
        else
        {

        }
    }

}



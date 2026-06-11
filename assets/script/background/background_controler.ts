// 背景滚动与循环控制
import { _decorator, Component, Node, UITransform } from 'cc';
import { Timer } from '../Timer';
const { ccclass, property } = _decorator;

@ccclass('background_controler')
export class background_controler extends Component {
    @property({type: Number, tooltip: "背景滚动速度，单位像素/秒" })
    public speed: number = 2400; // 背景滚动速度
    private childNodes: Node[] = []; // 缓存背景片段节点
    @property
    public move_idx = 0; // 下一个需要循环的片段索引
    private move_distance: number = 0; // 单个片段宽度
    private arr_n:number = 0; // 片段数量
    @property
    private loop_time = 0; // 移动一个片段所需时间

    @property(Timer)
    public timer: Timer = null; // 用于循环间隔的计时器

    public is_paused = false; //游戏是否暂停

    // 初始化背景片段数据与计时器
    protected onLoad(): void {
        this.childNodes = this.node.children;
        this.arr_n = this.childNodes.length;
        this.move_distance = this.childNodes[0].getComponent(UITransform).contentSize.width;
        this.move_idx = 0;
        for (let i = 0; i < this.childNodes.length; i++) {
            const childNode = this.childNodes[i];
            const uiTransform = childNode.getComponent(UITransform);
        }
        this.loop_time = this.move_distance / this.speed;
        this.timer = this.node.addComponent(Timer);
    }

    // 组件启动
    start() {
        
    }

    // 帧更新：推进滚动与循环
    update(deltaTime: number) {
        if(this.is_paused) return; // 如果游戏暂停，跳过更新逻辑
        this.move_back(deltaTime);
        if(this.timer.get_elapsedTime() >= this.loop_time){
            this.timer.reset();
            let idx = this.move_idx;
            this.loop_move_back(idx);
            this.move_idx = (this.move_idx + 1) % this.arr_n;
        }
    }

     // 背景整体向左移动
     move_back(deltatime: number){
       this.node.setPosition(this.node.position.x - this.speed * deltatime, this.node.position.y);
    }

    // 将指定片段移动到队尾
    loop_move_back(index: number){
        const childNode = this.childNodes[index];
        childNode.setPosition(childNode.position.x + (this.arr_n)  * this.move_distance, childNode.position.y);
    }

    // 暂停背景滚动
    public Pause(){
        if(this.is_paused) return;
        this.is_paused = true;
    }

    // 恢复背景滚动
    public Resume(){
        if(!this.is_paused) return;
        this.is_paused = false;
    }
    
    

}



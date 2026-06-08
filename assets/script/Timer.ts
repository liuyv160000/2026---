// 定时器组件：提供计时与回调触发能力
import { _decorator, Component } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Timer')
export class Timer extends Component {
    private duration: number = 0; // 定时器持续时间
    private elapsedTime: number = 0; // 已经过去的时间
    private isRunning: boolean = false; // 定时器是否正在运行
    private callback: () => void = null; // 定时器结束时的回调函数  

    // 定时器结束后的默认回调
    end_tip(): void {
        // Timer 结束回调：保持静默处理
    }

    // 进入计时逻辑前的占位钩子
    enter(): void {
      
    }

    // 退出计时逻辑后的占位钩子
    exit(): void {
        
    }
    
    // 组件启动时初始化
    start() {
        this.callback = this.end_tip;
        this.set_using();
    }

    // 帧更新时驱动计时
    update(deltaTime: number) {
        if(this.isRunning){
            this.working(deltaTime);
        }
    }

    // 开始计时
    set_using(): void {
        this.isRunning = true;
        
    }

    // 计时累加
    working(deltaTime: number): void
    {
        if (this.isRunning) {
            this.elapsedTime += deltaTime;
        }
    }

    // 重置已过去时间
    reset(){
        this.elapsedTime = 0;
    }

    // 重新开始计时
    reStart(){
        this.reset();
        this.set_using();
    }

    // 获取持续时间
    public get_duration(): number {
        return this.duration;
    }

    // 获取已过去时间
    public get_elapsedTime(): number {
        return this.elapsedTime;
    }

    // 设置持续时间
    public set_duration(duration: number): void {
        this.duration = duration;
    }

    // 检查是否到期并触发回调
    public check_if_end(): boolean {
        if (this.elapsedTime >= this.duration) {
            this.reset();
            if (this.callback) {
                this.callback();
            }
            return true;
        }
        return false;
    }
        

    // 停止计时
    stop(){ 
        this.isRunning = false;
    }

}



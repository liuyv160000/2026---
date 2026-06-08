import { _decorator, Component, Node, Prefab, instantiate, Animation, tween, Vec3, UIOpacity } from 'cc';
import { Timer } from '../Timer';

const { ccclass, property } = _decorator;

@ccclass('annoucer')
export class annoucer extends Component {
    // 单例实例
    private static _instance: annoucer = null;
    
    // 特殊播报字幕预制体
    @property(Prefab)
    private num_0: Prefab = null;
    @property(Prefab)
    private num_1: Prefab = null;
    @property(Prefab)
    private num_2: Prefab = null;
    @property(Prefab)
    private num_3: Prefab = null;
    @property(Prefab)
    private num_4: Prefab = null;
    @property(Prefab)
    private num_5: Prefab = null;
    @property(Prefab)
    private num_6: Prefab = null;
    @property(Prefab)
    private num_7: Prefab = null;
    @property(Prefab)
    private num_8: Prefab = null;
    @property(Prefab)
    private num_9: Prefab = null;   
    private num_prefabs: Prefab[] = []; // 数字预制体数组

    @property(Prefab)
    private kill_art_font: Prefab = null; // "Kill"字样预制体

    @property({ tooltip: "数字与Kill字样的垂直间距" })
    private vertical_spacing: number = -80;

    @property({ tooltip: "动画缩放起始值" })
    private anim_start_scale: number = 0.5;
    
    @property({ tooltip: "动画缩放结束值" })
    private anim_end_scale: number = 1.2;
    
    @property({ tooltip: "入场动画持续时间(秒)" })
    private anim_duration: number = 0.3;
    
    @property({ tooltip: "显示停留时间(秒)" })
    private display_duration: number = 1.5;
    
    @property({ tooltip: "淡出动画持续时间(秒)" })
    private fade_out_duration: number = 0.5;

    private kill_num: number = 0; // 当前击杀数
    private current_display_nodes: Node[] = []; // 当前显示的所有节点数组
    private current_display_kill_count: number = -1; // 当前显示的击杀数
    private active_tweens: any[] = []; // 存储所有活跃的动画
    private is_fading_out: boolean = false; // 是否正在淡出

    

    timer_test: Timer = null;

    onLoad() {
        // 单例初始化
        if (annoucer._instance) {
            console.warn('annoucer实例已存在，销毁当前节点');
            this.node.destroy();
            return;
        }
        annoucer._instance = this;
        
        this.kill_num = 0;
        this.timer_test = this.addComponent(Timer);
        this.timer_test.set_duration(2);
        // 将预制体添加到数组中
        this.num_prefabs = [this.num_0, this.num_1, this.num_2, this.num_3, this.num_4, 
                            this.num_5, this.num_6, this.num_7, this.num_8, this.num_9];
    }

    // 获取单例
    public static getInstance(): annoucer {
        return annoucer._instance;
    }

    // 根据击杀数生成对应的字幕
    public announce_kill_count(killCount: number): void {
        this.kill_num = killCount;
        
        // 如果是相同的击杀数，跳过
        if (killCount === this.current_display_kill_count) return;
        
        // 停止所有动画并移除旧的播报
        this.clear_current_display();
        
        // 重置淡出状态
        this.is_fading_out = false;
        
        // 生成新的播报
        this.display_kill_count(killCount);
        this.current_display_kill_count = killCount;
    }
    
    // 显示击杀数
    private display_kill_count(killCount: number): void {
        const allNodes: Node[] = []; // 收集所有需要动画的节点
        
        // 1. 显示数字（上方）
        const digits = killCount.toString().split('');
        let xOffset = 0;
        const digitSpacing = 60;
        
        for (let i = 0; i < digits.length; i++) {
            const digitValue = parseInt(digits[i]);
            if (digitValue >= 0 && digitValue <= 9) {
                const num_show = instantiate(this.num_prefabs[digitValue]);
                num_show.setPosition(
                    this.node.position.x + xOffset,
                    this.node.position.y,
                    this.node.position.z
                );
                this.node.parent.addChild(num_show);
                this.current_display_nodes.push(num_show);
                allNodes.push(num_show);
                
                xOffset += digitSpacing;
            }
        }

        // 2. 显示Kill字样（下方）
        if (this.kill_art_font) {
            const kill_text = instantiate(this.kill_art_font);
            
            // 计算Kill字样的位置（数字中心下方）
            const numbersCenterX = this.node.position.x + xOffset / 2 - digitSpacing / 2;
            const killPositionY = this.node.position.y + this.vertical_spacing;
            
            kill_text.setPosition(
                numbersCenterX,
                killPositionY,
                this.node.position.z
            );
            this.node.parent.addChild(kill_text);
            this.current_display_nodes.push(kill_text);
            allNodes.push(kill_text);
        }

        // 3. 同步动画 - 所有元素同时开始
        this.apply_synchronized_entrance(allNodes);
        
        // 4. 设置淡出计时器
        this.schedule_fade_out();
    }
    
    // 同步入场动画 - 所有元素同时播放
    private apply_synchronized_entrance(nodes: Node[]): void {
        // 清除旧的动画引用
        this.active_tweens = [];
        
        for (const node of nodes) {
            // 检查是否有Animation组件
            const animation = node.getComponent(Animation);
            if (animation) {
                // 如果有Animation组件，立即播放
                animation.play();
            }
            
            // 同时应用缩放动画（与Animation同步进行）
            node.setScale(new Vec3(this.anim_start_scale, this.anim_start_scale, 1));
            
            const scaleTween = tween(node)
                .to(this.anim_duration, { 
                    scale: new Vec3(this.anim_end_scale, this.anim_end_scale, 1) 
                }, {
                    easing: 'backOut'
                })
                .to(this.anim_duration * 0.5, { 
                    scale: new Vec3(1, 1, 1) 
                }, {
                    easing: 'sineOut'
                })
                .start();
            
            this.active_tweens.push(scaleTween);
        }
    }
    
    // 设置淡出效果
    private schedule_fade_out(): void {
        // 取消之前的淡出计划
        this.unschedule(this.start_fade_out_all);
        
        // 在显示持续时间后开始淡出
        this.scheduleOnce(this.start_fade_out_all, this.display_duration);
    }
    
    // 统一开始所有元素的淡出动画
    private start_fade_out_all(): void {
        if (this.is_fading_out) return;
        this.is_fading_out = true;
        
        // 为所有节点（数字+Kill）同时应用相同的淡出效果
        for (const node of this.current_display_nodes) {
            if (node && node.isValid) {
                this.apply_fade_out(node);
            }
        }
        
        // 淡出完成后清除节点
        this.scheduleOnce(() => {
            this.clear_current_display();
        }, this.fade_out_duration + 0.1);
    }
    
    // 应用统一的淡出效果到单个节点
    private apply_fade_out(node: Node): void {
        // 获取或添加UIOpacity组件
        let uiOpacity = node.getComponent(UIOpacity);
        if (!uiOpacity) {
            uiOpacity = node.addComponent(UIOpacity);
        }
        uiOpacity.opacity = 255;
        
        // 统一缩放参数
        const fadeOutTween = tween(node)
            .to(this.fade_out_duration, {
                scale: new Vec3(0.8, 0.8, 1)
            }, {
                easing: 'sineIn'
            })
            .start();
        
        // 统一透明度变化参数
        const opacityTween = tween(uiOpacity)
            .to(this.fade_out_duration, {
                opacity: 0
            }, {
                easing: 'sineIn'
            })
            .start();
        
        this.active_tweens.push(fadeOutTween, opacityTween);
    }
    
    // 清除当前显示的播报
    private clear_current_display(): void {
        // 停止所有活跃的动画
        for (const tw of this.active_tweens) {
            if (tw) tw.stop();
        }
        this.active_tweens = [];
        
        // 取消所有计划任务
        this.unschedule(this.start_fade_out_all);
        
        // 销毁所有节点
        for (const node of this.current_display_nodes) {
            if (node && node.isValid) {
                // 停止节点上的所有动画
                tween(node).stop();
                
                // 停止Animation组件
                const animation = node.getComponent(Animation);
                if (animation) {
                    animation.stop();
                }
                
                node.destroy();
            }
        }
        this.current_display_nodes = [];
        this.current_display_kill_count = -1;
        this.is_fading_out = false;
    }

    start() {
        // 可以在这里添加初始化逻辑
    }

    update(deltaTime: number) {
        // 原有的测试代码（已注释）
        // if(this.timer_test.check_if_end()){
        //     this.timer_test.reset();
        //     this.put_test();
        //     this.kill_num = (this.kill_num + 1) % 10;
        // }
    }
    
    put_test()
    {
        // 测试方法
        this.announce_kill_count(this.kill_num);
    }

    public get_killed_event() {
        this.kill_num = (this.kill_num + 1) % 100;
        this.announce_kill_count(this.kill_num);
    }
    
    // 销毁时清理
    onDestroy() {
        this.clear_current_display();
        if (annoucer._instance === this) {
            annoucer._instance = null;
        }
    }
}
import { _decorator, Component, Node, Prefab, instantiate, Animation, tween, Vec3, UIOpacity } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('background_annoucer')
export class background_annoucer extends Component {
    // 单例实例
    private static _instance: background_annoucer = null;
    
    // 背景预制体
    @property({ type: Prefab, tooltip: "背景预制体" })
    private background_prefab: Prefab = null;

    @property({ tooltip: "动画缩放起始值" })
    private anim_start_scale: number = 0.5;
    
    @property({ tooltip: "动画缩放结束值" })
    private anim_end_scale: number = 1.2;
    
    @property({ tooltip: "入场动画持续时间(秒)" })
    private anim_duration: number = 0.3;
    
    @property({ tooltip: "显示停留时间(秒)" })
    private display_duration: number = 2.0;
    
    @property({ tooltip: "淡出动画持续时间(秒)" })
    private fade_out_duration: number = 0.5;

    // 测试相关属性
    @property({ tooltip: "是否启用自动测试" })
    private enable_auto_test: boolean = false;
    
    @property({ tooltip: "自动测试间隔(秒)" })
    private auto_test_interval: number = 3.0;

    // 技能球追踪相关
    @property({ tooltip: "追踪的技能球名称" })
    private skill_ball_name: string = "bullet_skill_ball";
    
    @property({ tooltip: "检测技能球状态的频率(秒)" })
    private check_interval: number = 0.1;

    private current_display_node: Node = null; // 当前显示的背景节点
    private active_tweens: any[] = []; // 存储所有活跃的动画
    private is_fading_out: boolean = false; // 是否正在淡出
    private auto_test_timer: number = 0; // 自动测试计时器
    private test_counter: number = 0; // 测试计数器
    
    // 技能球追踪相关
    private tracked_skill_ball: Node = null; // 正在追踪的技能球
    private is_tracking: boolean = false; // 是否正在追踪
    private has_triggered: boolean = false; // 是否已经触发过动画
    private check_timer: number = 0; // 检测计时器

    onLoad() {
        // 单例初始化
        if (background_annoucer._instance) {
            console.warn('background_annoucer实例已存在，销毁当前节点');
            this.node.destroy();
            return;
        }
        background_annoucer._instance = this;
    }

    // 获取单例
    public static getInstance(): background_annoucer {
        return background_annoucer._instance;
    }

    // ========== 技能球追踪相关方法 ==========
    
    /**
     * 开始追踪指定名称的技能球
     * @param skillBallName 要追踪的技能球名称（可选，默认使用skill_ball_name）
     */
    public start_tracking_skill_orb(skillBallName?: string): void {
        // 如果已经触发过，不再追踪
        if (this.has_triggered) {
            console.log('background_annoucer: 技能球动画已经触发过，不再追踪');
            return;
        }
        
        // 如果已经在追踪中，先停止
        if (this.is_tracking) {
            this.stop_tracking_skill_orb();
        }
        
        // 设置追踪的技能球名称
        if (skillBallName) {
            this.skill_ball_name = skillBallName;
        }
        
        console.log(`background_annoucer: 开始追踪技能球 "${this.skill_ball_name}"`);
        
        // 查找场景中的技能球
        this.find_and_track_skill_ball();
        
        // 开始追踪
        this.is_tracking = true;
    }
    
    /**
     * 停止追踪技能球
     */
    public stop_tracking_skill_orb(): void {
        if (this.is_tracking) {
            console.log('background_annoucer: 停止追踪技能球');
            this.is_tracking = false;
            this.tracked_skill_ball = null;
            this.check_timer = 0;
        }
    }
    
    /**
     * 重置追踪状态（允许再次触发）
     */
    public reset_tracking(): void {
        console.log('background_annoucer: 重置追踪状态');
        this.has_triggered = false;
        this.is_tracking = false;
        this.tracked_skill_ball = null;
        this.check_timer = 0;
    }
    
    /**
     * 查找并追踪场景中的技能球
     */
    private find_and_track_skill_ball(): void {
        // 在当前节点所在的场景中查找技能球
        const scene = this.node.scene;
        if (!scene) {
            console.warn('background_annoucer: 无法获取场景引用');
            return;
        }
        
        // 递归查找指定名称的节点
        this.tracked_skill_ball = this.find_node_by_name(scene, this.skill_ball_name);
        
        if (this.tracked_skill_ball) {
            console.log(`background_annoucer: 找到技能球 "${this.skill_ball_name}"，开始监控状态`);
        } else {
            console.log(`background_annoucer: 未找到技能球 "${this.skill_ball_name}"，将在update中持续查找`);
        }
    }
    
    /**
     * 递归查找指定名称的节点
     * @param root 根节点
     * @param name 要查找的节点名称
     * @returns 找到的节点，未找到返回null
     */
    private find_node_by_name(root: Node, name: string): Node {
        // 检查当前节点
        if (root.name === name && root.isValid) {
            return root;
        }
        
        // 递归检查子节点
        for (const child of root.children) {
            const found = this.find_node_by_name(child, name);
            if (found) {
                return found;
            }
        }
        
        return null;
    }
    
    /**
     * 检查技能球是否被拾取（节点是否被销毁或失效）
     */
    private check_skill_ball_status(): void {
        // 如果还没有找到技能球，尝试重新查找
        if (!this.tracked_skill_ball || !this.tracked_skill_ball.isValid) {
            // 如果之前有追踪的球但现在已经无效，说明被拾取了
            if (this.tracked_skill_ball !== null && !this.tracked_skill_ball.isValid) {
                console.log('background_annoucer: 技能球已被拾取（节点失效）');
                this.on_skill_ball_picked_up();
                return;
            }
            
            // 尝试重新查找
            this.find_and_track_skill_ball();
            return;
        }
        
        // 检查节点是否处于活跃状态
        if (!this.tracked_skill_ball.active) {
            console.log('background_annoucer: 技能球已被拾取（节点未激活）');
            this.on_skill_ball_picked_up();
            return;
        }
        
        // 检查节点的父节点是否还存在（可能被移出场景）
        if (!this.tracked_skill_ball.parent || !this.tracked_skill_ball.parent.isValid) {
            console.log('background_annoucer: 技能球已被拾取（父节点失效）');
            this.on_skill_ball_picked_up();
            return;
        }
    }
    
    /**
     * 技能球被拾取时的处理
     */
    private on_skill_ball_picked_up(): void {
        // 确保只触发一次
        if (this.has_triggered) {
            console.log('background_annoucer: 动画已经触发过，跳过');
            return;
        }
        
        console.log('background_annoucer: 技能球被拾取，触发背景动画');
        this.has_triggered = true;
        this.is_tracking = false;
        
        // 触发背景显示动画
        this.show_background();
    }

    // ========== 原有的背景显示方法 ==========

    // 显示背景播报
    public show_background(): void {
        // 停止所有动画并移除旧的播报
        this.clear_current_display();
        
        // 重置淡出状态
        this.is_fading_out = false;
        
        // 生成新的背景播报
        this.display_background();
    }
    
    // 显示背景
    private display_background(): void {
        if (!this.background_prefab) {
            console.warn('background_annoucer: 未设置背景预制体');
            return;
        }

        // 实例化背景预制体
        const background_node = instantiate(this.background_prefab);
        
        // 设置位置（基于当前节点的位置）
        background_node.setPosition(
            this.node.position.x,
            this.node.position.y,
        );
        
        // 添加到父节点
        this.node.parent.addChild(background_node);
        this.current_display_node = background_node;

        // 应用入场动画
        this.apply_entrance_animation(background_node);
        
        // 设置淡出计时器
        this.schedule_fade_out();
    }
    
    // 入场动画
    private apply_entrance_animation(node: Node): void {
        // 清除旧的动画引用
        this.active_tweens = [];
        
        // 检查是否有Animation组件
        const animation = node.getComponent(Animation);
        if (animation) {
            // 如果有Animation组件，立即播放
            animation.play();
            console.log('background_annoucer: 播放Animation组件动画');
        }
        
        // 设置初始缩放
        node.setScale(new Vec3(this.anim_start_scale, this.anim_start_scale, 1));
        
        // 缩放动画
        const scaleTween = tween(node)
            .to(this.anim_duration, { 
                scale: new Vec3(this.anim_end_scale, this.anim_end_scale, 1) 
            }, {
                easing: 'backOut',
                onStart: () => {
                    console.log(`background_annoucer: 入场动画开始 (scale: ${this.anim_start_scale} -> ${this.anim_end_scale})`);
                }
            })
            .to(this.anim_duration * 0.5, { 
                scale: new Vec3(1, 1, 1) 
            }, {
                easing: 'sineOut',
                onComplete: () => {
                    console.log('background_annoucer: 入场动画完成，缩放至正常大小');
                }
            })
            .start();
        
        this.active_tweens.push(scaleTween);
    }
    
    // 设置淡出效果
    private schedule_fade_out(): void {
        // 取消之前的淡出计划
        this.unschedule(this.start_fade_out);
        
        console.log(`background_annoucer: 将在 ${this.display_duration} 秒后开始淡出`);
        
        // 在显示持续时间后开始淡出
        this.scheduleOnce(() => {
            console.log('background_annoucer: 开始淡出流程');
            this.start_fade_out();
        }, this.display_duration);
    }
    
    // 开始淡出动画
    private start_fade_out(): void {
        if (this.is_fading_out) {
            console.log('background_annoucer: 已在淡出中，跳过');
            return;
        }
        this.is_fading_out = true;
        
        if (this.current_display_node && this.current_display_node.isValid) {
            this.apply_fade_out(this.current_display_node);
        }
        
        // 淡出完成后清除节点
        this.scheduleOnce(() => {
            console.log('background_annoucer: 淡出完成，清除节点');
            this.clear_current_display();
        }, this.fade_out_duration + 0.1);
    }
    
    // 应用淡出效果
    private apply_fade_out(node: Node): void {
        // 获取或添加UIOpacity组件
        let uiOpacity = node.getComponent(UIOpacity);
        if (!uiOpacity) {
            uiOpacity = node.addComponent(UIOpacity);
        }
        uiOpacity.opacity = 255;
        
        // 缩放动画
        const fadeOutTween = tween(node)
            .to(this.fade_out_duration, {
                scale: new Vec3(0.8, 0.8, 1)
            }, {
                easing: 'sineIn',
                onStart: () => {
                    console.log('background_annoucer: 淡出动画开始');
                },
                onComplete: () => {
                    console.log('background_annoucer: 淡出缩放动画完成');
                }
            })
            .start();
        
        // 透明度变化
        const opacityTween = tween(uiOpacity)
            .to(this.fade_out_duration, {
                opacity: 0
            }, {
                easing: 'sineIn',
                onStart: () => {
                    console.log('background_annoucer: 透明度变化开始');
                },
                onComplete: () => {
                    console.log('background_annoucer: 透明度变化完成');
                }
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
        this.unschedule(this.start_fade_out);
        
        // 销毁节点
        if (this.current_display_node && this.current_display_node.isValid) {
            // 停止节点上的所有动画
            tween(this.current_display_node).stop();
            
            // 停止Animation组件
            const animation = this.current_display_node.getComponent(Animation);
            if (animation) {
                animation.stop();
            }
            
            this.current_display_node.destroy();
        }
        this.current_display_node = null;
        this.is_fading_out = false;
    }

    // 公开方法：手动隐藏背景（如果需要立即隐藏）
    public hide_background_immediately(): void {
        console.log('background_annoucer: 立即隐藏背景');
        this.clear_current_display();
    }

    // 公开方法：手动触发淡出（如果需要提前开始淡出）
    public trigger_fade_out(): void {
        if (!this.is_fading_out) {
            console.log('background_annoucer: 手动触发淡出');
            this.start_fade_out();
        }
    }

    // ========== 测试方法 ==========
    
    /**
     * 单次测试：显示一次背景动画
     */
    public test_single_show(): void {
        console.log('========== 单次测试开始 ==========');
        this.test_counter++;
        console.log(`测试次数: ${this.test_counter}`);
        this.show_background();
    }
    
    /**
     * 手动控制测试：连续显示指定次数
     * @param count 显示次数
     * @param interval 间隔时间(秒)
     */
    public test_multiple_shows(count: number = 3, interval: number = 3.5): void {
        console.log(`========== 多次测试开始 (共${count}次，间隔${interval}秒) ==========`);
        
        for (let i = 0; i < count; i++) {
            this.scheduleOnce(() => {
                console.log(`执行第 ${i + 1}/${count} 次显示`);
                this.show_background();
            }, i * interval);
        }
    }
    
    /**
     * 快速测试：快速连续显示（测试动画叠加处理）
     * @param count 显示次数
     * @param quickInterval 快速间隔时间(秒)
     */
    public test_quick_sequence(count: number = 5, quickInterval: number = 0.5): void {
        console.log(`========== 快速连续测试开始 (共${count}次，间隔${quickInterval}秒) ==========`);
        
        for (let i = 0; i < count; i++) {
            this.scheduleOnce(() => {
                console.log(`快速显示 ${i + 1}/${count}`);
                this.show_background();
            }, i * quickInterval);
        }
    }
    
    /**
     * 压力测试：长时间循环测试
     * @param duration 测试持续时间(秒)
     * @param interval 每次显示间隔(秒)
     */
    public test_stress(duration: number = 30, interval: number = 2.0): void {
        console.log(`========== 压力测试开始 (持续${duration}秒，间隔${interval}秒) ==========`);
        
        const totalShows = Math.floor(duration / interval);
        for (let i = 0; i < totalShows; i++) {
            this.scheduleOnce(() => {
                console.log(`压力测试: ${i + 1}/${totalShows}`);
                this.show_background();
                
                if (i === totalShows - 1) {
                    console.log('========== 压力测试完成 ==========');
                }
            }, i * interval);
        }
    }
    
    /**
     * 交互测试：测试手动淡出功能
     */
    public test_manual_fade_out(): void {
        console.log('========== 手动淡出测试 ==========');
        this.show_background();
        
        // 1秒后手动触发淡出（不等自动淡出）
        this.scheduleOnce(() => {
            console.log('手动触发淡出（提前结束显示）');
            this.trigger_fade_out();
        }, 1.0);
    }
    
    /**
     * 立即隐藏测试
     */
    public test_immediate_hide(): void {
        console.log('========== 立即隐藏测试 ==========');
        this.show_background();
        
        // 0.5秒后立即隐藏（不等动画完成）
        this.scheduleOnce(() => {
            console.log('立即隐藏背景');
            this.hide_background_immediately();
        }, 0.5);
    }
    
    /**
     * 测试技能球追踪功能（模拟技能球被拾取）
     */
    public test_skill_ball_tracking(): void {
        console.log('========== 技能球追踪测试 ==========');
        console.log('开始追踪技能球，等待技能球被拾取...');
        
        // 重置状态
        this.reset_tracking();
        
        // 开始追踪
        this.start_tracking_skill_orb();
        
        // 5秒后模拟技能球被拾取（如果没有真实拾取）
        this.scheduleOnce(() => {
            if (!this.has_triggered) {
                console.log('模拟技能球被拾取');
                this.on_skill_ball_picked_up();
            }
        }, 5.0);
    }

    start() {
        console.log('background_annoucer: 初始化完成');
        console.log(`配置参数: 入场动画${this.anim_duration}秒, 显示${this.display_duration}秒, 淡出${this.fade_out_duration}秒`);
        
        // ========== 在这里调用测试方法 ==========
        
        if (this.enable_auto_test) {
            // 自动测试模式
            console.log('启用自动测试模式');
            this.test_single_show(); // 立即显示一次
        }
        
        // 选择以下任一测试方法（取消注释即可使用）：
        
        // 1. 单次测试
        // this.test_single_show();
        
        // 2. 多次测试（3次，每次间隔3.5秒）
        // this.test_multiple_shows(3, 3.5);
        
        // 3. 快速连续测试（5次，每次间隔0.5秒）
        // this.test_quick_sequence(5, 0.5);
        
        // 4. 压力测试（30秒，每2秒一次）
        // this.test_stress(30, 2.0);
        
        // 5. 手动淡出测试
        // this.test_manual_fade_out();
        
        // 6. 立即隐藏测试
        // this.test_immediate_hide();
        
        // 7. 技能球追踪测试
        // this.test_skill_ball_tracking();
        
        // 8. 直接开始追踪技能球（在正式使用时调用）
        // this.start_tracking_skill_orb();
    }

    update(deltaTime: number) {
        // 技能球追踪逻辑
        if (this.is_tracking && !this.has_triggered) {
            this.check_timer += deltaTime;
            
            // 按照设定的频率检查技能球状态
            if (this.check_timer >= this.check_interval) {
                this.check_timer = 0;
                this.check_skill_ball_status();
            }
        }
        
        // 自动测试模式：定时重复显示
        if (this.enable_auto_test) {
            this.auto_test_timer += deltaTime;
            if (this.auto_test_timer >= this.auto_test_interval) {
                this.auto_test_timer = 0;
                console.log(`自动测试触发 (间隔${this.auto_test_interval}秒)`);
                this.test_single_show();
            }
        }
    }

    // 销毁时清理
    onDestroy() {
        this.clear_current_display();
        this.stop_tracking_skill_orb();
        if (background_annoucer._instance === this) {
            background_annoucer._instance = null;
        }
    }
}
// 关卡流程管理：控制暂停、开始与胜利流程
import { _decorator, Component, Node, Canvas, input, Input,
         KeyCode,
         EventKeyboard, AudioSource,
         Label
 } from 'cc';
import { Timer } from '../Timer';
import { Playercontralor } from '../player/Playercontralor';
import { director } from 'cc';
import { background_controler } from '../background/background_controler';
import { toolmaker } from '../tool_maker/toolmaker';
import { normal_one } from '../enemy/different_enemies/normal_one_fly/normal_one_fiy';
import { music_play_ctrl } from '../music_manager/music_play_ctrl';
import { scene_enemy_manager } from '../enemy/scene_enemy_manager/scene_enemy_manager';
import { ex_move_ctrl } from './ex_move_ctrl';
import { camera_contorler } from '../camera/camera_contorler';
const { ccclass, property } = _decorator;

@ccclass('ex_manager')
export class ex_manager extends Component {
    private is_playing: boolean = false; // 游戏是否正在进行
    private timer: Timer = null; // 关卡计时器
    private total_time: number = 0;    //关卡总时间
    //子组件管理
    @property(Node)
    private player: Node = null; // 玩家节点
    @property(background_controler)
    private background: background_controler = null; // 背景控制
    @property(Node)
    private collection_poster: Node = null; // 道具生成控制
    @property(scene_enemy_manager)
    private scene_enemy_manager: scene_enemy_manager = null; // 敌人生成控制
    @property(music_play_ctrl)
    private musicPlayer: music_play_ctrl = null; // 音乐控制
    @property(Label)
    private tips: Label = null; // 提示文本组件
    @property(Canvas)
    private plat_ver: Canvas = null; // 画布
    @property(ex_move_ctrl)
    private move_ctrl: ex_move_ctrl = null; // 场景移动控制
    @property(camera_contorler)
    private camera_ctrl: camera_contorler = null; // 摄像机控制


    // 初始化关卡计时
    protected onLoad(): void {
        if(!this.timer){
            this.timer = this.node.addComponent(Timer);
        }
        this.total_time = 60; //设置关卡总时间为60秒
        this.timer.set_duration(this.total_time);
        
    }

         /** 初始化输入系统 */
    // 初始化输入监听
    private initInput(): void {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    // 按键开始游戏
    protected onKeyDown(event: EventKeyboard): void {
        
        if (event.keyCode) {
            if(this.is_playing) return; // 如果游戏已经在进行中，按键不再响应
            // this.timer.start();
            // this.timer.set_using();
            // this.set_up();
            this.tips.string = ""; // 清空提示文本
            // this.musicPlayer.play_music(); // 开始播放音乐
            this.is_playing = true; // 设置游戏状态为正在进行
            this.set_up();
        }
    }
    

    // 组件启动：等待开始
    start() {
        this.initInput();
        this.all_pause(); // 游戏开始时先暂停，等待玩家按下空格键开始游戏
    }

    // 帧更新：检测关卡结束
    update(deltaTime: number) {
        if(this.timer.check_if_end()){
            this.timer.stop();
            // 在这里可以添加游戏结束的逻辑，例如显示游戏结束界面、重置游戏等
            this.player.getComponent(Playercontralor).ifInvincible = true; // 让玩家无敌，防止继续受到伤害
            this.player.getComponent(Playercontralor).end_out_completed(); // 调用玩家控制器的结束逻辑
            this.camera_ctrl.pause_follow(); // 暂停摄像机跟随
            this.scheduleOnce(() => {
            this.onLoad_victor_scene(); // 切换到胜利场景
        }, 0.6);
            
        }
    }

    // 切换到胜利场景
    onLoad_victor_scene() {
        director.loadScene('victor_scence');
    }

    // 暂停所有子系统
    protected all_pause(){
        this.player.getComponent(Playercontralor).Pause();
        this.background.Pause();
        this.collection_poster.active = false; // 禁用道具生成
        this.musicPlayer.pause_music();
        this.scene_enemy_manager.Pause();
        this.timer.stop();
        this.move_ctrl.stop();
    }

    // 启动关卡并恢复子系统
    protected set_up()
    {
        this.player.getComponent(Playercontralor).Resume();
        this.background.Resume();
        this.collection_poster.active = true; // 启用道具生成
        this.musicPlayer.resume_music(); // 恢复音乐
        this.scene_enemy_manager.Resume();
        this.timer.reStart(); // 重新开始计时器
        this.move_ctrl.resume();
        
    }

}

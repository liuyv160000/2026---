// 摄像机控制：重力反转跟随与受伤抖动
import { _decorator, Component, Node,Vec3,Vec2,Camera } from 'cc';
import { Playercontralor } from '../player/Playercontralor';
const { ccclass, property } = _decorator;

@ccclass('camera_contorler')
export class camera_contorler extends Component {
    @property({type:Playercontralor})
    public player:Playercontralor = null; // 玩家引用
    private camera:Camera = null; // 摄像机组件
    private now_speed:number = 0; // 当前跟随速度
    private camera_speed:number = 1000; // 触发跟随时的速度
    private followX_speed:number = 12; // 预留的X轴跟随速度
    private follow_offsetX:number = 120; // 预留的X轴偏移
    private sta_positionY_up:number = 0; // 起始Y位置
    private sta_positionY_down:number = 0; // 起始Y下偏移
    private last_player_gravity_reverse:number = 1; // 上一次重力方向
    private now_player_gravity_reverse:number = 1; // 当前重力方向
    private last_face_dir:number = 1; // 上一次朝向
    private base_position: Vec3 = new Vec3(); // 摄像机基准位置
    private shake_time_left = 0; // 抖动剩余时间
    private shake_strength = 0; // 抖动强度
    private shake_frequency = 30; // 抖动频率
    private shake_timer = 0; // 抖动计时器
    private shake_offset: Vec3 = new Vec3(); // 抖动偏移
    

    // 初始化摄像机与事件监听
    protected onLoad(): void {
        this.player = this.node.parent.getComponentInChildren(Playercontralor);
        this.camera = this.node.getComponent(Camera);
        this.last_player_gravity_reverse = this.player.ifGravityReverse;
        this.last_face_dir = this.player.faceDir;
        this.sta_positionY_up = this.node.position.y;
        this.sta_positionY_down = this.sta_positionY_up - 1;
        this.base_position = this.node.position.clone();
        this.node.scene?.on('player_hurt', this.on_player_hurt, this);

    }

    // 清理事件监听
    protected onDestroy(): void {
        this.node.scene?.off('player_hurt', this.on_player_hurt, this);
    }

    // 组件启动
    start() {
       
    }

    // 帧更新：检查状态并应用抖动
    update(deltaTime: number) {
        if(this.is_paused) return; // 如果已暂停，跳过更新
        this.check();
        this.move_by_speed(deltaTime);
        this.apply_shake(deltaTime);
    }

    // 检查重力反转并触发跟随
    protected check(){
        if(this.player.ifGravityReverse != this.last_player_gravity_reverse){
            this.camera_follow(this.player.ifGravityReverse);
            this.last_player_gravity_reverse = this.player.ifGravityReverse;
        }
    }

    // 按重力方向进行短促跟随
    camera_follow(playe_state : number){
        this.now_speed = this.camera_speed*playe_state;
        this.scheduleOnce(()=>{
            this.now_speed = 0 ;
        }, 0.1);
    }

    // 按玩家Y轴位置跟随
    move_by_speed(deltaTime:number){
        if (!this.player) return;
        this.base_position.y = this.player.node.position.y;
    }


    // 触发摄像机抖动
    public trigger_shake(strength: number = 10, duration: number = 0.2, frequency: number = 30) {
        this.shake_strength = Math.max(0, strength);
        this.shake_time_left = Math.max(0, duration);
        this.shake_frequency = Math.max(1, frequency);
        this.shake_timer = 0;
    }

    // 玩家受伤事件回调
    private on_player_hurt() {
        this.trigger_shake(12, 0.25, 35);
    }

    // 应用抖动并更新摄像机位置
    private apply_shake(deltaTime: number) {
        if (this.shake_time_left > 0) {
            this.shake_time_left -= deltaTime;
            this.shake_timer += deltaTime;

            if (this.shake_timer >= 1 / this.shake_frequency) {
                this.shake_timer = 0;
                this.shake_offset.x = (Math.random() * 2 - 1) * this.shake_strength;
                this.shake_offset.y = (Math.random() * 2 - 1) * this.shake_strength;
            }
        } else {
            this.shake_offset.set(0, 0, 0);
        }

        this.node.setPosition(
            this.base_position.x + this.shake_offset.x,
            this.base_position.y + this.shake_offset.y,
            this.base_position.z
        );
    }

    private is_paused: boolean = false; // 是否已暂停

    // 暂停摄像机跟随
    public pause_follow() {
        this.is_paused = true;
    }

    // 恢复摄像机跟随
    public resume_follow() {
        this.is_paused = false;
    }

}



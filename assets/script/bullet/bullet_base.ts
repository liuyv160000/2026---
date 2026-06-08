// 子弹基础类：提供移动、生命周期与碰撞基础逻辑
import { _decorator, Component, Node ,Vec2,Vec3, Collider2D, RigidBody2D, CircleCollider2D,  
    IPhysics2DContact,Contact2DType, PhysicsSystem2D} from 'cc';
import { Playercontralor } from '../player/Playercontralor';
import { Timer } from '../Timer';
const { ccclass, property } = _decorator;

@ccclass('bullet_base')
export class bullet_base extends Component {
    @property
    protected speed: number = 0; // 子弹速度
    protected damage: number = 0; // 子弹伤害
    protected move_dir: Vec2 = new Vec2(0,0); // 移动方向
    protected move_rotation: number = 0; // 旋转方向/角度
    protected move_distance: number = 0; // 最大移动距离
    protected timer_for_life: Timer = null; // 生命周期计时器
    
    @property((Node))
    protected target: Node = null; // 目标节点

    //碰撞检测
    protected Physics2DContact: IPhysics2DContact | null = null; // 当前碰撞信息
    protected rigidBody: RigidBody2D = null!; // 刚体组件
    protected collider: Collider2D = null; // 碰撞体组件

    // 碰撞开始回调
    protected onBeginContact(self: Collider2D, other: Collider2D, contact: IPhysics2DContact | null) {
        this.Physics2DContact = contact;

    } 

    // 初始化物理组件
    protected initPhysics(): void {
                // 自动获取组件（如果编辑器没绑定）
                if (!this.rigidBody) {
                    this.rigidBody = this.node.getComponent(RigidBody2D);
                }
                if (!this.collider) {
                    this.collider = this.node.getComponent(CircleCollider2D);
                }
        }

    // 碰撞结束回调
    protected onEndContact(self: Collider2D, other: Collider2D, contact: IPhysics2DContact | null) {
        if (other.node.name === 'player') {
            
        }

        if (this.Physics2DContact === contact) {
            this.Physics2DContact = null;
        }
    }

    // 初始化子弹参数与碰撞监听
    protected onLoad(): void {
        this.timer_for_life = this.addComponent(Timer);
        this.move_distance = 1400;
        this.initPhysics();

        if (this.collider) {
              this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
              this.collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
            }
                
        PhysicsSystem2D.instance.enable = true;

    }

    // 组件启动
    start() {
    }

    // 帧更新：移动与生命周期检查
    update(deltaTime: number) {
        this.move(deltaTime);
        if(this.timer_for_life.check_if_end())
        {
            this.onDestroy();
        }
    }

    // 销毁子弹节点
    protected onDestroy(): void {
        this.node.destroy();
  
    }

    // 按方向移动子弹
    protected move(deltaTime: number): void {
        let move_vec = new Vec3( this.speed * deltaTime*this.move_dir.x, this.speed * deltaTime*this.move_dir.y,0);
        this.node.setPosition(this.node.getPosition().add(move_vec));
    }

}



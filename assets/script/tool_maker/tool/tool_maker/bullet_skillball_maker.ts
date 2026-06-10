// skill_orb_maker.ts - 技能球生成器
import { _decorator, Component, Node, Vec3, Prefab, instantiate,
    RigidBody2D, Collider2D } from 'cc';
import { Timer } from '../../../Timer';
import { background_annoucer } from '../../../annoucement_system/background_annoucer';
import { bullet_skill_orb } from '../skill_orb/bullet_skill_orb';
const { ccclass, property } = _decorator;

@ccclass('skill_orb_maker')
export class skill_orb_maker extends Component {

    @property({ type: Prefab, tooltip: "技能球预制体" })
    skill_orb_prefab: Prefab = null!;

    @property({ type: [Number], tooltip: "技能球生成时间点(秒)，如[5,10,15]" })
    skill_orb_spawn_times: number[] = [5];

    @property({ type: [Number], tooltip: "对应时间点的Y轴偏移，与时间点一一对应" })
    skill_orb_y_offsets: number[] = [100];

    @property({ tooltip: "技能球对象池大小" })
    skill_orb_pool_size: number = 3;

    @property({ tooltip: "设置技能球生成后的飞行速度" })
    skill_orb_flight_speed: number = 500;

    private skill_orb_pool: Node[] = [];
    private spawn_position: Vec3 = new Vec3();
    
    private skill_orb_timer: number = 0;
    private skill_orb_index: number = 0;
    private skill_orb_spawned: boolean = false;
    
    private _is_paused: boolean = false;

    @property(background_annoucer)
    private announcer: background_annoucer = null!;

    protected onLoad(): void {
        this.spawn_position = this.node.getPosition();
        
        // 验证数组长度是否匹配
        if (this.skill_orb_spawn_times.length !== this.skill_orb_y_offsets.length) {
            console.warn('[skill_orb_maker] 时间点与偏移量数组长度不匹配，请检查配置');
        }
        
        // 排序技能球生成时间（保持偏移量同步）
        this.sortSpawnConfig();
        
        // 初始化对象池
        this.initPool();
    }

    update(deltaTime: number) {
        if (this._is_paused) return;

        // 技能球按时间点生成
        if (!this.skill_orb_spawned && this.skill_orb_index < this.skill_orb_spawn_times.length) {
            this.skill_orb_timer += deltaTime;
            
            if (this.skill_orb_timer >= this.skill_orb_spawn_times[this.skill_orb_index]) {
                this.spawn_skill_orb();
                this.skill_orb_index++;
                if(this.announcer) {
                    this.announcer.start_tracking_skill_orb(); // 开始追踪技能球状态
                }
                
                // 是否所有技能球都已生成
                if (this.skill_orb_index >= this.skill_orb_spawn_times.length) {
                    this.skill_orb_spawned = true;
                }
            }
        }
    }

    /** 按时间排序，同时保持偏移量对应关系 */
    private sortSpawnConfig(): void {
        // 创建索引数组进行排序
        const indices = this.skill_orb_spawn_times.map((_, i) => i);
        indices.sort((a, b) => this.skill_orb_spawn_times[a] - this.skill_orb_spawn_times[b]);
        
        // 按排序后的索引重新排列
        const sortedTimes = indices.map(i => this.skill_orb_spawn_times[i]);
        const sortedOffsets = indices.map(i => this.skill_orb_y_offsets[i]);
        
        this.skill_orb_spawn_times = sortedTimes;
        this.skill_orb_y_offsets = sortedOffsets;
    }

    /** 初始化对象池 */
    private initPool(): void {
        if (!this.skill_orb_prefab) {
            console.warn('[skill_orb_maker] 技能球预制体未设置');
            return;
        }

        for (let i = 0; i < this.skill_orb_pool_size; i++) {
            const item = instantiate(this.skill_orb_prefab);
            this.disablePhysics(item);
            item.active = false;
            this.node.parent.addChild(item);
            this.skill_orb_pool.push(item);
        }
    }

    /** 禁用节点及其子节点的物理组件 */
    private disablePhysics(node: Node): void {
        const rigidBodies = node.getComponentsInChildren(RigidBody2D);
        rigidBodies.forEach(rb => rb.enabled = false);
        
        const colliders = node.getComponentsInChildren(Collider2D);
        colliders.forEach(col => col.enabled = false);
    }

    /** 从对象池获取技能球 */
    private getFromPool(): Node | null {
        for (const item of this.skill_orb_pool) {
            if (item && item.isValid && !item.active) {
                return item;
            }
        }
        
        // 池耗尽，动态扩展
        const newItem = instantiate(this.skill_orb_prefab);
        this.disablePhysics(newItem);
        newItem.active = false;
        this.node.parent.addChild(newItem);
        this.skill_orb_pool.push(newItem);
        
        return newItem;
    }

    /** 生成技能球 */
    public spawn_skill_orb(): Node | null {
        if (!this.skill_orb_prefab) return null;

        const skillOrb = this.getFromPool();
        if (!skillOrb) return null;

        // 使用当前索引对应的偏移量（如果索引超出范围则使用最后一个偏移量或默认值）
        const currentYOffset = this.skill_orb_y_offsets[this.skill_orb_index] ?? 100;
        
        const orbPosition = new Vec3(
            this.spawn_position.x,
            this.spawn_position.y + currentYOffset,
            this.spawn_position.z
        );
        
        skillOrb.setPosition(orbPosition);
        skillOrb.active = true;

        this.activatePhysicsDelayed(skillOrb);
        return skillOrb;
    }

    /** 在指定位置生成技能球 */
    public spawnSkillOrbAt(position: Vec3): Node | null {
        if (!this.skill_orb_prefab) return null;

        const skillOrb = this.getFromPool();
        if (!skillOrb) return null;

        skillOrb.setPosition(position);
        skillOrb.active = true;
        skillOrb.getComponent(bullet_skill_orb)?.changeXSpeed(this.skill_orb_flight_speed);
        this.activatePhysicsDelayed(skillOrb);
        return skillOrb;
    }

    /** 延迟激活物理组件(避免物理步进中创建刚体) */
    private activatePhysicsDelayed(node: Node): void {
        this.scheduleOnce(() => {
            if (node && node.isValid) {
                const rigidBodies = node.getComponentsInChildren(RigidBody2D);
                rigidBodies.forEach(rb => { if (rb.isValid) rb.enabled = true; });
                
                const colliders = node.getComponentsInChildren(Collider2D);
                colliders.forEach(col => { if (col.isValid) col.enabled = true; });
            }
        }, 0.05);
    }

    /** 回收技能球 */
    public recycleSkillOrb(item: Node): void {
        if (!item || !item.isValid) return;
        
        this.disablePhysics(item);
        item.active = false;
    }

    /** 重置技能球生成状态(用于重新开始) */
    public resetSkillOrbSpawn(): void {
        this.skill_orb_timer = 0;
        this.skill_orb_index = 0;
        this.skill_orb_spawned = false;
    }

    /** 更新生成位置 */
    public setSpawnPosition(pos: Vec3): void {
        this.spawn_position.set(pos);
    }

    // 暂停/恢复
    public get is_paused(): boolean { return this._is_paused; }

    public Pause(): void {
        if (this._is_paused) return;
        this._is_paused = true;
    }

    public Resume(): void {
        if (!this._is_paused) return;
        this._is_paused = false;
    }

    onDestroy(): void {
        // 清理技能球对象池
        for (const orb of this.skill_orb_pool) {
            if (orb && orb.isValid) orb.destroy();
        }
        this.skill_orb_pool.length = 0;
    }
}
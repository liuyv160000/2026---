// 自动射击技能：定时生成玩家子弹
import { _decorator, Prefab, instantiate, resources, Vec3 } from 'cc';
import { BaseSkill } from '../BaseSkill';
import { Playercontralor } from '../../Playercontralor';
import { SkillSystem } from '../SkillSystem';
import { Timer } from '../../../Timer';

const { ccclass, property } = _decorator;

@ccclass('BulletAutoSkill')
export class BulletAutoSkill extends BaseSkill {
    @property(Prefab)
    private bulletPrefab: Prefab = null; // 子弹预制体

    @property
    private fireInterval: number = 0.5; // 发射间隔

    private skillSystem: SkillSystem | null = null; // 技能系统引用
    private player: Playercontralor | null = null; // 玩家引用
    private fireTimer: number = 0; // 计时器
    private readonly bulletPrefabPath = 'prefabs/player_bullet'; // 资源路径
    protected skill_timer: Timer = null; // 技能计时器
    protected skill_duration: number = 20; // 技能持续时间


    // 加载子弹预制体并初始化
    protected onLoad(): void {
        this.player = this.node.getComponent(Playercontralor);
        this.skillSystem = this.node.getComponent(SkillSystem);
        if (!this.skillId) {
            this.skillId = 'bullet_multi';
        }
        resources.load(this.bulletPrefabPath, Prefab, (err, asset) => {
            if (err) {
                console.error('Failed to load bullet prefab from resources:', err);
                return;
            }
            this.bulletPrefab = asset as Prefab;
        });
        this.skill_timer = this.addComponent(Timer);
        this.skill_timer.set_duration(this.skill_duration);
    }

    // 启用技能时重置计时
    protected onActivate(): void {
        this.fireTimer = 0;
        this.skill_timer.reset();
    }

    // 每帧更新技能逻辑
    public updateSkill(deltaTime: number): void {
        if(this.skill_timer.check_if_end()){
            this.skillSystem?.disableSkill(this.skillId);
            return;
        }

        if (!this.player || !this.bulletPrefab) return;
        this.fireTimer += deltaTime;
        if (this.fireTimer < this.fireInterval) return;
        this.fireTimer = 0;
        this.fireBullet();
    }

    // 生成并投放子弹
    private fireBullet(): void {
        const bullet1 = instantiate(this.bulletPrefab);
        const bullet2 = instantiate(this.bulletPrefab);
        const bullet3 = instantiate(this.bulletPrefab);

        const offsetX = this.player.faceDir * this.player.get_size_x();
        const offsetY = this.player.get_size_y() / 2;
        const spawnPos = new Vec3(this.node.position.x + offsetX, this.node.position.y + offsetY, 0);
        bullet1.setPosition(spawnPos);
        this.node.parent?.addChild(bullet1);

        this.scheduleOnce(() => {
            const offsetX = this.player.faceDir * this.player.get_size_x();
            const offsetY = this.player.get_size_y() / 2;
            const spawnPos = new Vec3(this.node.position.x + offsetX, this.node.position.y + offsetY, 0);
            bullet2.setPosition(spawnPos);
            this.node.parent?.addChild(bullet2);
        }, 0.1); // 稍微延迟一下，确保子弹生成后再设置位置（如果需要的话）

        this.scheduleOnce(() => {
            const offsetX = this.player.faceDir * this.player.get_size_x();
            const offsetY = this.player.get_size_y() / 2;
            const spawnPos = new Vec3(this.node.position.x + offsetX, this.node.position.y + offsetY, 0);
            bullet3.setPosition(spawnPos);
            this.node.parent?.addChild(bullet3);
        }, 0.2); // 稍微延迟一下，确保子弹生成后再设置位置（如果需要的话）
            
    }
}

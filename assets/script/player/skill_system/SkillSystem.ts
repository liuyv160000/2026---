// 技能系统：管理技能的注册与更新
import { _decorator, Component } from 'cc';
import { BaseSkill } from './BaseSkill';

const { ccclass } = _decorator;

@ccclass('SkillSystem')
export class SkillSystem extends Component {
    private skills: Map<string, BaseSkill> = new Map(); // 技能映射表

    // 组件加载：刷新技能列表
    protected onLoad(): void {
        this.refreshSkills();
    }

    // 组件启动：再次刷新技能列表
    protected start(): void {
        this.refreshSkills();
    }

    // 重新扫描并注册技能组件
    private refreshSkills(): void {
        this.skills.clear();
        const allSkills = this.getComponents(BaseSkill);
        for (const skill of allSkills) {
            if (!skill.skillId) continue;
            this.skills.set(skill.skillId, skill);
        }
    }

    // 手动注册技能
    public registerSkill(skill: BaseSkill): void {
        if (!skill || !skill.skillId) return;
        this.skills.set(skill.skillId, skill);
    }

    // 启用指定技能
    public enableSkill(skillId: string): void {
        let skill = this.skills.get(skillId);
        if (!skill) {
            this.refreshSkills();
            skill = this.skills.get(skillId);
        }
        if (!skill) return;
        skill.setActive(true);
    }

    // 禁用指定技能
    public disableSkill(skillId: string): void {
        const skill = this.skills.get(skillId);
        if (!skill) return;
        skill.setActive(false);
    }

    // 更新所有启用中的技能
    public updateSkills(deltaTime: number): void {
        for (const skill of this.skills.values()) {
            if (!skill.isActive()) continue;
            skill.updateSkill(deltaTime);
        }
    }

    // 重置指定技能
    public resetSkill(skillId: string): void {
        const skill = this.skills.get(skillId);
        if (!skill) return;
        skill.reset_skill();
    }

}

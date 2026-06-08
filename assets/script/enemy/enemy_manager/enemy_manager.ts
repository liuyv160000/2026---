// 敌人生成管理：按计时器生成敌人
import { _decorator, Component, Node,Vec2 ,Vec3, Prefab,instantiate,UITransform } from 'cc';
import { Timer } from '../../Timer';
import { enemy_controler_base } from '../enemy_controler_base';
import { normal_attack_bullet } from '../../bullet/enemy_bullet/normal_attack_bullet';
const { ccclass, property } = _decorator;

@ccclass('enemy_manager')
export class enemy_manager extends Component {
    private timer_for_create_enemy: Timer = null!; // 生成计时器
    private create_enemy_time: number[] = null!; // 生成时间点列表

    // 初始化计时器与生成配置
    protected onLoad(): void {
        this.timer_for_create_enemy = this.addComponent(Timer)!;
        this.prefeb_enemy.initDefault();
        this.timer_for_create_enemy.set_duration(1);
        this.timer_for_create_enemy.start();
        this.timer_for_create_enemy.set_using();
        this.create_enemy_time = [1, 2, 3, 4, 5];
    }

    @property({type: Prefab})
        public prefeb_enemy:Prefab = null; // 敌人预制体

        // 组件启动
        start() {
       
    }

        // 创建一个敌人实例
        create_enemy(){ 
      if(this.prefeb_enemy)
      {
          let new_enemy = instantiate(this.prefeb_enemy);
          new_enemy.setPosition(new Vec3(this.node.getPosition().x,this.node.getPosition().y,0));
          this.node.parent.addChild(new_enemy);
      }
    }


        // 帧更新：到时生成敌人
        update(deltaTime: number) {
       if(this.timer_for_create_enemy.check_if_end()){
        this.create_enemy();
       }
    }
}



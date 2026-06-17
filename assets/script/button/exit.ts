// ExitGameWithDialog.ts
import { _decorator, Component, Node, sys, director, Button } from 'cc';

// 类型声明
declare const jsb: any;
declare const wx: any;
declare const tt: any;

const { ccclass, property } = _decorator;

@ccclass('exit')
export class exit extends Component {

     @property(Button)
        private button: Button = null; // 按钮组件

    @property(Node)
    confirmDialog: Node = null;

    onLoad() {
        if (this.button) {
            this.button.node.on('click', this.exitGame, this);
        }
    }

    /**
     * 点击退出按钮
     */
    onExitButtonClick() {
        if (this.confirmDialog) {
            this.confirmDialog.active = true;
        } else {
            this.exitGame();
        }
    }

    /**
     * 确认退出
     */
    onConfirmExit() {
        this.exitGame();
    }

    /**
     * 取消退出
     */
    onCancelExit() {
        if (this.confirmDialog) {
            this.confirmDialog.active = false;
        }
    }

    /**
     * 实际退出逻辑
     */
    private exitGame() {
        console.log('执行退出...');

        if (sys.isBrowser) {
            // 浏览器平台
            window.close();
            
            // 如果关闭失败，显示提示
            setTimeout(() => {
                alert('请手动关闭浏览器标签页');
            }, 100);
            
        } else if (sys.isNative) {
            // 原生平台
            if (typeof jsb !== 'undefined') {
                if (sys.os === sys.OS.ANDROID) {
                    // Android 退出
                    jsb.reflection.callStaticMethod(
                        'org/cocos2dx/lib/Cocos2dxActivity', 
                        'finish', 
                        '()V'
                    );
                } else if (sys.os === sys.OS.IOS) {
                    // iOS 不推荐强制退出
                    console.log('iOS平台不支持主动退出');
                }
            } else {
                // 无jsb时直接结束
                director.end();
            }
            
        } else if (sys.platform === sys.Platform.WECHAT_GAME) {
            // 微信小游戏
            if (typeof wx !== 'undefined') {
                wx.exitMiniProgram({
                    success: (res: any) => {
                        console.log('退出成功', res);
                    }
                });
            }
        }
    }
}
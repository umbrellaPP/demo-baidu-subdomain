
cc.Class({
    extends: cc.Component,

    properties: {
        display: cc.Node,
        label: cc.Label,
        userBlock: cc.Node
    },

    start () {
        this.forceLogin(this.init.bind(this));
    },

    init () {
        this._isShow = true;
        this._show = cc.moveTo(0.5, 0, 110);
        this._hide = cc.moveTo(0.5, 0, 1000);
        // the UserInfoButton is set position by screen size.
        let systemInfo =  swan.getSystemInfoSync();
        let width = systemInfo.windowWidth;
        let height = systemInfo.windowHeight;
        
        let button = swan.createUserInfoButton({
            type: 'text',
            text: '获取用户信息',
            style: {
                left: 0,
                top: -height,  // hide label on button, because label can't be hidden on mobile
                width: width,
                height: height * 2,
                lineHeight: 40,
                backgroundColor: 'rgba(0,0,0,0)',
                color: 'rgba(0,0,0,0)',
                textAlign: 'center',
                fontSize: 10,
                borderRadius: 3
            }
        });

        let userInfo = null;
        let _self = this;
        button.onTap((res) => {
            if (userInfo) return;
            
            if (res.errmsg) {
                _this.setTips(res.errmsg);
            }
            else if (res.userInfo) {
                userInfo = res.userInfo;
                let nickName = userInfo.nickName || userInfo.nickname;
                let avatarUrl = userInfo.avatarUrl;
                _self.setUserConfig(nickName, avatarUrl);
                swan.getOpenDataContext().postMessage({
                message: "User info get success."
                });
            }

            button.hide();
        });
    },

    forceLogin (cb) {
        try {
            let isLogin = swan.isLoginSync().isLogin;
            if (!isLogin) {
                swan.login({
                    success (res) {
                        cc.log('success login', res);
                        cb && cb();
                    },
                    fail (res) {
                        swan.showModal({
                            title: "登录失败",
                            content: "是否重新登录？",
                            cancelText: "退出游戏",
                            success: function (res) {
                                if (res.confirm) {
                                    cc.log("confirm");
                                    baiduLogin();
                                }
                                else if (res.cancel) {
                                    cc.log("cancel");
                                    swan.exit();
                                }
                            }
                        });
                    },
                })
            } else {
                cc.log('Already login');
                cb && cb();
            }
        } catch (err) {
            cc.error('Login failed', err);
        }
    },

    onClick () {
        this._isShow = !this._isShow;
        let comp = this.display.getComponent(cc.SwanSubContextView);
        if (this._isShow) {
            this.display.runAction(this._show);
            comp.enabled = true;
        }
        else {
            this.display.runAction(this._hide);
            comp.enabled = false;
        }
    },

    setUserConfig (nickName, avatarUrl) {
        let userAvatarSprite = this.userBlock.getChildByName('userPortrait').getComponentInChildren(cc.Sprite);
        let nickNameLabel = this.userBlock.getChildByName('userName').getComponent(cc.Label);

        nickNameLabel.string = nickName;
        cc.loader.load({
            url: avatarUrl,
            type: 'png'
        }, (err, texture) => {
            if (err) cc.error(err);
            userAvatarSprite.spriteFrame = new cc.SpriteFrame(texture);
        });
    },

    setTips (str) {
        this.label.string = str;
    }
});

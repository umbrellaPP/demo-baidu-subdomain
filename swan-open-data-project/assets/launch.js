cc.Class({
    extends: cc.Component,

    properties: {
        content: cc.Node,
        prefab: cc.Prefab
    },

    start () {
        let _self = this;

        swan.onMessage( data => {
            console.log(data.message);
        });

        // get user info in main context
        // swan.getUserInfo({
        //     swanIdList: ['selfSwanId'],
        //     success: (res) => {
        //         console.log('success', res.data);
        //         let userInfo = res.data[0];
        //         _self.createUserBlock(userInfo);
        //     },
        //     fail: (res) => {
        //         console.error(res);
        //     }
        // });

        swan.getFriendCloudStorage({
            keyList: ['selfSwanId'],
            success: (res) => {
                console.log('success', res.data);
                for (let i = 0; i < 6; ++i) {
                    let userInfo = res.data[i];
                    if (!userInfo) {
                        _self.createPrefab();
                        continue;
                    }
                    _self.createUserBlock(userInfo);
                }
            },
            fail: (res) => {
                console.error(res);
            }
        });
    },

    createUserBlock (user) {
        let node = this.createPrefab();
        // getUserInfo will return the nickName, getFriendCloudStorage will return the nickname.
        let nickName = user.nickName ? user.nickName : user.nickname;
        let avatarUrl = user.avatarUrl;

        let userName = node.getChildByName('userName').getComponent(cc.Label);
        let userIcon = node.getChildByName('mask').children[0].getComponent(cc.Sprite);

        userName.string = nickName;
        console.log(nickName + '\'s info has been getten.');
        cc.loader.load({
            url: avatarUrl, type: 'png'
        }, (err, texture) => {
            if (err) console.error(err);
            userIcon.spriteFrame = new cc.SpriteFrame(texture);
        });                   
    },

    createPrefab () {
        let node = cc.instantiate(this.prefab);
        node.parent = this.content;
        return node;
    }

});

// ==UserScript==
// @name        bilibili直播净化
// @namespace   https://github.com/lzghzr/GreasemonkeyJS
// @version     3.0.1
// @author      lzghzr
// @description 屏蔽聊天室礼物以及关键字, 净化聊天室环境
// @supportURL  https://github.com/lzghzr/GreasemonkeyJS/issues
// @include     /^https?:\/\/live\.bilibili\.com\/(neptune\/)?\d.*$/
// @license     MIT
// @grant       GM_getValue
// @grant       GM_setValue
// @run-at      document-end
// ==/UserScript==
/// <reference path="BiLiveNoVIP.d.ts" />
/**
 * 屏蔽B站直播间聊天室内容
 * 
 * @class BiLiveNoVIP
 */
class BiLiveNoVIP {
  constructor() {
    // 加载设置
    let config = <config>JSON.parse(GM_getValue('blnvConfig') || '{}')
    let defaultConfig = this._defaultConfig
    if (config.version === undefined || config.version < defaultConfig.version) {
      for (let x in defaultConfig.menu) {
        try {
          defaultConfig.menu[x].enable = config.menu[x].enable
        }
        catch (error) {
          console.error(error)
        }
      }
      this._config = defaultConfig
    }
    else {
      this._config = config
    }
  }
  private _counter = 0
  private _config: config
  private _defaultConfig: config = {
    version: 1509943778469,
    menu: {
      noKanBanMusume: {
        name: '看&nbsp;&nbsp;板&nbsp;&nbsp;娘',
        enable: false
      },
      noGuardIcon: {
        name: '舰队标识',
        enable: false
      },
      noHDIcon: {
        name: '活动标识',
        enable: false
      },
      noVIPIcon: {
        name: '老爷标识',
        enable: false
      },
      noMedalIcon: {
        name: '粉丝勋章',
        enable: false
      },
      noUserLevelIcon: {
        name: '用户等级',
        enable: false
      },
      noLiveTitleIcon: {
        name: '成就头衔',
        enable: false
      },
      noSystemMsg: {
        name: '系统公告',
        enable: false
      },
      noGiftMsg: {
        name: '礼物信息',
        enable: false
      }
    }
  }
  /**
   * 开始
   * 
   * @memberof BiLiveNoVIP
   */
  public Start() {
    // 添加相关css
    this._AddCSS()
    this._ChangeCSS()
    let elmDivAside = <HTMLDivElement>document.querySelector('.right-part.chat-ctnr, .aside-area')
    if (elmDivAside != null) {
      let asideObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (mutation.type === 'childList' && mutation.addedNodes != null) {
            for (let i = 0; i < mutation.addedNodes.length; i++) {
              let elm = <HTMLElement>mutation.addedNodes[i]
              if (elm.nodeName === 'LI' && elm.innerText === '七日榜') {
                this._counter += 1
                elm.click()
              }
              if (elm.nodeName === 'DIV' && elm.id === 'chat-control-panel-vm') {
                this._counter += 1
                this._AddUI()
              }
            }
          }
        })
        if (this._counter >= 2) asideObserver.disconnect()
      })
      asideObserver.observe(elmDivAside, { childList: true, subtree: true })
    }
    // 网页全屏
    let bodyObserver = new MutationObserver(() => {
      let elmDivRand = <HTMLDivElement>document.querySelector('#rank-list-vm')
        , elmDivChat = <HTMLDivElement>document.querySelector('.chat-history-panel')
      if (document.body.classList.contains('player-full-win')) {
        elmDivRand.style.cssText = 'display: none'
        elmDivChat.style.cssText = 'height: calc(100% - 135px)'
      }
      else {
        elmDivRand.style.cssText = ''
        elmDivChat.style.cssText = ''
      }
    })
    bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] })
  }
  /**
   * 模拟实时屏蔽
   * 
   * @private
   * @memberof BiLiveNoVIP
   */
  private _ChangeCSS() {
    // 获取或者插入style
    let elmStyle = <HTMLStyleElement>document.querySelector('#gunCSS')
    if (elmStyle === null) {
      elmStyle = document.createElement('style')
      elmStyle.id = 'gunCSS'
      document.body.appendChild(elmStyle)
    }
    //css内容
    let cssText = ''
    if (this._config.menu.noKanBanMusume.enable) cssText += `
.haruna-sekai-de-ichiban-kawaii {
  display: none !important;
}`
    if (this._config.menu.noGuardIcon.enable) cssText += `
.chat-history-list .guard-buy,
.chat-history-list .guard-icon,
.chat-history-list .welcome-guard,
.chat-history-list .danmaku-item.guard-level-1:after,
.chat-history-list .danmaku-item.guard-level-2:after,
.chat-history-list .danmaku-item.guard-level-1:before,
.chat-history-list .danmaku-item.guard-level-2:before {
  display: none !important;
}
.chat-history-list .danmaku-item.guard-danmaku .vip-icon {
  margin-right: 5px !important;
}
.chat-history-list .danmaku-item.guard-danmaku .admin-icon,
.chat-history-list .danmaku-item.guard-danmaku .title-label,
.chat-history-list .danmaku-item.guard-danmaku .anchor-icon,
.chat-history-list .danmaku-item.guard-danmaku .user-level-icon,
.chat-history-list .danmaku-item.guard-danmaku .fans-medal-item-ctnr {
  margin-right: 5px !important;
}
.chat-history-list .danmaku-item.guard-level-1,
.chat-history-list .danmaku-item.guard-level-2 {
  padding: 4px 5px !important;
  margin: 0 !important;
}
.chat-history-list .danmaku-item.guard-danmaku .user-name {
  color: #23ade5 !important;
}
.chat-history-list .danmaku-item.guard-danmaku .danmaku-content {
  color: #646c7a !important;
}`
    if (this._config.menu.noHDIcon.enable) cssText += `
.chat-history-list a[href^="/hd/"],
#santa-hint-ctnr {
  display: none !important;
}`
    if (this._config.menu.noVIPIcon.enable) cssText += `
.chat-history-list .vip-icon,
.chat-history-list .welcome-msg {
  display: none !important;
}`
    if (this._config.menu.noMedalIcon.enable) cssText += `
.chat-history-list .fans-medal-item-ctnr {
  display: none !important;
}`
    if (this._config.menu.noUserLevelIcon.enable) cssText += `
.chat-history-list .user-level-icon {
  display: none !important;
}`
    if (this._config.menu.noLiveTitleIcon.enable) cssText += `
.chat-history-list .title-label {
  display: none !important;
}`
    if (this._config.menu.noSystemMsg.enable) cssText += `
.bilibili-live-player-video-gift,
.chat-history-list .system-msg {
  display: none !important;
}`
    if (this._config.menu.noGiftMsg.enable) cssText += `
.chat-history-list .gift-item,
.bilibili-live-player-danmaku-gift,
.chat-history-panel .penury-gift-msg,
.haruna-sekai-de-ichiban-kawaii .super-gift-bubbles {
  display: none !important;
}
.chat-history-list.with-penury-gift {
  height: 100% !important;
}`
    elmStyle.innerHTML = cssText
  }
  /**
   * 添加按钮
   * 
   * @private
   * @memberof BiLiveNoVIP
   */
  private _AddUI() {
    // 获取按钮插入的位置
    let elmDivBtns = document.querySelector('.btns, .icon-left-part')
      // 传说中的UI, 真的很丑
      , elmDivGun = document.createElement('div')
      , elmDivMenu = document.createElement('div')
      , html = ''
    elmDivGun.id = 'gunBut'
    elmDivMenu.id = 'gunMenu'
    elmDivMenu.className = 'gunHide'
    // 循环插入内容
    for (let x in this._config.menu) {
      html += `
<div>
  <input type="checkbox" id="${x}" class="gunHide" />
	<label for="${x}"></label>
  <span>${this._config.menu[x].name}</span>
</div>`
    }
    elmDivMenu.innerHTML = html
    // 插入菜单按钮
    if (elmDivBtns != null) {
      elmDivGun.appendChild(elmDivMenu)
      elmDivBtns.appendChild(elmDivGun)
    }
    // 为了和b站更搭, 所以监听body的click
    document.body.addEventListener('click', (ev) => {
      let evt = <HTMLElement>ev.target
      if (elmDivGun.contains(evt)) {
        if (elmDivGun === evt) {
          elmDivMenu.classList.toggle('gunHide')
          elmDivGun.classList.toggle('gunActive')
        }
      }
      else {
        elmDivMenu.classList.add('gunHide')
        elmDivGun.classList.remove('gunActive')
      }
    })
    // 循环设置监听插入的DOM
    for (let x in this._config.menu) {
      let checkbox = <HTMLInputElement>document.getElementById(x)
      checkbox.checked = this._config.menu[x].enable
      checkbox.addEventListener('change', (ev) => {
        let evt = <HTMLInputElement>ev.target
        this._config.menu[evt.id].enable = evt.checked
        GM_setValue('blnvConfig', JSON.stringify(this._config))
        this._ChangeCSS()
      })
    }
  }
  /**
   * 添加样式
   * 
   * @private
   * @memberof BiLiveNoVIP
   */
  private _AddCSS() {
    let cssText = `
.gunHide {
  display: none;
}
#gunBut {
  border: 1.5px solid #c8c8c8;
  border-radius: 50%;
  color: #c8c8c8;
  cursor: default;
  display: inline-block;
  height: 18px;
  margin: 0 5px;
  vertical-align: middle;
  width: 18px;
}
#gunBut.gunActive,
#gunBut:hover {
  border: 1.5px solid #23ade5;
  color: #23ade5;
}
#gunBut:after {
  content: '滚';
  font-size: 13px;
  margin: 2px 2.5px;
  float: left;
}
#gunBut #gunMenu {
  animation: gunMenu .4s;
  background-color: #fff;
  border: 1px solid #e9eaec;
  border-radius: 8px;
  box-shadow: 0 6px 12px 0 rgba(106,115,133,.22);
  font-size: 12px;
  height: 185px;
  left: 0px;
  padding: 10px;
  position: absolute;
  text-align: center;
  top: -215px;
  transform-origin: 100px bottom 0px;
  width: 85px;
  z-index: 2;
}
#gunBut #gunMenu > div {
	background: darkgray;
	border-radius: 5px;
	height: 10px;
	margin: 0 0 12px 0;
	position: relative;
	width: 20px;
}
#gunBut #gunMenu > div > label {
	background: #e3ebec;
	border-radius: 50%;
	cursor: pointer;
	display: block;
	height: 16px;
	left: -3px;
	position: absolute;
	top: -3px;
	transition: all .5s ease;
	width: 16px;
}
#gunBut #gunMenu > div > input[type=checkbox]:checked + label {
  background: #4fc1e9;
	left: 7px;
}
#gunBut > #gunMenu > div > span {
  color: #666;
  left: 0;
  margin: -3px 0 0 20px;
  position: absolute;
  width: 80px;
}
@keyframes gunMenu {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    transform: scale(1.1);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}`
    // 插入css
    let elmStyle = document.createElement('style')
    elmStyle.innerHTML = cssText
    document.body.appendChild(elmStyle)
  }
}
const gun = new BiLiveNoVIP()
gun.Start()
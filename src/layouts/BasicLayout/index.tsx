import { Component, Vue } from 'vue-property-decorator'
import { Layout, Icon, Drawer } from 'ant-design-vue'
import { State, Action } from 'vuex-class'

import { siderMenu, deviceType, navLayout, tabMode } from '@/store/types'
import { theme } from '@/store/types'

import { SiderMenu, Logo, TabTool, RightBox, TabManager } from '@/components'
import { ContentLayout } from '@/layouts'

import styles from './index.less'

const { Content, Sider, Header } = Layout

@Component
export default class BasicLayout extends Vue {
  // 主题
  @State('theme') theme: theme;
  // 导航位置
  @State('navLayout') navLayout: navLayout;
  // 是否固定顶部
  @State('fixedHeader') fixedHeader: boolean;
  // 是否固定左侧menu
  @State('fixedLeftMenu') fixedLeftMenu: boolean;
  // 是否展示tab组件
  @State('tabTool') tabTool: boolean;
  // 当前激活状态的tab
  @State('tabActive') tabActive : string;
  // tab排列方式
  @State('tabMode') tabMode: tabMode;
  // 是否全局滚动
  @State('globalScroll') globalScroll: boolean;
  // 左侧siderMenu状态
  @State('siderMenu') siderMenu: siderMenu;
  // 当前客户端类型
  @State('deviceType') deviceType: deviceType;
  // 切换左侧menu的收折状态
  @Action('toggleSiderMenuCollapsed') toggleSiderMenuCollapsed!: Function;
  // 左侧menu展开二级菜单
  @Action('openSiderSubMenu') openSiderSubMenu!: Function;
  // 操作tab
  @Action('handleTab') handleTab!: Function;
  // 监听路由变化
  protected mounted() {
    this.$router.beforeEach(this.listenRouteChange)
    // 验证路由
    this.validateActiveRouter()
  }
  // 监听路由变化，统一维护tab的新增或者切换
  listenRouteChange(
    newpath: { [prospName: string]: any },
    _oldpath: any,
    next: Function
  ) {
    this.handleTab({
      id: newpath.name,
      keyPath: newpath.path
    })
    next()
  }
  // 验证当前路由是否与当前active的tab一致，若不一致，进行active tab path跳转
  validateActiveRouter() {
    // 不一致
    if (this.$route.name !== this.tabActive) this.$router.push({
      name: this.tabActive
    })
  }
  render() {
    // 获取需要实用的状态
    const {
      theme,
      tabMode,
      tabTool,
      navLayout,
      tabActive,
      deviceType,
      fixedHeader,
      globalScroll,
      siderMenu: {
        collapsed,
        menuTree,
        open
      },
      fixedLeftMenu
    } = this
    return <Layout>
      {
        // 非mobile设备
        navLayout === 'left' || deviceType === 'mobile'
        ? (deviceType !== 'mobile'
          ? (<Sider
              id="s_siderMenu"
              theme={theme}
              width="256"
              class={`${theme === 'light' ? styles.siderMenuWrap : ''} ${fixedLeftMenu ? styles.fixedLeftMenu : ''}`}
              trigger={null}
              collapsible
              collapsed={collapsed}>
              <Logo type="menu" theme={theme} />
              <div class={styles.leftMenuWrap}>
                <SiderMenu
                  open={open}
                  theme={theme}
                  menu={menuTree}
                  tabActive={tabActive}
                  class={styles.siderMenu}
                  openSiderSubMenu={this.openSiderSubMenu} />
              </div>
            </Sider>)
          : <Drawer
              width="256"
              placement="left"
              closable={false}
              visible={!collapsed}
              wrapClassName={styles[theme]}
              onClose={() => this.toggleSiderMenuCollapsed(deviceType)}>
              <Logo type="menu" theme={theme} />
              <SiderMenu
                open={open}
                theme={theme}
                menu={menuTree}
                tabActive={tabActive}
                class={styles.siderMenu}
                deviceType={this.deviceType}
                closeMenu={() => this.toggleSiderMenuCollapsed(deviceType)}
                openSiderSubMenu={this.openSiderSubMenu} />
          </Drawer>
        ) : null
      }
      <Layout
        class={ `${fixedHeader && !globalScroll ? styles.notGlobalScroll : ''}` }>
        {
          navLayout === 'left' || deviceType === 'mobile'
          ? <Header
            style={ fixedHeader && globalScroll ? { width: `calc(100% - ${collapsed ? deviceType === 'mobile' ? 0 : 80 : 256}px)` } : {} }
            class={`${styles.header} ${styles[theme+'Header']} ${fixedHeader && globalScroll ? styles.fixedHeader : ''}`}>
            <Icon
              title="切换"
              class={styles.trigger}
              type={deviceType === 'mobile' ? 'menu' : collapsed ? 'menu-unfold' : 'menu-fold'}
              onClick={() => this.toggleSiderMenuCollapsed(deviceType)} />
            {
              deviceType === 'desktop'
              ? <TabTool
                deviceType={deviceType}
                mode={tabMode}
                navLayout={navLayout}
                show={tabTool} />
              : null
            }
            <RightBox deviceType={deviceType} />
          </Header>
          : <Header
            style={ navLayout === 'top' && !globalScroll ? { position: 'relative' } : {} }
            class={`${styles.header} ${theme === 'light' ? styles.lightHeader : ''} ${fixedHeader ? styles.fixedHeader : ''}`}>
            <Logo type="top" theme={theme} />
            <div class={styles.navTop}>
              <SiderMenu
                top
                theme={theme}
                open={open}
                menu={menuTree}
                tabActive={tabActive}
                class={`${styles.siderMenu} ${styles.siderMenuTop} ${theme === 'dark' ? styles.siderMenuTopDark : ''}`}
                openSiderSubMenu={this.openSiderSubMenu} />
            </div>
            <RightBox
              top
              theme={theme}
              deviceType={deviceType} />
          </Header>
        }
        <Content
          class={
            `${navLayout === 'top' && deviceType === 'desktop' ? styles.contentTopNav : ''}
            ${fixedHeader && globalScroll ? styles.paddingTopHeader : ''}
            `
          }>
          {
            navLayout === 'top'
            && deviceType === 'desktop'
            ? <TabTool
              deviceType={deviceType}
              mode={tabMode}
              navLayout={navLayout}
              show={tabTool} />
            : deviceType !== 'desktop'
            ? <TabManager
              menuCollapsed={collapsed}
              deviceType={deviceType} /> : null
          }
          <ContentLayout />
        </Content>
      </Layout>
    </Layout>
  }
}
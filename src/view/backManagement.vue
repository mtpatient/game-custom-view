<script>
export default {
  name: "backManagement",
  data() {
    return {

    }
  },
  methods: {
    handleOpen(key, keyPath) {
      console.log(key, keyPath);
    },
    handleClose(key, keyPath) {
      console.log(key, keyPath);
    }
  }
}
</script>

<template>
  <div id="management">
    <el-container>
      <el-aside width="210px">
        <el-menu
            default-active="2"
            class="el-menu-vertical-demo"
            @open="handleOpen"
            @close="handleClose"
            background-color="#545c64"
            text-color="#fff"
            router
            active-text-color="#ffd04b">
          <el-submenu index="1">
            <template slot="title">
              <i class="el-icon-location"></i>
              <span>网站运营</span>
            </template>
            <el-menu-item-group>
              <template slot="title">分组一</template>
              <el-menu-item index="/back-Management/section">板块管理</el-menu-item>
              <el-menu-item index="/back-Management/avatar">头像管理</el-menu-item>
            </el-menu-item-group>
            <el-menu-item-group title="分组2">
              <el-menu-item index="1-3">选项3</el-menu-item>
            </el-menu-item-group>
          </el-submenu>
          <el-menu-item index="2">
            <i class="el-icon-menu"></i>
            <span slot="title">导航二</span>
          </el-menu-item>
          <el-menu-item index="3" disabled>
            <i class="el-icon-document"></i>
            <span slot="title">导航三</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container id="main-container">
        <router-view></router-view>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped>
#management {
  height: calc(100vh - 60px);
  width: calc(100vw - 22px);
  overflow-y: hidden;
  display: flex;
}

.el-aside {
  flex: 0 0 210px;
  background-color: #D3DCE6;
  color: #333;
  text-align: left;
  line-height: 200px;
  height: calc(100vh - 60px);
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
}

.el-menu-vertical-demo {
  height: 100%;
}

#main-container {
  width: 100%;
  //margin-left: 2px;
  background-color: white;
  border: 1px solid gray;
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3); /* 添加阴影效果 */;
}

body > .el-container {
  margin-bottom: 40px;
  height: 100vh;
  width: 100%;
}

.el-container:nth-child(5) .el-aside,
.el-container:nth-child(6) .el-aside {
  line-height: 200px;
}

.el-container:nth-child(7) .el-aside {
  line-height: 200px;
}
</style>
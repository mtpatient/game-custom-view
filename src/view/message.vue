<script>
export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "notice",
  data() {
    return {
      backImg: require("../assets/pns-bg-GELQYdT2.png")
    }
  },
  created() {
  },
  mounted() {
    const lis = document.querySelectorAll(".section-ul .menu-item");
    lis.forEach(li => {
      li.addEventListener("click", () => {
        let v = li.getAttribute('value')
        if (v === 'comment') {
          this.$router.push({
            path: '/message/comment'
          })
        } else if (v === 'like') {
          this.$router.push({
            path: '/message/like'
          })
        } else if (v === 'notice') {
          this.$router.push({
            path: '/message/notice'
          })
        }
        for (let i = 0; i < lis.length; i++) {
          if (lis[i].classList.contains('active')) {
            lis[i].classList.remove('active')
            break
          }
        }
        li.classList.add('active')
      })
    })

    const path = this.$route.path
    const li = document.querySelector(".section-ul .menu-item[value='"
        + path.split('/')[2] + "']")
    li.classList.add('active')
  },
  methods: {}
}
</script>

<template>
  <div class="main-container">
    <el-image class="back_img" :src="backImg"></el-image>
    <div class="main-container-section">
      <div class="main-box flex">
        <div class="aside-left">
          <div class="section-ul">
            <ul>
              <li class="menu-item" value="comment">
                <div class="flex-vertical-center">
                  <el-image class="menu-item-icon" :src="require('@/assets/icon/comment.png')">
                  </el-image>
                  <span class="menu-item-title">评论</span>
                </div>
              </li>
              <li class="menu-item" value="like">
                <div class="flex-vertical-center">
                  <el-image class="menu-item-icon" :src="require('@/assets/icon/like.png')">
                  </el-image>
                  <span class="menu-item-title">点赞</span>
                </div>
              </li>
              <li class="menu-item" value="notice">
                <div class="flex-vertical-center">
                  <el-image class="menu-item-icon" :src="require('@/assets/icon/follow.jpg')">
                  </el-image>
                  <span class="menu-item-title">通知</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div class="flex">
          <div class="main-section">
            <div class="main-content-section">
              <div class="main-content">
                <router-view></router-view>
              </div>
            </div>
          </div>
        </div>
        <!--        <div class="aide-right">-->
        <!--          <div class="inside-box">-->
        <!--            <div class="item"></div>-->
        <!--          </div>-->
        <!--        </div>-->
      </div>
    </div>
  </div>
</template>

<style scoped>
.back_img {
  position: fixed;
  top: 60px;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100vw;
  height: calc(100vh - 60px);
  background-color: #f7f8fa;
  object-fit: cover;
  z-index: -1;
  background-position: center;
  background-size: cover;
}

.flex {
  display: flex;
}

.main-container {
  height: 100vh;
  width: 99%;
}

.main-container-section {
  height: 100%;
  width: 1208px;
  margin: 0 auto;
  position: relative;
  justify-content: center;
  z-index: 0;
}

.main-box {
  position: relative;
  justify-content: center;
}

.aside-left {
  position: sticky;
  height: 100vh;
  left: 0;
  top: 76px;
  bottom: 0;
}

.aide-right {
  min-height: min(100vh - 60px - 18px - 24px, 100%);
  height: 100%;
  position: sticky;
  top: 76px;
  width: 304px;
  z-index: 0;
}

.section-ul {
  width: 220px;
  padding: 24px 12px;
  background-color: #fff;
  text-align: center;
  border-radius: 8px;
  min-height: calc(100vh - 102px);
  margin-right: 12px;
}

.main-section {
  z-index: 0;
  height: 100%;
  margin-right: 12px;
}

.main-content-section {
  width: 640px;
  min-height: 100vh;
  border-radius: 8px;
  padding-bottom: 20px;
}

.inside-box .item {
  width: 100%;
  height: 50px;
  background-color: #fff;
  border-radius: 8px;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-item:not(:last-child) {
  margin-bottom: 8px;
}

.menu-item {
  padding: 8px 32px;
  cursor: pointer;
  border-radius: 8px;
  font-size: 18px;
  line-height: 24px;
  font-weight: 500;
}

.flex-vertical-center {
  display: flex;
  align-items: center;
}

.menu-item-icon {
  height: 42px;
  width: 42px;
  margin-right: 12px;
  opacity: 0.6;
}

.menu-item-title {
  font-weight: 500;
  font-size: 16px;
  color: #aeb6c2;
}

.active .menu-item-title {
  color: #409EFF;
}

.active .menu-item-icon {
  opacity: 1;
}

.main-content {
  background-color: white;
  min-height: 700px;
  padding: 10px;
  margin-bottom: 50px;
  border-radius: 8px;
  margin-top: 16px;
}
</style>
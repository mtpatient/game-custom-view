<script>
import {debounce} from "@/js/util";

export default {
  name: "fansList",
  data() {
    return {
      fans: [],
      getParams: {
        id: this.$route.query.id,
        page_index: 1,
        page_size: 20,
      },
      loading: false,
      end: false,
      scroller: null,
    }
  },
  created() {
    this.getFans()
  },
  mounted() {
    this.$nextTick(() => {
      this.scroller = debounce(() => {
        this.loading = !this.end;
      }, this.handleScroll, 100)
      window.addEventListener('scroll', this.scroller)
    })
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.scroller)
  },
  methods: {
    handleScroll() {
      // 获取页面的滚动位置
      const scrollPosition = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;

      // 获取页面高度
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // 检查是否滚动到页面底部
      if (scrollPosition + windowHeight >= documentHeight && !this.end) {
        // 触发函数
        this.getParams.page_index++
        this.getFans()
        this.loading = false
      }
    },
    toUserDetail(id) {
      const page = this.$router.resolve({
        path: `/person-center/post`,
        query: {
          id: id
        }
      })

      window.open(page.href, '_blank')
    },
    handleFollow(f) {
      // console.log(f)
      if (f.is_follow === 0) {

        this.$axios.post(`/user/follow`, {
          id: f.id,
          operate: 1,
        }).then(res => {
          if (res.data.code === 0) {
            f.is_follow = 1
            this.$emit('change', 'follow', 1)
          } else {
            this.$message.error(res.data.msg)
          }
        })

      } else if (f.is_follow === 1) {
        this.$confirm('确定取消关注该用户吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
        }).then(() => {
          this.$axios.post(`/user/follow`, {
            id: f.id,
            operate: 2,
          }).then(res => {
            if (res.data.code === 0) {
              f.is_follow = 0
              this.$emit('change', 'follow', -1)
            } else {
              this.$message.error(res.data.msg)
            }
          })
        }).catch((err) => {
          console.log(err)
        })
      } else {
        this.$message.error('未知错误')
      }
    },
    getFans() {
      this.$axios.post('/follow/fans', this.getParams).then(res => {
        if (res.data.code === 0) {
          const fansList = res.data.data.fans_list
          if (fansList !== null) {
            this.fans.push(...fansList)
            if (fansList.length < this.getParams.page_size) {
              this.end = true
            }
          } else {
            this.end = true
          }
        } else {
          this.$message.error(res.data.msg)
        }
      })
    }
  }
}
</script>

<template>
  <div>
    <div class="content-item-title">
      <h2 class="title">粉丝</h2>
    </div>
    <div class="content">
      <ul>
        <li class="flex-between-center py-16 item"
            v-for="f in fans" :key="f.id">
          <div class="info-section flex-all-center pointer" @click="toUserDetail(f.id)">
            <div class="info-avatar mr-12">
              <el-image :src="f.avatar">
                <div slot="error" class="image-slot">
                  <el-image :src="require('@/assets/defalut_avatar.png')"></el-image>
                </div>
              </el-image>
            </div>
            <div class="info-content">
              <div class="info-name mb-2 text-16 txt-overflow-ellipsis-1">{{ f.username }}</div>
              <div v-if="f.signature !== ''"
                   class="info-signature text-12 txt-overflow-ellipsis-1">{{ f.signature }}
              </div>
              <div v-else class="info-signature text-12 txt-overflow-ellipsis-1">这个人很懒，暂无签名</div>
            </div>
          </div>
          <div class="handle-section">
            <el-button @click="handleFollow(f)" type="primary" size="mini" v-if="f.is_follow === 0">关注
            </el-button>
            <el-button @click="handleFollow(f)" type="info" size="mini" v-if="f.is_follow === 1">已关注</el-button>
          </div>
        </li>
      </ul>
      <p class="end" v-if="fans.length && loading">- 加载中 -</p>
      <p class="end" v-if="fans.length && end">- 暂无更多内容 -</p>
      <div v-if="!fans.length" class="no-content">
        <el-image style="margin-bottom: 24px;height: 168px;width: 195px"
                  :src="require('@/assets/no-content.png')"></el-image>
        <span style="font-weight: 400;
              color: #aeb6c2;font-size: 14px;
              line-height: 22px;">暂无内容</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.content-item-title {
  border-bottom: 1px solid #EDEFF5;
  padding-bottom: 20px;
}

.content-item-title .title {
  display: inline;
  width: 100%;
  font-size: 18px;
  line-height: 26px;
  font-weight: 700;
  color: #393f4d;
  margin: 0;
}

.content {
}

.no-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  word-break: break-word;
}

.end {
  text-align: center;
  font-weight: 400;
  color: #8c95a3;
  font-size: 14px;
  line-height: 22px;
  padding-top: 12px;
  padding-bottom: 12px;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.info-avatar {
  width: 54px;
  height: 54px;
  position: relative;
}

.pointer {
  cursor: pointer;
}

.info-avatar >>> img {
  border-radius: 50%;
}

.content .item:hover {
  .info-content .info-name {
    color: #1db5b8;
  }
}

.flex-all-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.flex-between-center {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.py-16 {
  padding-top: 12px;
  padding-bottom: 12px;
}

.mr-12 {
  margin-right: 12px;
}

.txt-overflow-ellipsis-1 {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mb-2 {
  margin-bottom: 2px;
}

.text-12 {
  font-size: 12px;
  line-height: 20px;
}

.text-16 {
  font-size: 16px;
  line-height: 24px;
}

.info-content .info-name {
  font-weight: 500;
  color: #393f4d;
  max-width: 414px;
}

.info-content .info-signature {
  font-weight: 400;
  color: #aeb6c2;
  max-width: 414px;
}
</style>
<script>
export default {
  name: "followList",
  data() {
    return {
      follows: []
    }
  },
  created() {
    this.$axios.get(`/follow/list/${this.$route.query.id}`).then(res => {
      if (res.data.code === 0) {
        if (res.data.data.follow_list !== null) {
          this.follows = res.data.data.follow_list
        }
      }
    })
  },
  methods: {
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
    }
  }
}
</script>

<template>
  <div>
    <div class="content-item-title">
      <h2 class="title">关注</h2>
    </div>
    <div class="content">
      <ul>
        <li class="flex-between-center py-16 item"
            v-for="f in follows" :key="f.id">
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
              <div class="info-signature text-12 txt-overflow-ellipsis-1">{{ f.signature }}</div>
            </div>
          </div>
          <div class="handle-section">
            <el-button @click="handleFollow(f)" type="primary" size="mini" v-if="f.is_follow === 0">关注
            </el-button>
            <el-button @click="handleFollow(f)" type="info" size="mini" v-if="f.is_follow === 1">已关注</el-button>
          </div>
        </li>
      </ul>
      <p class="end" v-if="follows.length">- 暂无更多内容 -</p>
      <div v-if="!follows.length" class="no-content">
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
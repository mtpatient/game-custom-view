<script>
import CommentShow from "@/components/CommentShow.vue";
import {debounce} from "@/js/util";

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "comments",
  components: {
    Comment: CommentShow
  },
  data() {
    return {
      comments: [],
      params: {
        id: this.$storage.get('user').id,
        page_index: 1,
        page_size: 10,
        show_type: 2, // 1: 我的评论， 2：回复我的
      },
      loading: false,
      end: false,
      scroller: null,
    }
  },
  created() {
    this.getMineComment()
    // this.$EventBus.$emit('read')
    this.$axios.get("/message/read/1").then(res => {
      if (res.data.code === 0) {
        this.$EventBus.$emit('read')
      }
    }).catch(err => {
      console.log(err)
    })
  },
  mounted() {
    this.$nextTick(() => {
      this.scroller = debounce(() => {
        this.loading = !this.end;
        // console.log(this.loading, this.end)
      }, this.handleScroll, 200)
      window.addEventListener('scroll', this.scroller)
    })
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.scroller)
  },
  methods: {
    handleScroll() {
      console.log('scroll', this.loading, this.end)
      // 获取页面的滚动位置
      const scrollPosition = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;

      // 获取页面高度
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // 检查是否滚动到页面底部
      if (scrollPosition + windowHeight >= documentHeight / 2 && !this.end) {
        // 触发函数
        this.params.page_index++
        this.getMineComment()
        this.loading = false
      }
    },
    getMineComment() {
      this.$axios.post('/comment/getMineComments', this.params).then(res => {
        if (res.data.code === 0) {
          const comments = res.data.data.comments
          if (comments != null) {
            this.comments.push(...comments)
            if (comments.length < this.params.page_size) {
              this.end = true
            }
          } else {
            this.end = true
          }
        }
        console.log(this.loading, this.end)
      }).catch(err => {
        console.log(err)
      })
    }
  }
}
</script>

<template>
  <div>
    <div class="content-item-title">
      <h2 class="title">评论</h2>
    </div>
    <div class="content">
      <ul class="list">
        <li v-for="comment in comments" :key="comment.id" class="item">
          <Comment :self="false"
                   :comment="comment"></Comment>
        </li>
      </ul>
      <p class="end" v-if="comments.length && loading">- 加载中 -</p>
      <p class="end" v-if="comments.length && end">- 暂无更多内容 -</p>
      <div v-if="!comments.length" class="no-content">
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

.item {
  padding: 20px 0;
}

.item:not(last-child) {
  border-bottom: 1px solid #ebebeb;
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
</style>
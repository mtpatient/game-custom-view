<script>
export default {
  name: "PostManagement",
  data() {
    return {
      params: {
        keyword: "",
        page_index: 1,
        page_size: 10,
        show_type: 1
      },
      posts: [],
      total: 0,
    }
  },
  created() {
    this.getPosts()
  },
  methods: {
    getPosts() {
      this.$axios.post("/post/bm/list", this.params).then(res => {
        if (res.data.code === 0) {
          this.posts = res.data.data.posts
          this.total = res.data.data.total
        } else {
          this.$message.error(res.data.msg)
        }
      }).catch(err => {
        console.log(err)
      })
    },
    ToUserDetail(id) {
      let page = this.$router.resolve({
        path: '/person-center/post',
        query: {id: id}
      })
      window.open(page.href, '_blank')
    },
    NextPage() {
      this.params.page_index += 1
      this.getPosts()
    },
    PrevPage() {
      this.params.page_index -= 1
      this.getPosts()
    },
    handleSizeChange(val) {
      this.params.page_index = 1
      this.params.page_size = val
      this.getPosts()
    },
    handleDelete(post) {
      this.$confirm('此操作将删除该帖子, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      }).then(() => {
        this.$axios.del(`/post/${post.id}`).then(res => {
          if (res.data.code === 0) {
            this.$message.success("删除成功！")
            post.status = 1
          } else {
            this.$message.error(res.data.msg)
          }
        }).catch(err => {
          console.log(err)
        })
      }).catch(err => {
        console.log(err)
      })
    },
    ToPostDetail(id) {
      const page = this.$router.resolve({
        path: '/post-detail/' + id,
      })
      window.open(page.href, '_blank')
    },
    handleRecover(post) {
      this.$confirm('此操作将恢复该帖子, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      }).then(() => {
        this.$axios.put(`/post/bm/status`, {
          id: post.id,
          status: 0,
        }).then(res => {
          if (res.data.code === 0) {
            this.$message.success("恢复成功！")
            post.status = 0
          }
        }).catch(err => {
          console.log(err)
        })
      }).catch(err => {
        console.log(err)
      })
    },
    handleTop(post) {
      if (post.top_section) {
        this.$axios.post('/post/top', {
          id: post.id,
          operate: 4,
        }).then(res => {
          if (res.data.code === 0) {
            this.$message.success('取消置顶成功！')
            post.top_section = 0
          } else {
            this.$message.error(res.data.msg)
          }
        }).catch(err => {
          console.log(err)
        })
      } else if (!post.top_self) {
        this.$axios.post('/post/top', {
          id: post.id,
          operate: 3,
        }).then(res => {
          if (res.data.code === 0) {
            this.$message.success('置顶成功！')
            post.top_section = 1
          } else {
            this.$message.error(res.data.msg)
          }
        }).catch(err => {
          console.log(err)
        })
      }
    },
  }
}
</script>

<template>
  <div class="container">
    <div class="table-container">
      <el-table
          :data="posts"
          stripe border
          height="700"
          max-width="100%"
          style="width: 100%"
      >
        <el-table-column label="ID" prop="id" width="100">
        </el-table-column>
        <el-table-column label="标题">
          <template slot-scope="scope">
            <el-button @click="ToPostDetail(scope.row.id)" size="mini" type="text">
              {{ scope.row.title }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="所属用户">
          <template slot-scope="scope">
            <el-button @click="ToUserDetail(scope.row.user_id)" size="mini" type="text">
              {{ scope.row.username }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="所属板块" prop="section"></el-table-column>
        <el-table-column sortable label="发布时间" prop="create_time">
        </el-table-column>
        <el-table-column sortable label="修改时间" prop="create_time">
        </el-table-column>
        <el-table-column sortable label="浏览数" prop="view_count">
        </el-table-column>
        <el-table-column sortable label="获赞数" prop="like_count">
        </el-table-column>
        <el-table-column label="置顶" width="60">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.top_section === 1" type="success">是</el-tag>
            <el-tag v-else type="info">否</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="68">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status === 0" type="success">正常</el-tag>
            <el-tag v-else-if="scope.row.status === 2" type="info">隐藏</el-tag>
            <el-tag v-else-if="scope.row.status === 3" type="waring">修正</el-tag>
            <el-tag v-else type="danger">禁用</el-tag>
          </template>
        </el-table-column>
        <el-table-column width="200"
            align="right">
          <template slot="header" slot-scope="scope">
            <el-input
                v-model="params.keyword"
                size="mini"
                @keyup.enter.native="getPosts"
                maxlength="20"
                placeholder="输入关键字搜索"/>
          </template>
          <template slot-scope="scope">
            <el-button
                size="mini"
                type="success"
                v-if="scope.row.top_section === 0"
                @click="handleTop(scope.row)"
            >置顶</el-button>
            <el-button
                size="mini"
                v-else
                @click="handleTop(scope.row)"
              >取消</el-button>
            <el-button
                size="mini"
                type="info"
                v-if="scope.row.status === 1 || scope.row.status === 3"
                @click="handleRecover(scope.row)">恢复
            </el-button>
            <el-button
                size="mini"
                type="danger"
                v-else
                @click="handleDelete(scope.row)">删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-pagination :total="total"
                   layout="sizes,prev,pager,next,jumper,total"
                   background
                   :page-sizes="[10, 20, 50]"
                   @size-change="handleSizeChange"
                   @current-change="getPosts"
                   :current-page.sync="params.page_index"
                   @prev-click="PrevPage"
                   @next-click="NextPage"></el-pagination>
  </div>
</template>

<style scoped>
.container {
  position: relative;
  padding: 10px;
  width: 100%;
}

.table-container {
  position: relative;
  width: 99.5%;
  height: 700px;
  overflow: auto;
  margin-bottom: 10px;
}
</style>
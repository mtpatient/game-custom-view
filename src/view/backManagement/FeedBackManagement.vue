<script>
export default {
  name: "FeedbackManagement",
  data() {
    return {
      params: {
        keyword: "",
        page_index: 1,
        page_size: 10,
        show_type: 1
      },
      list: [],
      total: 0,
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.$axios.post("/feedback/list", this.params).then(res => {
        if (res.data.code === 0) {
          this.list = res.data.data.list
          this.total = res.data.data.total
        } else {
          this.$message.error(res.data.msg)
        }
      }).catch(err => {
        console.log(err)
      })
    },
    NextPage() {
      this.params.page_index += 1
      this.getList()
    },
    PrevPage() {
      this.params.page_index -= 1
      this.getList()
    },
    handleSizeChange(val) {
      this.params.page_index = 1
      this.params.page_size = val
      this.getList()
    },
    ToUserDetail(id) {
      const page = this.$router.resolve({
        path: '/person-center/post',
        query: {
          id: id
        }
      })
      window.open(page.href, '_blank')
    },
    handlePreview() {
      console.log('图片预览已打开');
    },
  }
}
</script>

<template>
  <div class="container">
    <div class="table-container">
      <el-table
          :data="list"
          stripe border
          height="700"
          max-width="100%"
          style="width: 100%"
      >
        <el-table-column label="反馈者">
          <template slot-scope="scope">
            <el-button
                size="mini"
                type="text"
                @click="ToUserDetail(scope.row.user_id)"
            >{{ scope.row.username }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column sortable label="添加时间" prop="create_time">
        </el-table-column>
        <el-table-column label="反馈内容" prop="content">

        </el-table-column>
        <el-table-column
            align="center" label="反馈内容">
          <template slot="header" slot-scope="scope">
            <el-input
                v-model="params.keyword"
                size="mini"
                @keyup.enter.native="getList"
                maxlength="20"
                placeholder="输入关键字搜索"/>
          </template>
          <template slot-scope="scope">
            <el-image
                v-if="scope.row.images != null && scope.row.images.length !== 0"
                :src="require('@/assets/icon/View.png')"
                style="height: 10px;width: 20px"
                :preview-src-list="scope.row.images">
            </el-image>
<!--            <el-button v-if="scope" size="mini">查看图片</el-button>-->
            <p v-else style="font-size: 12px; color: #8c95a3">无图片</p>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-pagination :total="total"
                   layout="sizes,prev,pager,next,jumper,total"
                   background
                   :page-sizes="[10, 20, 50]"
                   @size-change="handleSizeChange"
                   @current-change="getList"
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
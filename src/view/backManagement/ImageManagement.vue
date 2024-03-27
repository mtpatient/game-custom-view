<script>
export default {
  name: "ImageManagement",
  data() {
    return {
      params: {
        keyword: "",
        page_index: 1,
        page_size: 10,
        show_type: 1
      },
      images: [],
      total: 0,
    }
  },
  created() {
    this.getImages()
  },
  methods: {
    getImages() {
      this.$axios.post("/img/postImages", this.params).then(res => {
        if (res.data.code === 0) {
          this.images = res.data.data.images
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
      this.getImages()
    },
    PrevPage() {
      this.params.page_index -= 1
      this.getImages()
    },
    handleSizeChange(val) {
      this.params.page_index = 1
      this.params.page_size = val
      this.getImages()
    },
    handleDelete(image) {
      this.$confirm('此操作将永久删除该图片, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      }).then(() => {
        this.$axios.del("/img/" + image.id).then(res => {
          if (res.data.code === 0) {
            this.$message.success("删除成功")
            this.getImages()
          } else {
            this.$message.error(res.data.msg)
          }
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
  }
}
</script>

<template>
  <div class="container">
    <div class="table-container">
      <el-table
          :data="images"
          stripe border
          height="700"
          max-width="100%"
          style="width: 100%"
      >
        <!--        <el-table-column label="ID" prop="id" width="100">-->
        <!--        </el-table-column>-->
        <el-table-column label="所属帖子">
          <template slot-scope="scope">
            <el-button @click="ToPostDetail(scope.row.post_id)" size="mini" type="text">
              {{ scope.row.title }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="图片" width="400">
          <template slot-scope="scope">
            <el-image style="height: 200px"
                      :src="scope.row.url"></el-image>
          </template>
        </el-table-column>
        <el-table-column sortable label="添加时间" prop="create_time">
        </el-table-column>
        <el-table-column
            align="right">
          <template slot="header" slot-scope="scope">
            <el-input
                v-model="params.keyword"
                size="mini"
                @keyup.enter.native="getImages"
                maxlength="20"
                placeholder="输入关键字搜索"/>
          </template>
          <template slot-scope="scope">
            <el-button
                size="mini"
                type="danger"
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
                   @current-change="getImages"
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
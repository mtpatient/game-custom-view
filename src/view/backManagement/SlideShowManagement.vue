<script>
import {handleImgCompress} from "@/js/util";

export default {
  name: "SectionComponent",
  data() {
    return {
      dialog_title: '',
      dialogFormVisible: false,
      form: {
        id: '',
        url: require('@/assets/upload.png'),
      },
      images: []
    }
  },
  created() {
    this.getSlideShow()
  },
  methods: {
    handleEdit(index, row) {
      this.dialog_title = '修 改'
      this.dialogFormVisible = true
      this.form.id = row.post_id
      this.form.url = row.url
    },
    handleDelete(image) {
      this.$confirm('此操作将永久删除该图片, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      }).then(() => {
        this.$axios.del("/img/" + image.id).then(res => {
          if (res.data.code === 0) {
            this.$message.success("删除成功")
            this.getSlideShow()
          } else {
            this.$message.error(res.data.msg)
          }
        })
      }).catch(err => {
        console.log(err)
      })
    },
    handleAdd() {
      if (this.images !== null && this.images.length > 6){
        this.$message.warning("轮播图最多保存7张！")
        return
      }
      // 初始化表单
      this.form.url = require('@/assets/upload.png')
      this.form.id = ''

      this.dialog_title = '添 加'
      this.dialogFormVisible = true
    },
    handleImgUpload() {
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', 'image/*');
      input.setAttribute('multiple', 'false')
      input.click();
      input.onchange = async () => {
        const files = input.files

        if (files.length > 0) {
          await handleImgCompress(files).then((files) => {
            this.$axios.getCOSSignature(files.length).then(res => {
              if (res.data.code === 0) {
                const signatures = res.data.data.signatures
                if (signatures !== null && signatures.length !== files.length) {
                  this.$message.error("请求错误")
                  return
                }

                this.$axios.putImg(signatures[0], files[0], () => {
                  let url = signatures[0].split('?') // 处理签名为url
                  this.form.url = url[0]
                })

              } else {
                this.$message.error('服务错误!')
              }
            })
          })
        }
      }
    },
    handleSubmit() {
      if (this.form.id === '') {
        this.$message.error('请输入帖子id!')
        return
      }
      if (this.form.url === require('@/assets/upload.png')) {
        this.$message.error('请上传图片！')
        return;
      }
      if (this.dialog_title === '添 加') {
        this.$axios.post('/img/slideshow', this.form).then(res => {
          if (res.data.code === 0) {
            this.$message.success('添加成功')
            this.getSlideShow()
          } else {
            this.$message.error(res.data.msg)
          }
        })
      } else {
        this.$axios.put('/img/slideshow', this.form).then(res => {
          if (res.data.code === 0) {
            this.$message.success('修改成功')
            this.getSlideShow()
          } else {
            this.$message.error(res.data.msg)
          }
        })
      }

      this.dialogFormVisible = false
    },
    getSlideShow() {
      this.$axios.get('/img/slideshow').then(res => {
        if (res.data.code === 0) {
          this.images = res.data.data.images
        } else {
          this.$message.error('获取板块列表错误!')
        }
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
    <el-table
        stripe border
        :data="images"
        style="width: 100%">
      <el-table-column
          label="创建日期"
          width="190">
        <template slot-scope="scope">
          <i class="el-icon-time"></i>
          <span style="margin-left: 10px">{{ scope.row.create_time }}</span>
        </template>
      </el-table-column>
      <el-table-column
          label="更新日期"
          width="190">
        <template slot-scope="scope">
          <i class="el-icon-time"></i>
          <span style="margin-left: 10px">{{ scope.row.update_time }}</span>
        </template>
      </el-table-column>
      <el-table-column
          label="图片"
      >
        <template slot-scope="scope">
          <el-image style="height: 200px;" lazy
                    :src="scope.row.url" fit="contain"></el-image>
        </template>
      </el-table-column>
      <el-table-column label="当前绑定"
                       width="200">
        <template slot-scope="scope">
          <el-button
              size="mini"
              type="text"
              @click="ToPostDetail(id)"
          >{{ scope.row.title}}</el-button>
        </template>
      </el-table-column>
      <el-table-column align="right" width="200">
        <template slot="header">
          <el-button type="primary"
                     icon="el-icon-circle-plus-outline"
                     @click="handleAdd"
          >添加
          </el-button>
        </template>
        <template slot-scope="scope">
          <el-button
              size="mini"
              type="success"
              @click="handleEdit(scope.$index, scope.row)">Edit
          </el-button>
          <el-button
              size="mini"
              type="danger"
              @click="handleDelete(scope.row)">Delete
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :title="dialog_title"
               :visible.sync="dialogFormVisible">
      <el-form>
        <el-form-item label="关联帖子ID（必填）">
          <el-input placeholder="请输入要关联的帖子id" v-model="form.id"></el-input>
        </el-form-item>
        <el-form-item label="上传图片（必填）">
          <el-image lazy @click="handleImgUpload" class="form-img" :src="form.url" fit="contain">
          </el-image>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="success" @click="handleSubmit">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.container {
  overflow-y: auto;
  //padding-bottom: 10px;
  padding: 10px;
  width: 100%;
  height: 100%;
}

.form-img {
  height: 300px;
  width: 300px;
  border: 1px dashed #8c95a3;
}

.form-img:hover {
  cursor: pointer;
}
</style>
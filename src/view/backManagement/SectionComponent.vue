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
        name: '',
        icon: require('@/assets/upload.png'),
        Dc: '',
        role: 2,
      },
      sections: []
    }
  },
  created() {
    this.getSections()
  },
  methods: {
    handleEdit(index, row) {
      this.dialog_title = '修 改 板 块'
      this.dialogFormVisible = true
      this.form.id = row.id
      this.form.name = row.name
      this.form.Dc = row.dc
      this.form.icon = row.icon
      this.form.role = row.role
    },
    handleDelete(index, row) {
      console.log(index, row);
    },
    handleAdd() {
      // 初始化表单
      this.form.icon = require('@/assets/upload.png')
      this.form.id = ''
      this.form.name = ''
      this.form.Dc = ''
      this.form.role = 2

      this.dialog_title = '添 加 板 块'
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
                  this.form.icon = url[0]
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
      if (this.form.name === '') {
        this.$message.error('板块名不能为空!')
        return
      }
      if (this.form.role === 2) {
        this.$message.error('请选择板块权限!')
        return;
      }
      if (this.form.icon === require('@/assets/upload.png')) {
        this.$message.error('需要上传图标！')
        return;
      }
      if (this.dialog_title === '添 加 板 块') {
        this.$axios.post('/section', this.form).then(res => {
          if (res.data.code === 0) {
            this.$message.success('添加成功')
            this.getSections()
          } else {
            this.$message.error('添加失败')
          }
        })
      } else {
        this.$axios.put('/section', this.form).then(res => {
          if (res.data.code === 0) {
            this.$message.success('修改成功')
            this.getSections()
          } else {
            this.$message.error('修改失败')
          }
        })
      }

      this.dialogFormVisible = false
    },
    getSections() {
      this.$axios.get('/section/all').then(res => {
        if (res.data.code === 0) {
          this.sections = res.data.data.sections
        } else {
          this.$message.error('获取板块列表错误!')
        }
      }).catch(err => {
        console.log(err)
      })
    }
  }
}
</script>

<template>
  <div class="container">
    <el-table
        :data="sections"
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
          label="板块名"
          width="100" prop="name">
      </el-table-column>
      <el-table-column
          label="图标"
          width="180">
        <template slot-scope="scope">
          <el-image style="height: 100px; width: 100px" lazy
                    :src="scope.row.icon" fit="contain"></el-image>
        </template>
      </el-table-column>
      <el-table-column
          label="官方板块"
          width="180">
        <template slot-scope="scope">
          {{ scope.row.role === 1 ? '是' : '否' }}
        </template>
      </el-table-column>
      <el-table-column
          label="DC"
          width="180" prop="dc">
      </el-table-column>
      <el-table-column align="right">
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
          <!--          <el-button-->
          <!--              size="mini"-->
          <!--              type="danger"-->
          <!--              @click="handleDelete(scope.$index, scope.row)">Delete-->
          <!--          </el-button>-->
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :title="dialog_title"
               :visible.sync="dialogFormVisible">
      <el-form>
        <el-form-item label="板块名称（必填）">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="板块描述（选填）">
          <el-input v-model="form.Dc"></el-input>
        </el-form-item>
        <el-form-item label="官方板块（必选）">
          <el-radio-group v-model="form.role">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="图标（必填）">
          <el-image lazy @click="handleImgUpload" class="form-img" :src="form.icon" fit="contain">
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
  height: 100px;
  width: 100px;
  border: 1px dashed gray;
}

.form-img:hover {
  cursor: pointer;
}
</style>
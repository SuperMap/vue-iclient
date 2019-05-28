import { FileTypes, FileConfig } from './FileTypes';
/**
 * @class FileModel
 * @description 文件数据微件数据模型，用于存储一些文件数据或状态，todo 结构待完善
 * @category Components OpenFile
 * @private
 */
export default class FileModel {
  constructor(options) {
    this.fileTypes = FileTypes;
    this.fileConfig = FileConfig;
    this.loadFileObject = options && options.loadFileObject ? options.loadFileObject : [];
  }

  /**
     * @function FileModel.prototype.set
     * @description 设置属性值
     * @param {string} key - 属性名称
     * @param {string|Object} value - 属性值
     */
  set(key, value) {
    this[key] = value;
  }

  /**
     * @function FileModel.prototype.get
     * @description 获取数据值
     * @param {string} key - 属性名称
     * @returns {string|Object} value - 返回属性值
     */
  get(key) {
    return this[key];
  }
}

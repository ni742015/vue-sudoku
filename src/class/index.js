/**
 * Created by yonghuapro on 2017/8/9.
 */
import common from "../common"


// 每格对应数据
export class Grid {
    constructor(isAvailable = false, isWrong = false, text = "", userText = "") {
        this.isAvailable = isAvailable;//是否可填
        this.isWrong = isWrong;//是否错误
        this.userText = userText;//用户填写数据
        this.text = text;
    }

}

export class GridList {
    constructor(baseDataList = [1, 2, 3, 4, 5, 6, 7, 8, 9],
                cacheLength = 8,
                maxFailCount = 30,) {
        this.baseDataList = baseDataList; //基础数据（9位）
        this.cacheLength = cacheLength; //记录几条已填数据用于回退,数字越大成功率越高（最大有效数字8）
        this.maxFailCount = maxFailCount; //最大失败次数

        this.ROWS = 9;
        this.COLS = 9;
        this.gridList = [];
        this.beforeGridDataList = [];
        this.initCount = 0;

    };

    init() {
        this.beforeGridDataList = [];
        this.initGridList();

        return this.initGridData();

    };

    initGridList(dataList) {
        this.gridList = [];

        //生成大体布局
        for (let i = 0; i < this.ROWS; i++) {
            let rowList = [];
            for (let j = 0; j < this.COLS; j++) {
                let data = new Grid();
                if (dataList) {
                    data["text"] = this.baseDataList[dataList[i][j] - 1];
                }
                rowList.push(data);
            }
            this.gridList.push(rowList);
        }

        return this.gridList;

    };

    initGridData() {
        this.initCount++;
        if (this.initCount > this.maxFailCount) {
            // console.warn("initCount", this.initCount)

            return null;
        }

        this.initGridList();

        //创建成功返回数据失败则重新创建
        if (this.createGridData()) {
            // console.log(JSON.stringify(this.gridList));
            return this.gridList;
        } else {
            return this.initGridData();
        }

    };

    createGridData() {
        //重头开始生成
//                for (let i = 0; i < ROWS; i++) {
//                    for (let j = 0; j < COLS; j++) {
//                        let validData = this.getValidData(i, j);
//                        if (validData && validData.data) {
//                            console.log(validData);
//                            this.gridList[i][j]["text"] = validData.data;
//
//                            this.addCacheData(i, j, validData);
//
//                        } else {
//                            console.warn("no validData");
////                            如果此格没有可填数据则回退一格计算
//                            let gridData = this.rollBack();
////                            console.warn("gridData", gridData);
//                            if (gridData) {
//                                i = gridData.row;
//                                j = gridData.col;
//                                this.gridList[i][j]["text"] = gridData.validData.data;
//                                this.addCacheData(i, j, gridData.validData);
//
//                            } else {
//                                failCount++;
//                                console.warn("really no validData");
//                                return null;
//                            }
//                        }
//
//                    }
//                };


        //按九宫格生成
        //循环3列
        for (let i = 0; i < this.ROWS; i = i + 3) {
            for (let j = 0; j < this.COLS; j = j + 3) {
                this.beforeGridDataList = [];

                if (!this.createGridDataByRange(i, i + 3, j, j + 3))
                    return;
            }
        }

        return true;

    };


    createGridDataByRange(rowStart, rowEnd, colStart, colEnd) {
        for (let i = rowStart; i < rowEnd; i++) {
            for (let j = colStart; j < colEnd; j++) {
                // console.warn("createGridDataByRange  i",i,"j",j);
                let validData = this.getValidData(i, j);
                if (validData && validData.data) {
                    // console.log(validData);
                    this.gridList[i][j]["text"] = validData.data;

                    this.addCacheData(i, j, validData);

                } else {
                    console.warn("no validData");
                    // 如果此格没有可填数据则回退一格计算
                    let gridData = this.rollBack();
                    // console.warn("gridData", gridData);
                    if (gridData) {
                        i = gridData.row;
                        j = gridData.col;
                        this.gridList[i][j]["text"] = gridData.validData.data;
                        this.addCacheData(i, j, gridData.validData);

                    } else {
                        // console.warn("really no validData");
                        return null;
                    }
                }

            }
        }
        ;

        return true;
    };

    addCacheData(i, j, validData) {
        this.beforeGridDataList.unshift({row: i, col: j, validData});
        if (this.beforeGridDataList.length > this.cacheLength) {
            this.beforeGridDataList.length = this.cacheLength;

        }
        // console.log("this.beforeGridDataList", JSON.parse(JSON.stringify(this.beforeGridDataList)))

    };

    rollBack() {

        if (this.beforeGridDataList.length > 0) {
            // console.warn("rollBack", JSON.parse(JSON.stringify(this.beforeGridDataList)))
            let beforeGridData = this.beforeGridDataList.shift();

            let beforeValidList = beforeGridData.validData.list;

            if (beforeValidList.length > 0) {
                let data = beforeValidList[common.getRandom(beforeValidList.length)];
                beforeValidList.splice(beforeValidList.indexOf(data), 1);
                return {
                    row: beforeGridData.row,
                    col: beforeGridData.col,
                    validData: {data, list: beforeValidList}
                }

            } else {
                return this.rollBack();

            }
        } else {
            return null;
        }
    };


    //获取有效数据
    getValidData(row, col) {
        let unUseRowList = this.getNoRepeatData(row, col, 1);
        let unUseColList = this.getNoRepeatData(row, col, 2);
        let unUseGroupList = this.getNoRepeatData(row, col, 3);

        if (unUseRowList.length > 0 &&
            unUseColList.length > 0 &&
            unUseGroupList.length > 0) {
            let validList = common.getIntersectionList(unUseRowList, unUseColList, unUseGroupList)

            let validData = validList[common.getRandom(validList.length)];
            validList.splice(validList.indexOf(validData), 1);
            return {data: validData, list: validList}
        } else {
            return null;
        }
    };

    //生成不重复的数据
    getNoRepeatData(row, col, type) {

        let baseDataList = this.baseDataList;

        //1.每行不能重复
        //2.每列不能重复
        //3.每个9宫格不能重复
        if (type === 1) {
            //筛选出有值的对象
            // debugger
            let exitDataList = this.gridList[row].filter((item, i) => {
                if (item && i !== col)
                    return item["text"];
            });

            return this.getUnUseDataList(exitDataList, baseDataList);
        } else if (type === 2) {
            let colDataList = this.gridList.map(item => {
                return (item.filter((subItem, index) => {
                    return index === col;
                }))[0]
            });
            //筛选出有值的对象
            let exitDataList = colDataList.filter((item, i) => {
                if (item && i !== row)
                    return item["text"];
            });

            return this.getUnUseDataList(exitDataList, baseDataList);
        } else if (type === 3) {
            let rowRange = [(row / 3 | 0) * 3, (row / 3 | 0) * 3 + 3];
            let colRange = [(col / 3 | 0) * 3, (col / 3 | 0) * 3 + 3];
            // console.log(rowRange, colRange);

            let exitDataList = [];

            for (let i = rowRange[0]; i < rowRange[1]; i++) {
                for (let j = colRange[0]; j < colRange[1]; j++) {
                    let item = this.gridList[i][j];
                    if (item && (i !== row || j !== col))
                        exitDataList.push(item);
                }
            }
            // console.log(exitDataList);

            return this.getUnUseDataList(exitDataList, baseDataList);

        }

    };

    //获取未使用的基础数据
    getUnUseDataList(exitDataList, allDataList) {
        //转成字符串数组
        let exitStrList = exitDataList.map(item => {
            return item["text"];
        });

        // console.log("exitStrList",exitStrList);

        let unUseDataList = allDataList.filter(str => {
            return exitStrList.indexOf(str) < 0
        });
        // console.log("unUseDataList",unUseDataList);

        return unUseDataList;
    };

}